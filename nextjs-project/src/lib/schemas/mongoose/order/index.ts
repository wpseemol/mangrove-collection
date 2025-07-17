import mongoose, { Document, Schema, Types } from "mongoose";

export interface OrderItem {
     productId: Types.ObjectId;
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
}

export interface Order extends Document {
     userId: Types.ObjectId | null;
     products: OrderItem[];
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
     totalAmount: number;
     shippingCost: number;
     orderStatus:
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled";
     createdAt: Date;
     updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>({
     productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
     name: { type: String, required: true },
     slug: { type: String, required: true },
     image: { type: String, required: true },
     price: { type: Number, required: true, min: 0 },
     currency: { type: String, required: true },
     selectedPriceId: { type: String, required: true },
     quantity: { type: Number, required: true, min: 1 },
     variants: {
          type: Schema.Types.Mixed,
          default: null,
     },
});

const OrderSchema = new Schema<Order>(
     {
          userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
          products: { type: [OrderItemSchema], required: true },
          address: {
               name: { type: String, required: true },
               email: { type: String, default: null },
               phone: { type: String, required: true },
               landmark: { type: String, default: null },
               region: { type: String, default: null },
               city: { type: String, default: null },
               fullAddress: { type: String, required: true },
               zone: { type: String, default: null },
          },
          paymentMethod: {
               type: String,
               enum: ["cod", "online-payment", "card"],
               required: true,
          },
          paymentStatus: {
               type: String,
               enum: ["pending", "completed", "failed", "refunded"],
               default: "pending",
          },
          totalAmount: { type: Number, required: true, min: 0 },
          shippingCost: { type: Number, required: true, min: 0 },
          orderStatus: {
               type: String,
               enum: [
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
               ],
               default: "pending",
          },
     },
     { timestamps: true }
);

// Check for existing model to prevent OverwriteModelError
const OrderModel =
     mongoose.models.Order || mongoose.model<Order>("Order", OrderSchema);

export default OrderModel;
