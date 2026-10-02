import { beforeEach, describe, expect, it } from 'vitest'
import { decryptString } from '../src/lib/crypt.js'
import { prisma } from '../src/lib/prisma.js'
import { mailFrom, mailTransport } from '../src/services/mail.js'
import { SECRET_MASK, settings } from '../src/services/settings.js'
import { makeAdmin, makeManager, makeUser } from './factories.js'
import { actingAs, client, expectErrors, expectStatus, fakeHttp } from './helpers.js'

beforeEach(async () => {
  await settings.syncDefaults()
})

const admin = async () => actingAs(await makeAdmin())

describe('settings', () => {
  it('exposes seo tags publicly but never secrets', async () => {
    await settings.update({
      facebook_pixel_id: '1234567890',
      google_client_secret: 'super-secret',
      mail_password: 'smtp-secret',
      sms_api_key: 'sms-secret',
    })

    const res = await client().get('/v1/settings')
    expectStatus(res, 200)
    expect(res.body.data).toMatchObject({ facebook_pixel_id: '1234567890', site_name: 'Mangrove Collection' })

    for (const key of ['google_client_secret', 'mail_password', 'mail_host', 'sms_api_key', 'sms_api_url']) expect(res.body.data).not.toHaveProperty(key)
    expect(res.text).not.toContain('super-secret')
  })

  it('lets an admin update settings and encrypts and masks secrets', async () => {
    const browser = await admin()

    const res = await browser.put('/v1/admin/settings', {
      settings: {
        site_name: 'Mangrove',
        mail_mailer: 'smtp',
        mail_host: 'smtp.mailgun.org',
        mail_port: 465,
        mail_encryption: 'ssl',
        mail_password: 'p@ss',
        mail_from_address: 'shop@mangrove-collection.com',
      },
    })
    expectStatus(res, 200)
    expect(res.body.data.general.site_name.value).toBe('Mangrove')
    expect(res.body.data.mail.mail_password.value).toBe(SECRET_MASK)

    const stored = (await prisma.setting.findUniqueOrThrow({ where: { key: 'mail_password' } })).value!
    expect(stored).not.toBe('p@ss')
    expect(decryptString(stored)).toBe('p@ss')

    // The mailer is configured from the database values without any .env change.
    const transport = await mailTransport()
    expect(transport).toMatchObject({ kind: 'smtp', options: { host: 'smtp.mailgun.org', port: 465, secure: true } })
    expect((await mailFrom()).address).toBe('shop@mangrove-collection.com')

    // Echoing the mask back must not overwrite the stored secret.
    expectStatus(await browser.put('/v1/admin/settings', { settings: { mail_password: SECRET_MASK } }), 200)
    expect(await settings.get('mail_password')).toBe('p@ss')
  })

  it('rejects unknown keys and invalid values', async () => {
    expectErrors(
      await (await admin()).put('/v1/admin/settings', { settings: { not_a_setting: 'x', mail_port: 'abc', sms_driver: 'carrier-pigeon' } }),
      ['settings.not_a_setting', 'settings.mail_port', 'settings.sms_driver'],
    )
  })

  it('makes the whatsapp button settings public and editable', async () => {
    const before = await client().get('/v1/settings')
    expectStatus(before, 200)
    expect(before.body.data).toMatchObject({ whatsapp_number: null, whatsapp_button_enabled: true, whatsapp_button_position: 'right' })

    const res = await (await admin()).put('/v1/admin/settings', {
      settings: {
        whatsapp_number: '+880 1712-345678',
        whatsapp_message: 'Hi! I want to order honey.',
        whatsapp_button_enabled: false,
        whatsapp_button_position: 'left',
      },
    })
    expectStatus(res, 200)
    expect(res.body.data.whatsapp.whatsapp_number.value).toBe('+880 1712-345678')

    expect((await client().get('/v1/settings')).body.data).toMatchObject({
      whatsapp_number: '+880 1712-345678',
      whatsapp_message: 'Hi! I want to order honey.',
      whatsapp_button_enabled: false,
      whatsapp_button_position: 'left',
    })
  })

  it('requires an international whatsapp number', async () => {
    const browser = await admin()

    for (const number of ['01712345678', 'call me', '+0 1712', '+88017123456789012']) {
      expectErrors(await browser.put('/v1/admin/settings', { settings: { whatsapp_number: number } }), 'settings.whatsapp_number')
    }

    expectErrors(
      await browser.put('/v1/admin/settings', { settings: { whatsapp_message: '<script>alert(1)</script>', whatsapp_button_position: 'center' } }),
      ['settings.whatsapp_message', 'settings.whatsapp_button_position'],
    )
  })

  it('strictly validates social links and the cod toggle', async () => {
    const browser = await admin()

    expectErrors(
      await browser.put('/v1/admin/settings', {
        settings: {
          social_links: { facebook: 'javascript:alert(1)', myspace: 'https://myspace.com/x' },
          cod_enabled: 'sometimes',
          contact_phone: 'not a phone',
        },
      }),
      ['settings.social_links', 'settings.social_links.facebook', 'settings.cod_enabled', 'settings.contact_phone'],
    )

    expectStatus(
      await browser.put('/v1/admin/settings', {
        settings: {
          social_links: { facebook: 'https://facebook.com/mangrove', youtube: 'https://youtube.com/@mangrove' },
          cod_enabled: false,
          contact_phone: '+880 1712-345678',
        },
      }),
      200,
    )

    const res = await client().get('/v1/settings')
    expect(res.body.data.social_links.facebook).toBe('https://facebook.com/mangrove')
    expect(res.body.data.cod_enabled).toBe(false)
  })

  it('lets only admins read or change settings', async () => {
    const manager = await actingAs(await makeManager())
    expectStatus(await manager.get('/v1/admin/settings'), 403)
    expectStatus(await manager.put('/v1/admin/settings', { settings: { site_name: 'Hacked' } }), 403)

    expectStatus(await (await actingAs(await makeUser())).get('/v1/admin/settings'), 403)

    expect(await settings.get('site_name')).toBe('Mangrove Collection')
  })

  it('uses the database credentials for the sms gateway test', async () => {
    const sent = fakeHttp()
    const browser = await admin()

    await settings.update({ sms_driver: 'http', sms_api_url: 'https://sms.example.com/api', sms_api_key: 'key-123', sms_sender_id: 'MANGROVE' })

    expectStatus(await browser.post('/v1/admin/settings/test-sms', { phone: '01700000000' }), 200)

    expect(
      sent.some(
        ({ url, body }) =>
          url === 'https://sms.example.com/api' && body.get('api_key') === 'key-123' && body.get('number') === '01700000000' && body.get('senderid') === 'MANGROVE',
      ),
    ).toBe(true)
  })
})
