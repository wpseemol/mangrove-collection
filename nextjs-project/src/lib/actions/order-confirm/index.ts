"use server";

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
import { Types } from "mongoose";
import { getOrderProductsDetails } from "../products";
import {
    checkoutSchema,
    CheckoutSchemaType,
} from "@/lib/schemas/zod/checkout-schema";
import { formatZodError, getFirstErrorMessage } from "@/utils/zod-error";
import { getPurchaseData } from "../purchase";

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
        const data = JSON.parse(details) as CheckoutSchemaType;

        const orderData = checkoutSchema.safeParse(data);
        if (!orderData.success) {
            return {
                success: false,
                message: getFirstErrorMessage(orderData.error),
                errors: formatZodError(orderData.error),
                fieldErrors: orderData.error.flatten(),
            };
        }

        const purchaseData = await getPurchaseData();
        if (!purchaseData) {
            return {
                success: false,
                message: "can not find any product for payment.",
                errors: "",
            };
        }

        const purchaseProductIds = purchaseData.map((item) => item.productId);

        await connectMongoDB();

        const productDetails = await getOrderProductsDetails(
            JSON.stringify(purchaseProductIds)
        );

        if (!productDetails) {
            return {
                success: false,
                message: "can not find any product for payment.",
                errors: "",
            };
        }

        const orderProduct = productDetails.map((product) => {
            const matchProduct = purchaseData.find(
                (item) => item.productId === product.id
            );

            const variants = product?.variants?.find(
                (item) => item.id === matchProduct?.selectedPriceId
            );

            const price =
                product.price.find(
                    (item) => item.variantId === matchProduct?.selectedPriceId
                )?.price || 0;
            const shippingCost =
                product.shippingCost.find(
                    (item) => item.shippingId === orderData.data.shippingCostId
                )?.price || 0;

            const obj = {
                productId: new Types.ObjectId(product.id),
                name: product.name,
                slug: product.slug,
                image: product.thumbnail,
                price,
                shippingCost,
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

        const totalShippingCost = orderProduct.reduce(
            (total, item) => total + item.shippingCost,
            0
        );

        const orderObj = {
            products: orderProduct,
            address: {
                name: orderData.data.fullName,
                phone: orderData.data.phoneNumber,
                fullAddress: orderData.data.fullAddress,
                city: orderData.data.city,
                region: orderData.data.district,
            },
            paymentMethod: orderData.data.paymentMethod,
            totalAmount: itemTotalPrice + totalShippingCost,
            shippingCost: totalShippingCost,
            paymentStatus: "pending",
            orderStatus: "processing",
        } as Order;

        await connectMongoDB();

        // save order
        await OrderModel.create(orderObj);

        const cookieStore = await cookies();
        cookieStore.delete(COOKIE_KEY_PURCHASES);

        const token = jwt.sign(
            { phone: orderData.data.phoneNumber },
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
        return {
            success: true,
            message: "Oho you are success full buy product.",
            errors: "",
        };
    } catch {
        return {
            success: false,
            message: "Some thing is happen, please try again",
            errors: "",
        };
    }
}

/**
 *
 * @returns Returns the phone number from the address book data stored in cookies.
 * If the address book data is not found or the JWT is invalid, it returns null.
 */
export async function getAddressBookDataCookies() {
    try {
        const cookieStore = await cookies();
        const addressBookDataToken = cookieStore.get(
            COOKIE_KEY_ADDRESS_BOOK
        )?.value;
        if (!addressBookDataToken) {
            return false;
        }

        try {
            const cartItem = jwt.verify(
                addressBookDataToken,
                SECRET_KEY_ADDRESS_BOOK
            ) as {
                phone: string;
            };

            return cartItem.phone;
        } catch {
            return false;
        }
    } catch {
        return false;
    }
}

export async function getOrderProducts() {
    try {
        const addressBookPhone = await getAddressBookDataCookies();
        if (!addressBookPhone) {
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
    } catch {
        return null;
    }
}
