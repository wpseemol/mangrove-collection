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

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

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

export type DashboardStats = {
  totals: {
    revenue: number
    revenue_period: number
    orders: number
    orders_period: number
    customers: number
    products: number
  }
  orders_by_status: Partial<Record<OrderStatus, number>>
  sales_chart: { date: string; orders: number; revenue: number }[]
  low_stock: { variant_id: number; product_id: number; product_name: string; variant_title: string; stock: number }[]
  recent_orders: OrderSummary[]
}
