/**
 * Represents a product within an order.
 *
 * @type OrderProduct
 * @property {string} productId - Unique identifier for the product.
 * @property {string} name - Name of the product.
 * @property {string} slug - URL-friendly identifier for the product.
 * @property {string} image - URL of the product image.
 * @property {number} price - Price of the product.
 * @property {string} currency - Currency code (e.g., 'USD', 'EUR').
 * @property {number} quantity - Quantity of the product ordered.
 * @property {string} selectedPriceId - Identifier for the selected price option.
 * @property {{ type?: string; title?: string } | null} [variants] - Optional product variant details, or null if not applicable.
 */
export type OrderProduct = {
     productId: string;
     name: string;
     slug: string;
     image: string;
     price: number;
     currency: string;
     quantity: number;
     selectedPriceId: string;
     variants?: {
          type?: string;
          title?: string;
     } | null;
};

/**
 * Represents an order placed by a user, including product details, delivery address,
 * payment information, and order status.
 *
 * @property id - Unique identifier for the order.
 * @property userId - Identifier of the user who placed the order, or null for guest orders.
 * @property products - List of products included in the order.
 * @property address - Delivery address details for the order.
 * @property address.name - Name of the recipient.
 * @property address.email - Email address of the recipient (optional).
 * @property address.phone - Phone number of the recipient.
 * @property address.landmark - Landmark near the delivery address (optional).
 * @property address.region - Region of the delivery address (optional).
 * @property address.city - City of the delivery address (optional).
 * @property address.fullAddress - Full address string for delivery.
 * @property address.zone - Zone of the delivery address (optional).
 * @property paymentMethod - Payment method used for the order ("cod", "online-payment", or "card").
 * @property paymentStatus - Current payment status ("pending", "completed", "failed", or "refunded").
 * @property orderStatus - Current status of the order ("pending", "processing", "shipped", "delivered", or "cancelled").
 * @property createdAt - ISO timestamp when the order was created.
 * @property updatedAt - ISO timestamp when the order was last updated.
 */
export type OrderProductType = {
     id: string;
     userId: string | null;
     products: OrderProduct[];
     totalAmount: number;
     shippingCost: number;
     address: {
          name: string;
          email?: string | null;
          phone: string;
          landmark?: string;
          region?: string | null;
          city?: string | null;
          fullAddress: string;
          zone?: string | null;
     };
     paymentMethod: "cod" | "online-payment" | "card";
     paymentStatus: "pending" | "completed" | "failed" | "refunded";
     orderStatus:
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled";
     createdAt: string;
     updatedAt: string;
};
