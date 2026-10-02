import type { Order, ProductReview, User } from '../generated/prisma/client.js'
import { decryptString, encryptString } from '../lib/crypt.js'
import { isEmail } from '../validation/rules.js'

const TOKEN_TTL_MINUTES = 30

/**
 * Who is reviewing: a signed-in account and/or the phone or email used on an order.
 *
 * After a successful check the identity travels as an encrypted, expiring token
 * (`X-Review-Token`) bound to one product, so writing, editing and deleting a
 * review never needs the contact again and cannot be forged or reused elsewhere.
 */
export class ReviewerIdentity {
  static readonly TOKEN_TTL_SECONDS = TOKEN_TTL_MINUTES * 60

  private constructor(
    readonly userId: bigint | null,
    readonly phone: string | null,
    readonly email: string | null,
  ) {}

  /** Accepts one input: a Bangladeshi mobile number (any common format) or an email address. */
  static fromContact(contact: string): ReviewerIdentity | null {
    const value = contact.trim()

    if (value.includes('@')) {
      const email = value.toLowerCase()
      return isEmail(email) ? new ReviewerIdentity(null, null, email) : null
    }

    const phone = ReviewerIdentity.normalizePhone(value)
    return phone ? new ReviewerIdentity(null, phone, null) : null
  }

  static fromUser(user: User): ReviewerIdentity {
    return new ReviewerIdentity(user.id, ReviewerIdentity.normalizePhone(user.phone), user.email ? user.email.toLowerCase() : null)
  }

  /** "+880 1712-345678", "8801712345678", "1712345678" → "01712345678"; anything else → null. */
  static normalizePhone(value: string | null | undefined): string | null {
    if (value === null || value === undefined || !/^[\d\s\-()+]{10,20}$/.test(value.trim())) return null

    let digits = value.replace(/\D/g, '')
    if (digits.length === 13 && digits.startsWith('880')) digits = digits.slice(2)
    else if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`

    return /^01[3-9]\d{8}$/.test(digits) ? digits : null
  }

  static normalizeEmail(value: string | null | undefined): string | null {
    return value && value.trim() !== '' ? value.trim().toLowerCase() : null
  }

  /**
   * SQL condition limiting orders (alias `o`) to this identity. Phone numbers are stored as typed,
   * so the SQL match is a digits-only suffix that the caller confirms with {@link matchesOrder}.
   */
  orderCondition(): { sql: string; params: unknown[] } {
    const parts: string[] = []
    const params: unknown[] = []

    if (this.userId) {
      parts.push('o.user_id = ?')
      params.push(this.userId)
    }
    if (this.email) {
      parts.push('LOWER(o.customer_email) = ?')
      params.push(this.email)
    }
    if (this.phone) {
      parts.push("REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(o.customer_phone, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '') LIKE ?")
      params.push(`%${this.phone.slice(1)}`)
    }

    return parts.length ? { sql: `(${parts.join(' OR ')})`, params } : { sql: '1 = 0', params }
  }

  matchesOrder(order: Pick<Order, 'user_id' | 'customer_email' | 'customer_phone'>): boolean {
    return Boolean(
      (this.userId && order.user_id === this.userId) ||
        (this.email && ReviewerIdentity.normalizeEmail(order.customer_email) === this.email) ||
        (this.phone && ReviewerIdentity.normalizePhone(order.customer_phone) === this.phone),
    )
  }

  /** Prisma `where` for reviews written by this identity. */
  reviewWhere() {
    const or: object[] = []
    if (this.userId) or.push({ user_id: this.userId })
    if (this.email) or.push({ reviewer_email: this.email })
    if (this.phone) or.push({ reviewer_phone: this.phone })
    return or.length ? { OR: or } : { id: -1n }
  }

  owns(review: Pick<ProductReview, 'user_id' | 'reviewer_email' | 'reviewer_phone'>): boolean {
    return Boolean(
      (this.userId && review.user_id === this.userId) || (this.email && review.reviewer_email === this.email) || (this.phone && review.reviewer_phone === this.phone),
    )
  }

  toToken(productId: bigint): string {
    return encryptString(
      JSON.stringify({
        p: Number(productId),
        u: this.userId === null ? null : Number(this.userId),
        ph: this.phone,
        em: this.email,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_MINUTES * 60,
      }),
    )
  }

  static fromToken(token: string | undefined | null, productId: bigint): ReviewerIdentity | null {
    if (!token || token.trim() === '' || token.length > 2048) return null

    let data: Record<string, unknown>
    try {
      data = JSON.parse(decryptString(token))
    } catch {
      return null
    }

    if (!data || typeof data !== 'object' || data.p !== Number(productId) || Number(data.exp ?? 0) < Math.floor(Date.now() / 1000)) return null

    const identity = new ReviewerIdentity(
      Number.isInteger(data.u) ? BigInt(data.u as number) : null,
      typeof data.ph === 'string' ? data.ph : null,
      typeof data.em === 'string' ? data.em : null,
    )

    return identity.userId || identity.phone || identity.email ? identity : null
  }
}
