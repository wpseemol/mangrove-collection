"use server";

import { OrderAcceptType } from "@/app/(public)/checkout/_components/checkout-form";
import OrderModel, { Order, OrderItem } from "@/lib/schemas/mongoose/order";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { connectMongoDB } from "@/db/connections";
import {
     COOKIE_KEY_ADDRESS_BOOK,
     COOKIE_KEY_PURCHASES,
     SECRET_KEY_ADDRESS_BOOK,
} from "@/lib/constant";
import { replaceMongoIds } from "@/utils/replace";
import { getOrderProductsDetails } from "../products";

/**
 * Confirms an order by processing the provided order details.
 *
 * @param details - A string representing the order details to be confirmed.
 * @returns A promise that resolves to `void` if successful, or `false` if an error occurs.
 *
 * @remarks
 * The function attempts to stringify the provided details and cast them to `OrderAcceptType`.
 * If an error occurs during processing, it logs the error and returns `false`.
 *
 * @throws Will not throw, but will return `false` on error.
 *
 * @typeParam details must be a valid JSON string representing an `OrderAcceptType` object.
 */
export async function orderConfirm(details: string) {
     try {
          const orderDetails = JSON.parse(details) as OrderAcceptType;
          const orderProductsIds = orderDetails.products.map(
               (product) => product.productId
          );

          const productDetails = await getOrderProductsDetails(
               JSON.stringify(orderProductsIds)
          );

          if (!productDetails) {
               console.error("Please selected Product then bye.");
               return false;
          }

          const orderProduct = productDetails.map((product) => {
               const matchProduct = orderDetails.products.find(
                    (item) => item.productId === product.id
               );

               const variants = product?.variants?.find(
                    (item) => item.id === matchProduct?.selectedPriceId
               );

               const priceFind = product.price.find(
                    (item) => item.variantId === matchProduct?.selectedPriceId
               );
               const price = priceFind?.price || 0;
               const obj = {
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    image: product.thumbnail,
                    price,
                    currency: product.currency,
                    quantity: matchProduct?.quantity || 1,
                    selectedPriceId: matchProduct?.selectedPriceId || "",
                    variants: {
                         type: variants?.type,
                         title: variants?.title,
                    },
               };
               return obj;
          }) as OrderItem[];

          const itemTotalPrice = orderProduct.reduce(
               (total, item) => total + item.price * item.quantity,
               0
          );

          const orderObj = {
               userId: orderDetails.userId,
               products: orderProduct,
               address: {
                    name: orderDetails.fullName,
                    phone: orderDetails.phone,
                    fullAddress: orderDetails.fullAddress,
               },
               paymentMethod: orderDetails.paymentMethod,
               totalAmount: itemTotalPrice + orderDetails.shippingCost,
               shippingCost: orderDetails.shippingCost,
               paymentStatus: "pending",
               orderStatus: "processing",
          } as Order;

          // save order
          await OrderModel.create(orderObj);

          const cookieStore = await cookies();
          cookieStore.delete(COOKIE_KEY_PURCHASES);

          const token = jwt.sign(
               { phone: orderDetails.phone },
               SECRET_KEY_ADDRESS_BOOK,
               {
                    expiresIn: "1y",
               }
          ) as string;

          cookieStore.set(COOKIE_KEY_ADDRESS_BOOK, token, {
               httpOnly: true,
               secure: true,
               maxAge: 31536000,
               path: "/",
          });
          return true;
     } catch (error) {
          console.error("Order confirm error:", error);
          return false;
     }
}

export async function getAddressBookData() {
     try {
          const cookieStore = await cookies();
          const addressBookDataToken = cookieStore.get(
               COOKIE_KEY_ADDRESS_BOOK
          )?.value;
          if (!addressBookDataToken) {
               console.error("address book data not found.");
               return null;
          }

          try {
               const cartItem = jwt.verify(
                    addressBookDataToken,
                    SECRET_KEY_ADDRESS_BOOK
               ) as {
                    phone: string;
               };

               return cartItem.phone;
          } catch (error) {
               console.error("Invalid JWT:", error);
               return null;
          }
     } catch (error) {
          console.error("address book data:", error);
          return null;
     }
}

export async function getOrderProducts() {
     try {
          const addressBookPhone = await getAddressBookData();
          if (!addressBookPhone) {
               console.error("not found phone number.");
               return null;
          }

          await connectMongoDB();

          const showFiled = "";
          const response = await OrderModel.find(
               {
                    "address.phone": addressBookPhone,
               },
               showFiled
          )
               .sort({ createdAt: -1 })
               .lean();

          const orderProduct = replaceMongoIds(response);

          return JSON.stringify(orderProduct);
     } catch (error) {
          console.error("get order product error:", error);
          return null;
     }
}
