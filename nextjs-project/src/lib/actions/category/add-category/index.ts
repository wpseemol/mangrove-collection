"use server";

import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { userRoleCheck } from "@/lib/actions/user";
import { Category } from "@/lib/schemas/mongoose/category";
import { addCategorySchema } from "@/lib/schemas/zod/add-category-schema";
import { formatZodError, getFirstErrorMessage } from "@/utils/zod-error";
import { MongoServerError } from "mongodb";
import { revalidatePath } from "next/cache";
import z from "zod";

type CategorySchemaType = z.infer<typeof addCategorySchema>;

/**
 * adds a new category to the database after validating user permissions and input data.
 * If successful, it returns a success message and the created category data.
 * @param input Category input data
 * @param pathName current path name to revalidate
 * @returns
 */
export async function addCategoryAction(
     input: CategorySchemaType,
     pathName?: string
) {
     /**
      * Category input validates.
      */
     const parsed = addCategorySchema.safeParse(input);
     if (!parsed.success) {
          return {
               success: false,
               message: getFirstErrorMessage(parsed.error),
               errors: formatZodError(parsed.error),
               fieldErrors: parsed.error.flatten(),
          };
     }

     try {
          /**
           * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
           */
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

          const { data } = parsed;

          await connectMongoDB();
          const isCreate = await Category.create({
               ...data,
               author: session.user.id,
          });

          if (pathName) {
               revalidatePath(pathName);
          }

          return {
               success: true,
               message: "Successful category created.",
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
                         "Category slug already exist, Slug value must be unique";

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
