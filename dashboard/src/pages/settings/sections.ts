import { KeyRound, Mail, MessageCircle, MessageSquareText, Search, ShoppingBag, Store, UserRound, type LucideIcon } from 'lucide-react'

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'url'
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'number'
  | 'switch'
  | 'select'
  | 'secret'
  | 'image'
  | 'code'
  | 'social'

export type FieldDef = {
  key: string
  label: string
  kind: FieldKind
  description?: string
  placeholder?: string
  required?: boolean
  /** Max characters for text kinds; max value for numbers. */
  max?: number
  min?: number
  integer?: boolean
  options?: { value: string; label: string }[]
  /** Spans both columns of the card grid. */
  wide?: boolean
}

export type CardDef = {
  title: string
  description?: string
  fields: FieldDef[]
}

export type SectionDef = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  cards: CardDef[]
  extra?: 'whatsapp-preview' | 'test-mail' | 'test-sms' | 'sign-in-status'
}

export const SOCIAL_NETWORKS = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/your-page' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/your-account' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@your-channel' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/your-company' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/your-account' },
] as const

export const SECTIONS: SectionDef[] = [
  {
    id: 'general',
    title: 'Store',
    description: 'Name, branding and the addresses of the storefront and dashboard.',
    icon: Store,
    cards: [
      {
        title: 'Branding',
        description: 'Shown in the storefront header, footer and browser tab.',
        fields: [
          { key: 'site_name', label: 'Store name', kind: 'text', required: true, max: 100 },
          { key: 'site_tagline', label: 'Tagline', kind: 'text', max: 160, placeholder: 'From the heart of Sundarban' },
          { key: 'site_logo', label: 'Logo', kind: 'image', description: 'Square image, at least 128×128. Leave empty to use the default logo.' },
          { key: 'site_favicon', label: 'Favicon', kind: 'image', description: 'Square PNG, 64×64 or larger.' },
        ],
      },
      {
        title: 'Addresses',
        description: 'Used in password-reset emails and links between the two apps.',
        fields: [
          { key: 'storefront_url', label: 'Storefront URL', kind: 'url', required: true, placeholder: 'https://mangrove-collection.com' },
          { key: 'dashboard_url', label: 'Dashboard URL', kind: 'url', required: true, placeholder: 'https://dashboard.mangrove-collection.com' },
        ],
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact & social',
    description: 'How customers reach you. Shown in the footer and on the contact page.',
    icon: UserRound,
    cards: [
      {
        title: 'Contact details',
        fields: [
          { key: 'contact_phone', label: 'Phone', kind: 'phone', placeholder: '+880 1712-345678' },
          { key: 'contact_email', label: 'Email', kind: 'email', placeholder: 'hello@mangrove-collection.com' },
          { key: 'contact_address', label: 'Address', kind: 'textarea', max: 500, wide: true },
        ],
      },
      {
        title: 'Social media',
        description: 'Full links to your pages. Empty networks are hidden on the storefront.',
        fields: [{ key: 'social_links', label: 'Social links', kind: 'social', wide: true }],
      },
    ],
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    description: 'The floating chat button on every storefront page, plus the WhatsApp links in the footer and contact page.',
    icon: MessageCircle,
    extra: 'whatsapp-preview',
    cards: [
      {
        title: 'Chat button',
        fields: [
          {
            key: 'whatsapp_button_enabled',
            label: 'Show the floating WhatsApp button',
            kind: 'switch',
            description: 'Appears on every page, including the home page, once a number is set.',
            wide: true,
          },
          {
            key: 'whatsapp_number',
            label: 'WhatsApp number',
            kind: 'whatsapp',
            placeholder: '+8801712345678',
            description: 'International format with the country code (+880 for Bangladesh).',
          },
          {
            key: 'whatsapp_button_position',
            label: 'Button position',
            kind: 'select',
            options: [
              { value: 'right', label: 'Bottom right' },
              { value: 'left', label: 'Bottom left' },
            ],
          },
          {
            key: 'whatsapp_message',
            label: 'Pre-filled message',
            kind: 'textarea',
            max: 500,
            wide: true,
            description: 'Typed into the chat for the customer when they tap the button. They can edit it before sending.',
          },
        ],
      },
    ],
  },
  {
    id: 'commerce',
    title: 'Checkout',
    description: 'Currency, payment methods and shipping rules.',
    icon: ShoppingBag,
    cards: [
      {
        title: 'Currency',
        fields: [
          { key: 'currency', label: 'Currency code', kind: 'text', required: true, max: 10, placeholder: 'BDT' },
          { key: 'currency_symbol', label: 'Symbol', kind: 'text', required: true, max: 5, placeholder: '৳' },
        ],
      },
      {
        title: 'Cash on delivery',
        description: 'bKash, Nagad and Rocket numbers are managed under Payment accounts.',
        fields: [{ key: 'cod_enabled', label: 'Accept cash on delivery', kind: 'switch', wide: true }],
      },
      {
        title: 'Orders & stock',
        fields: [
          {
            key: 'free_shipping_threshold',
            label: 'Free shipping from',
            kind: 'number',
            min: 0,
            max: 10000000,
            description: 'Order subtotal that unlocks free shipping. Leave empty to turn it off.',
          },
          {
            key: 'low_stock_threshold',
            label: 'Low-stock alert at',
            kind: 'number',
            min: 0,
            max: 100000,
            integer: true,
            description: 'Variants at or below this stock appear on the overview page.',
          },
          {
            key: 'order_notification_email',
            label: 'New-order email',
            kind: 'email',
            description: 'Gets an email for every new order. Needs working email settings.',
            wide: true,
          },
        ],
      },
    ],
  },
  {
    id: 'seo',
    title: 'SEO & tracking',
    description: 'Search engine defaults, analytics tags and custom scripts.',
    icon: Search,
    cards: [
      {
        title: 'Search engines',
        fields: [
          { key: 'meta_title', label: 'Default page title', kind: 'text', max: 255, wide: true },
          { key: 'meta_description', label: 'Default description', kind: 'textarea', max: 500, wide: true },
          { key: 'meta_keywords', label: 'Keywords', kind: 'textarea', max: 500, wide: true, placeholder: 'sundarban honey, fresh crab, prawn' },
          { key: 'og_image', label: 'Social share image', kind: 'image', description: '1200×630 recommended.' },
          {
            key: 'google_site_verification',
            label: 'Google site verification',
            kind: 'text',
            max: 255,
            placeholder: 'Content of the google-site-verification meta tag',
          },
        ],
      },
      {
        title: 'Analytics',
        description: 'Tags load on the storefront only.',
        fields: [
          { key: 'google_analytics_id', label: 'Google Analytics ID', kind: 'text', max: 50, placeholder: 'G-XXXXXXXXXX' },
          { key: 'google_tag_manager_id', label: 'Google Tag Manager ID', kind: 'text', max: 50, placeholder: 'GTM-XXXXXXX' },
          { key: 'facebook_pixel_id', label: 'Facebook Pixel ID', kind: 'text', max: 50, placeholder: '1234567890' },
        ],
      },
      {
        title: 'Custom scripts',
        description: 'Runs on every storefront page with full access to it. Only paste code from a source you trust.',
        fields: [
          { key: 'custom_head_script', label: 'Inside <head>', kind: 'code', wide: true, placeholder: '<script>…</script>' },
          { key: 'custom_body_script', label: 'End of <body>', kind: 'code', wide: true, placeholder: '<script>…</script>' },
        ],
      },
    ],
  },
  {
    id: 'sign-in',
    title: 'Sign-in methods',
    description: 'Choose how customers sign in and register on the storefront. Staff always sign in to the dashboard with email and password.',
    icon: KeyRound,
    extra: 'sign-in-status',
    cards: [
      {
        title: 'Email & password',
        description: 'The sign-in and registration forms on the storefront, plus "Forgot password".',
        fields: [
          {
            key: 'password_login_enabled',
            label: 'Allow email & password sign-in',
            kind: 'switch',
            wide: true,
            description: 'When off, customers can only use the providers below. Staff accounts are not affected.',
          },
        ],
      },
      {
        title: 'Google',
        description:
          'Create a "Web application" OAuth client in Google Cloud Console and add the storefront URL as an authorised JavaScript origin. The button appears once it is enabled and a client ID is saved.',
        fields: [
          { key: 'google_login_enabled', label: 'Enable "Continue with Google"', kind: 'switch', wide: true },
          { key: 'google_client_id', label: 'Client ID', kind: 'text', max: 255, wide: true, placeholder: '1234-abc.apps.googleusercontent.com' },
          { key: 'google_client_secret', label: 'Client secret', kind: 'secret', wide: true },
          { key: 'google_redirect_uri', label: 'Redirect URI', kind: 'url', wide: true, placeholder: 'https://mangrove-collection.com/login/' },
        ],
      },
    ],
  },
  {
    id: 'mail',
    title: 'Email',
    description: 'Outgoing email for password resets and order notifications.',
    icon: Mail,
    extra: 'test-mail',
    cards: [
      {
        title: 'SMTP server',
        fields: [
          {
            key: 'mail_mailer',
            label: 'Delivery',
            kind: 'select',
            options: [
              { value: 'smtp', label: 'SMTP server' },
              { value: 'log', label: "Don't send (write to log)" },
            ],
          },
          {
            key: 'mail_encryption',
            label: 'Encryption',
            kind: 'select',
            options: [
              { value: 'tls', label: 'TLS (port 587)' },
              { value: 'ssl', label: 'SSL (port 465)' },
              { value: 'none', label: 'None' },
            ],
          },
          { key: 'mail_host', label: 'Host', kind: 'text', max: 255, placeholder: 'mail.mangrove-collection.com' },
          { key: 'mail_port', label: 'Port', kind: 'number', min: 1, max: 65535, integer: true },
          { key: 'mail_username', label: 'Username', kind: 'text', max: 255 },
          { key: 'mail_password', label: 'Password', kind: 'secret' },
          { key: 'mail_from_address', label: 'From address', kind: 'email', placeholder: 'no-reply@mangrove-collection.com' },
          { key: 'mail_from_name', label: 'From name', kind: 'text', max: 100 },
        ],
      },
    ],
  },
  {
    id: 'sms',
    title: 'SMS',
    description: 'Order text messages to customers through your SMS gateway.',
    icon: MessageSquareText,
    extra: 'test-sms',
    cards: [
      {
        title: 'Gateway',
        fields: [
          { key: 'sms_enabled', label: 'Send order SMS', kind: 'switch', wide: true },
          {
            key: 'sms_driver',
            label: 'Delivery',
            kind: 'select',
            options: [
              { value: 'http', label: 'HTTP gateway' },
              { value: 'log', label: "Don't send (write to log)" },
            ],
          },
          { key: 'sms_sender_id', label: 'Sender ID', kind: 'text', max: 20 },
          { key: 'sms_api_url', label: 'API URL', kind: 'url', wide: true },
          { key: 'sms_api_key', label: 'API key', kind: 'secret', wide: true },
        ],
      },
      {
        title: 'Message templates',
        description: 'Placeholders: {name}, {order_number}, {currency}, {total}, {status}.',
        fields: [
          { key: 'sms_order_placed_template', label: 'Order placed', kind: 'textarea', max: 480, wide: true },
          { key: 'sms_order_status_template', label: 'Status changed', kind: 'textarea', max: 480, wide: true },
        ],
      },
      {
        title: 'Payment templates',
        description: 'Sent when staff verify or reject a bKash / Nagad / Rocket payment. Placeholders: {name}, {order_number}, {method}, {currency}, {amount}, {reason}.',
        fields: [
          { key: 'sms_payment_verified_template', label: 'Payment verified', kind: 'textarea', max: 480, wide: true },
          { key: 'sms_payment_rejected_template', label: 'Payment rejected', kind: 'textarea', max: 480, wide: true },
        ],
      },
    ],
  },
]
