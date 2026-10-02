export type Paginated<T> = {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null };
};

/** One SVG element of a category icon: `[tag, attributes]`. */
export type IconNode = [string, Record<string, string>];

export type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  icon_nodes: IconNode[] | null;
  description: string | null;
  products_count?: number;
};

export type ProductVariant = {
  id: number;
  title: string;
  type: string | null;
  sku: string | null;
  price: number;
  compare_price: number | null;
  stock: number | null;
  in_stock: boolean;
  is_default: boolean;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  category?: Category;
  unit: string | null;
  size: string | null;
  currency: string;
  price?: number;
  compare_price?: number | null;
  in_stock?: boolean;
  short_description: string | null;
  description: string | null;
  thumbnail: string | null;
  images?: { id: number; url: string; alt: string | null }[];
  variants?: ProductVariant[];
  tags: string[];
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
};

export type Banner = {
  id: number;
  type: "slide" | "right_top" | "right_bottom";
  title: string | null;
  subtitle: string | null;
  image: string;
  link_url: string | null;
  link_enabled: boolean;
};

export type PageSection = { id?: string; title?: string; description?: string; [key: string]: unknown };

export type CmsPage = {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  sections: PageSection[];
  meta_title: string | null;
  meta_description: string | null;
};

export type ShippingMethod = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  price: number;
};

export type PaymentMethod = "cod" | "bkash" | "nagad" | "rocket";

export type PublicSettings = {
  site_name: string;
  site_tagline: string | null;
  site_logo: string | null;
  site_favicon: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  social_links: Partial<Record<"facebook" | "instagram" | "youtube" | "linkedin" | "twitter", string>> | null;
  storefront_url: string;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
  whatsapp_button_enabled: boolean;
  whatsapp_button_position: "right" | "left";
  currency: string;
  currency_symbol: string;
  payment_methods: PaymentMethod[];
  bkash_number: string | null;
  nagad_number: string | null;
  rocket_number: string | null;
  free_shipping_threshold: number | null;
  google_login_enabled: boolean;
  google_client_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  google_site_verification: string | null;
  google_analytics_id: string | null;
  google_tag_manager_id: string | null;
  facebook_pixel_id: string | null;
  custom_head_script: string | null;
  custom_body_script: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: "customer" | "manager" | "admin";
  has_password: boolean;
  google_linked: boolean;
  created_at: string;
};

export const isStaff = (user: User | null | undefined): boolean => user?.role === "admin" || user?.role === "manager";

/** Sign-in responses: the session itself lives in an HttpOnly cookie, never in JavaScript. */
export type AuthResponse = {
  user: User;
};

export type SessionResponse = {
  authenticated: boolean;
  user: User | null;
};

export type Address = {
  id: number;
  label: string | null;
  name: string;
  email: string | null;
  phone: string;
  region: string | null;
  city: string | null;
  zone: string | null;
  landmark: string | null;
  full_address: string;
  is_default: boolean;
};

export type AddressInput = Omit<Address, "id" | "is_default"> & { is_default?: boolean };

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderItem = {
  id: number;
  product_id: number | null;
  product_variant_id: number | null;
  product_name: string;
  product_slug: string;
  variant_title: string | null;
  image: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  transaction_id: string | null;
  customer: { name: string; email: string | null; phone: string };
  shipping_address: Omit<Address, "id" | "is_default" | "label">;
  shipping_method: string | null;
  currency: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  customer_note: string | null;
  items?: OrderItem[];
  can_cancel: boolean;
  created_at: string;
};
