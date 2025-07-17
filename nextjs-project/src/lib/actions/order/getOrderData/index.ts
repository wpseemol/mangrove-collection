"use server";

import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { userRoleCheck } from "@/lib/actions/user";
import OrderModel from "@/lib/schemas/mongoose/order";
import { OrderProductType } from "@/types/my-order";
import { replaceMongoIds } from "@/utils/replace";

export async function getOrderData() {
     const session = await auth();
     /**
      * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
      */
     if (!session || !session.user) {
          return { success: false, message: "You are not login user." };
     }

     const isAdmin = await userRoleCheck(
          session?.user.id,
          session?.user.role,
          "admin"
     );

     const isCreator = await userRoleCheck(
          session?.user.id,
          session?.user.role,
          "creator"
     );

     if (!isAdmin && !isCreator) {
          return {
               success: false,
               message: "Admin and Creator only can manage order.",
          };
     }
     /**
      * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
      */

     try {
          await connectMongoDB();

          const showField = "";

          const mongodbResponse = await OrderModel.find({}, showField)
               .sort({ createdAt: -1 })
               .lean();

          const ordersIdReplace = replaceMongoIds(
               mongodbResponse
          ) as OrderProductType[];

          const orders = ordersIdReplace.map((order) => {
               return {
                    id: order.id,
                    clientName: order.address.name,
                    email: order.address.email || "",
                    phone: order.address.phone,
                    date: order.createdAt,
                    products: order.products,
                    totalAmount: order.totalAmount,
                    currency: order.products[0]?.currency || "taka",
                    shippingCost: order.shippingCost,
                    paymentMethod: order.paymentMethod,
                    paymentStatus: order.paymentStatus,
                    orderStatus: order.orderStatus,
                    address: order.address.fullAddress,
               };
          });

          return {
               success: true,
               message: "Order data fetched successfully.",
               orders: JSON.stringify(orders),
          };
     } catch (error) {
          console.error("Error fetching order data:", error);
          return {
               success: false,
               message: "Failed to fetch order data.",
          };
     }
}

/**
 * Represents the structure of an order as displayed in the order table.
 *
 * @property id - Unique identifier for the order.
 * @property clientName - Name of the client who placed the order.
 * @property email - Email address of the client.
 * @property phone - Phone number of the client.
 * @property date - Date when the order was created.
 * @property products - List of products included in the order.
 * @property products[].productId - Unique identifier for the product.
 * @property products[].name - Name of the product.
 * @property products[].slug - Slug (URL-friendly identifier) for the product.
 * @property products[].image - Image URL of the product.
 * @property products[].price - Price of the product.
 * @property products[].currency - Currency of the product price.
 * @property products[].quantity - Quantity of the product ordered.
 * @property products[].selectedPriceId - Identifier for the selected price option.
 * @property products[].variants - Optional variants for the product (e.g., size, color).
 * @property products[].variants.type - Optional type of the variant.
 * @property products[].variants.title - Optional title of the variant.
 * @property totalAmount - Total amount for the order.
 * @property shippingCost - Shipping cost for the order.
 * @property paymentMethod - Payment method used for the order ("cod", "online-payment", or "card").
 * @property paymentStatus - Status of the payment ("pending", "completed", "failed", or "refunded").
 * @property orderStatus - Status of the order ("pending", "processing", "shipped", "delivered", or "cancelled").
 * @property address - Full address for the order delivery.
 * @property currency - Currency used for the order.
 */
export interface OrderTableType {
     id: string;
     clientName: string;
     email: string;
     phone: string;
     date: Date;
     products: {
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
     }[];
     totalAmount: number;
     shippingCost: number;
     paymentMethod: "cod" | "online-payment" | "card";
     paymentStatus: "pending" | "completed" | "failed" | "refunded";
     orderStatus:
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled";
     address: string;
     currency: string;
}
