"use server";
import { auth } from "@/auth";
import { addProductSchema } from "@/lib/schemas/zod/add-product-schema";
import { formatZodError, getFirstErrorMessage } from "@/utils/zod-error";

import { Product } from "@/lib/schemas/mongoose/product";
import { MongoServerError } from "mongodb";
import type { z } from "zod";
import { userRoleCheck } from "../user";

// Define the input type based on your schema
type ProductSchemaType = z.infer<typeof addProductSchema>;
export type ProductZodErrorType = z.ZodError<typeof addProductSchema>;
/**
 * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
 */
export async function addProductDatabase(input: ProductSchemaType) {
     const session = await auth();

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
               message: "Admin and Creator use only can add product.",
          };
     }
     /**
      * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
      */

     /**
      * product input validates.
      */
     const parsed = addProductSchema.safeParse(input);
     if (!parsed.success) {
          return {
               success: false,
               message: getFirstErrorMessage(parsed.error),
               errors: formatZodError(parsed.error),
               fieldErrors: parsed.error.flatten(),
          };
     }

     /**
      * product input validates.
      */
     const { data: product } = parsed;

     try {
          const isCreate = await Product.create({
               ...product,
               author: session.user.id,
          });
          return {
               success: true,
               message: "Successful product add.",
               isCreate: JSON.stringify(isCreate),
          };
     } catch (error) {
          const typeError = error as MongoServerError;

          if (typeError.code === 11000) {
               const pattern: string | null =
                    typeof typeError.keyPattern === "object"
                         ? Object.keys(typeError.keyPattern)[0]
                         : null;

               let message = "";

               if (pattern === "slug")
                    message =
                         "Product slug already exist, Slug value must be unique";

               return {
                    success: false,
                    message,
               };
          }

          return {
               success: false,
               message: "Inter nal server Error.",
          };
     }
}
