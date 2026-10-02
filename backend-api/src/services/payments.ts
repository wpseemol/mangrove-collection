import type { Order, Payment, PaymentAccount, User } from '../generated/prisma/client.js'
import { HttpError, fail } from '../lib/http.js'
import { report } from '../lib/log.js'
import { prisma, type Tx } from '../lib/prisma.js'
import { formatNumber } from '../lib/str.js'
import { acceptsPaymentSubmission, isWallet } from '../resources/index.js'
import { settings } from './settings.js'
import { sms } from './sms.js'

export const PAYMENT_METHODS = ['cod', 'bkash', 'nagad', 'rocket'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_LABELS: Record<PaymentMethod, string> = { cod: 'Cash on delivery', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' }
export const methodLabel = (method: string) => PAYMENT_LABELS[method as PaymentMethod] ?? method

const activeAccounts = (method?: string) => ({ is_active: true, ...(method ? { method } : {}) })

async function lockOrder(tx: Tx, orderId: bigint): Promise<Order> {
  await tx.$queryRaw`SELECT id FROM orders WHERE id = ${orderId} FOR UPDATE`
  return tx.order.findUniqueOrThrow({ where: { id: orderId } })
}

/**
 * Manual wallet payments: the customer sends money to a store account, submits the
 * transaction ID, and staff verify it against the wallet statement.
 */
export const payments = {
  /** Methods a customer can choose at checkout, with the accounts to pay into. */
  async availableMethods(): Promise<{ method: PaymentMethod; accounts: PaymentAccount[] }[]> {
    const accounts = await prisma.paymentAccount.findMany({ where: activeAccounts(), orderBy: [{ sort_order: 'asc' }, { id: 'asc' }] })
    const codEnabled = Boolean(await settings.get('cod_enabled', true))

    return PAYMENT_METHODS.filter((method) => (isWallet(method) ? accounts.some((account) => account.method === method) : codEnabled)).map((method) => ({
      method,
      accounts: accounts.filter((account) => account.method === method),
    }))
  },

  async isAvailable(method: PaymentMethod): Promise<boolean> {
    return (await this.availableMethods()).some((option) => option.method === method)
  },

  /** The active account the customer says they paid into; it must belong to the chosen wallet. */
  async resolveAccount(method: PaymentMethod, accountId: number | null | undefined): Promise<PaymentAccount> {
    const account = accountId
      ? await prisma.paymentAccount.findFirst({ where: { ...activeAccounts(method), id: accountId } })
      : await prisma.paymentAccount.findFirst({ where: activeAccounts(method), orderBy: [{ sort_order: 'asc' }, { id: 'asc' }] })

    if (!account) fail('payment_account_id', `This ${PAYMENT_LABELS[method]} account is no longer available. Please refresh and choose again.`)
    return account!
  },

  /** Records a transaction ID for review. Call inside a transaction holding a lock on the order. */
  async submit(tx: Tx, order: Order, account: PaymentAccount, transactionId: string, senderNumber: string): Promise<Payment> {
    if (!acceptsPaymentSubmission(order)) {
      fail(
        'transaction_id',
        order.payment_status === 'verifying'
          ? 'We are already checking a payment for this order.'
          : order.payment_status === 'paid'
            ? 'This order is already paid.'
            : 'This order can no longer accept a payment.',
      )
    }

    const used = await tx.$queryRaw<{ id: bigint }[]>`
      SELECT id FROM payments WHERE method = ${account.method} AND transaction_id = ${transactionId} AND status <> 'rejected' LIMIT 1 FOR UPDATE`
    if (used.length > 0) fail('transaction_id', 'This transaction ID has already been used for another payment.')

    const payment = await tx.payment.create({
      data: {
        order_id: order.id,
        payment_account_id: account.id,
        method: account.method,
        account_type: account.account_type,
        account_number: account.account_number,
        amount: order.total,
        currency: order.currency,
        sender_number: senderNumber,
        transaction_id: transactionId,
        status: 'submitted',
      },
    })

    await tx.order.update({ where: { id: order.id }, data: { payment_method: account.method, payment_status: 'verifying' } })
    order.payment_method = account.method
    order.payment_status = 'verifying'

    return payment
  },

  /** Customer re-submits after a rejection (or pays later for an order placed without paying). */
  async resubmit(orderId: bigint, accountId: number, transactionId: string, senderNumber: string): Promise<Payment> {
    return prisma.$transaction(async (tx) => {
      const order = await lockOrder(tx, orderId)
      const account = await tx.paymentAccount.findFirst({ where: { id: accountId, is_active: true } })
      if (!account) fail('payment_account_id', 'This account is no longer available. Please refresh and choose again.')

      return this.submit(tx, order, account!, transactionId, senderNumber)
    })
  },

  async verify(paymentId: bigint, reviewer: User): Promise<Payment & { order: Order }> {
    const payment = await prisma.$transaction(async (tx) => {
      const current = await lockForReview(tx, paymentId)
      const order = await lockOrder(tx, current.order_id)

      const updated = await tx.payment.update({
        where: { id: current.id },
        data: { status: 'verified', rejection_reason: null, reviewed_by: reviewer.id, reviewed_at: new Date() },
      })
      const savedOrder = await tx.order.update({
        where: { id: order.id },
        data: { payment_status: 'paid', ...(order.status === 'pending' ? { status: 'processing' } : {}) },
      })

      return { ...updated, order: savedOrder }
    })

    await notify(payment, 'sms_payment_verified_template')
    return payment
  },

  async reject(paymentId: bigint, reviewer: User, reason: string): Promise<Payment & { order: Order }> {
    const payment = await prisma.$transaction(async (tx) => {
      const current = await lockForReview(tx, paymentId)
      let order = await lockOrder(tx, current.order_id)

      const updated = await tx.payment.update({
        where: { id: current.id },
        data: { status: 'rejected', rejection_reason: reason, reviewed_by: reviewer.id, reviewed_at: new Date() },
      })

      if (order.payment_status === 'verifying') order = await tx.order.update({ where: { id: order.id }, data: { payment_status: 'failed' } })

      return { ...updated, order }
    })

    await notify(payment, 'sms_payment_rejected_template')
    return payment
  },
}

async function lockForReview(tx: Tx, paymentId: bigint): Promise<Payment> {
  await tx.$queryRaw`SELECT id FROM payments WHERE id = ${paymentId} FOR UPDATE`
  const payment = await tx.payment.findUnique({ where: { id: paymentId } })
  if (!payment) throw new HttpError(404, 'Resource not found.')
  if (payment.status !== 'submitted') throw new HttpError(409, `This payment was already ${payment.status}.`)
  return payment
}

async function notify(payment: Payment & { order: Order }, template: string): Promise<void> {
  try {
    if (!(await sms.enabled())) return

    const order = payment.order
    await sms.send(
      order.customer_phone,
      await sms.render(template, {
        name: order.customer_name,
        order_number: order.order_number,
        method: methodLabel(payment.method),
        amount: formatNumber(Number(payment.amount)),
        currency: payment.currency,
        reason: payment.rejection_reason ?? '',
      }),
    )
  } catch (error) {
    report(error)
  }
}
