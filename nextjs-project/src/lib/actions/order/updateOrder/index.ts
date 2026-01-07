"use server";

import { auth } from "@/auth";
import { userRoleCheck } from "../../user";
import { connectMongoDB } from "@/db/connections";
import OrderModel from "@/lib/schemas/mongoose/order";
import { revalidatePath } from "next/cache";

/**
 * Order status filed update
 * @param orderId string
 * @param statusValue string
 * @param statusFiled string
 * @returns
 */

export async function orderStatusFiledUpdate(
    orderId: string,
    statusValue: string,
    statusFiled: string,
    pathName: string | null = null
) {
    if (!orderId || !statusValue || !statusFiled) {
        return {
            success: false,
            message:
                "Order id, status update vale and status filed name are required",
        };
    }

    try {
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
                message: "Admin and Creator use only can update order status.",
            };
        }
        /**
         * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
         */

        await connectMongoDB();

        const response = await OrderModel.updateOne(
            {
                _id: orderId,
            },
            {
                [statusFiled]: statusValue,
            }
        );

        if (pathName) {
            revalidatePath(pathName);
        }

        return {
            success: true,
            message: "success full status update",
            response,
        };
    } catch (error) {
        return {
            success: false,
            message: "Inter nal server Error.",
            error,
        };
    }
}
