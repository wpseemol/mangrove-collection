export type UserRole = 'customer' | 'manager' | 'admin'

export type User = {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string | null
  role: UserRole
  has_password: boolean
  google_linked: boolean
  created_at: string
}

/** Sign-in responses: the session itself lives in an HttpOnly cookie, never in JavaScript. */
export type AuthResponse = {
  user: User
}

export type SessionResponse = {
  authenticated: boolean
  user: User | null
}

export const isStaff = (user: User | null | undefined): boolean => user?.role === 'admin' || user?.role === 'manager'

/** Site configuration, users and integrations are admin-only (managers run the catalog and orders). */
export const isAdmin = (user: User | null | undefined): boolean => user?.role === 'admin'

export type SettingValue = string | number | boolean | string[] | Record<string, string> | null

/** One row of `GET /admin/settings`. Secrets come back masked as `********`. */
export type SettingMeta = {
  value: SettingValue
  type: 'string' | 'text' | 'boolean' | 'integer' | 'float' | 'json' | 'email' | 'url' | 'phone'
  public: boolean
  secret: boolean
  options: string[] | null
}

export type AdminSettings = Record<string, Record<string, SettingMeta>>

export type Paginated<T> = {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

/** One SVG element of a Lucide icon: `[tag, attributes]`. */
export type IconNode = [string, Record<string, string>]

export type CategoryIcon = {
  name: string
  label: string
  group: string
  keywords: string[]
  nodes: IconNode[]
}

export type Category = {
  id: number
  name: string
  slug: string
  image: string | null
  icon: string | null
  icon_nodes: IconNode[] | null
  description: string | null
  is_active: boolean
  sort_order: number
  products_count?: number
  created_at: string
  updated_at: string
}

export type ProductVariant = {
  id: number
  title: string
  type: string | null
  sku: string | null
  price: number
  compare_price: number | null
  stock: number | null
  in_stock: boolean
  is_default: boolean
  sort_order: number
}

export type ProductStatus = 'draft' | 'published'

export type Product = {
  id: number
  name: string
  slug: string
  category: Pick<Category, 'id' | 'name' | 'slug'> | null
  unit: string | null
  size: string | null
  currency: string
  price: number | null
  compare_price: number | null
  in_stock: boolean
  short_description: string | null
  description: string | null
  thumbnail: string | null
  images: { id: number; url: string; alt: string | null }[]
  variants: ProductVariant[]
  tags: string[] | null
  status: ProductStatus
  is_featured: boolean
  popularity: number
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export type Media = {
  id: number
  url: string
  path: string
  original_name: string
  mime_type: string
  size: number
  created_at: string
}

export type BannerType = 'slide' | 'right_top' | 'right_bottom'

export type Banner = {
  id: number
  type: BannerType
  title: string | null
  subtitle: string | null
  image: string
  link_url: string | null
  link_enabled: boolean
  is_active: boolean
  sort_order: number
}

export type CmsPage = {
  id: number
  slug: string
  title: string
  content: string | null
  sections: unknown[]
  meta_title: string | null
  meta_description: string | null
  is_published: boolean
  updated_at: string | null
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type OrderSummary = {
  id: number
  order_number: string
  status: OrderStatus
  payment_status: string
  payment_method: string
  customer: { name: string; email: string | null; phone: string }
  currency: string
  total: number
  created_at: string
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket'
export type WalletMethod = Exclude<PaymentMethod, 'cod'>
export type PaymentAccountType = 'personal' | 'agent' | 'merchant'
export type PaymentReviewStatus = 'submitted' | 'verified' | 'rejected'
export type PaymentStatus = 'pending' | 'verifying' | 'paid' | 'failed' | 'refunded'

export type PaymentAccount = {
  id: number
  method: WalletMethod
  account_type: PaymentAccountType
  action: string
  account_number: string
  account_name: string | null
  instructions: string | null
  is_active: boolean
  sort_order: number
  payments_count?: number
  created_at: string
  updated_at: string
}

export type PaymentAccountInput = Pick<PaymentAccount, 'method' | 'account_type' | 'account_number' | 'account_name' | 'instructions' | 'is_active' | 'sort_order'>

export type Payment = {
  id: number
  method: WalletMethod
  account_type: PaymentAccountType | null
  action: string | null
  account_number: string | null
  amount: number
  currency: string
  sender_number: string | null
  transaction_id: string
  status: PaymentReviewStatus
  rejection_reason: string | null
  reviewed_at: string | null
  reviewer?: { id: number; name: string } | null
  order?: {
    id: number
    order_number: string
    customer_name: string
    customer_phone: string
    total: number
    currency: string
    status: OrderStatus
    payment_status: PaymentStatus
    created_at: string
  }
  created_at: string
}

export type PaymentQueue = Paginated<Payment> & { counts: Record<PaymentReviewStatus, number> }

export type OrderItem = {
  id: number
  product_id: number | null
  product_variant_id: number | null
  product_name: string
  product_slug: string
  variant_title: string | null
  image: string | null
  unit_price: number
  quantity: number
  line_total: number
}

export type Order = {
  id: number
  order_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  payment: Payment | null
  payments?: Payment[]
  customer: { name: string; email: string | null; phone: string }
  shipping_address: {
    name: string
    phone: string
    email?: string | null
    region: string | null
    city: string | null
    zone: string | null
    landmark: string | null
    full_address: string
  }
  shipping_method: string | null
  currency: string
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  customer_note: string | null
  admin_note?: string | null
  user?: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null
  items?: OrderItem[]
  items_count?: number
  cancelled_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

export type OrderList = Paginated<Order> & { counts: Record<OrderStatus, number> }

export type ReviewStatus = 'published' | 'hidden'

export type AdminReview = {
  id: number
  rating: number
  comment: string
  images: { path: string; url: string }[]
  reviewer_name: string
  status: ReviewStatus
  edited_at: string | null
  created_at: string
  reviewer: { name: string; phone: string | null; email: string | null }
  order: { id: number; order_number: string } | null
  product: { id: number; name: string; slug: string; thumbnail: string | null } | null
}

export type ReviewQueue = Paginated<AdminReview> & { counts: Record<ReviewStatus, number> }

export type SubscriberStatus = 'subscribed' | 'unsubscribed'

export type NewsletterSubscriber = {
  id: number
  email: string
  status: SubscriberStatus
  source: string | null
  subscribed_at: string | null
  unsubscribed_at: string | null
}

export type SubscriberList = Paginated<NewsletterSubscriber> & { counts: Record<SubscriberStatus, number> }

export type BlogCategory = {
  id: number
  name: string
  slug: string
  icon: string | null
  icon_nodes: IconNode[] | null
  description: string | null
  is_active: boolean
  sort_order: number
  posts_count?: number
  created_at: string
  updated_at: string
}

export type BlogMediaType = 'image' | 'video'
export type VideoProvider = 'upload' | 'youtube' | 'vimeo'

export type BlogMedia = {
  id: number
  type: BlogMediaType
  provider: VideoProvider
  url: string
  embed_url: string | null
  thumbnail: string | null
  caption: string | null
}

export type BlogStatus = 'draft' | 'published'

export type BlogPost = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  status: BlogStatus
  is_featured: boolean
  published_at: string | null
  reading_minutes: number
  views: number
  tags: string[]
  category?: BlogCategory | null
  author?: { id: number; name: string; avatar: string | null } | null
  images_count?: number
  videos_count?: number
  content?: string | null
  meta_title?: string | null
  meta_description?: string | null
  media?: BlogMedia[]
  created_at: string
  updated_at: string
}

export type BlogPostList = Paginated<BlogPost> & { counts: Record<BlogStatus, number> }

/** A row of `GET /admin/users`. */
export type AdminUser = User & {
  is_active: boolean
  email_verified_at: string | null
  last_login_at: string | null
  orders_count?: number
}

export type UserList = Paginated<AdminUser> & { counts: Record<UserRole | 'inactive', number> }

export type UserInput = {
  name: string
  email: string
  phone: string | null
  role?: UserRole
  is_active?: boolean
  password?: string
}

export type DashboardStats = {
  totals: {
    revenue: number
    revenue_period: number
    orders: number
    orders_period: number
    customers: number
    products: number
    payments_awaiting: number
  }
  orders_by_status: Partial<Record<OrderStatus, number>>
  sales_chart: { date: string; orders: number; revenue: number }[]
  low_stock: { variant_id: number; product_id: number; product_name: string; variant_title: string; stock: number }[]
  recent_orders: OrderSummary[]
}
