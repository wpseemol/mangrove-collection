"use server";
import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { userRoleCheck } from "@/lib/actions/user";
import { Category } from "@/lib/schemas/mongoose/category";
import { Product } from "@/lib/schemas/mongoose/product";
import { ProductDetailsType } from "@/types/mongoose/product";
import { replaceMongoIds } from "@/utils/replace";
import { revalidatePath } from "next/cache";

/**
 * getProductForEdit function get product data from mongodb databases.
 * @param productSlug string
 * @returns objects
 */
export async function getProductForEdit(productSlug: string) {
     try {
          /**
           * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
           */
          if (!productSlug) {
               return {
                    success: false,
                    message: "Find product need to Product id.",
               };
          }

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
                    message: "Admin and Creator use only can add product.",
               };
          }

          await connectMongoDB();

          const productDetailsResponse = await Product.findOne({
               slug: productSlug,
          })
               .populate({
                    path: "category",
                    model: Category,
                    select: "name slug",
               })
               .lean();

          const productDetails = replaceMongoIds(
               productDetailsResponse
          ) as ProductDetailsType;

          return {
               success: true,
               product: JSON.stringify(productDetails),
               message: "Success full get product info for edit.",
          };
     } catch (error) {
          console.log("get product for edit error:", error);
          return {
               success: false,
               message: "get product for edit error.",
               errors: JSON.stringify(error),
          };
     }
}

/**
 * Updates the content of a product in the database.
 *
 * The `productContentUpdate` function allows an admin or creator user to update specific content fields of a product,
 * such as its name, by providing the product's ID, the content to update, and a descriptor for the update (updateFile).
 *
 * The function performs the following steps:
 * 1. Validates that a productId is provided.
 * 2. Authenticates the user and checks if they have the required role (admin or creator).
 * 3. Connects to the MongoDB database.
 * 4. Updates the product document with the provided content.
 * 5. Returns the result of the update operation.
 *
 * @param productId - The ID of the product to update.
 * @param updateContent - An object containing the fields to update (e.g., { name: string }).
 * @param updateFiled - A string describing the update (e.g., "thumbnail", "description").
 * @param url - A string for revalidatePath(url).
 * @returns An object indicating success or failure, a message, and the update response or error details.
 *
 */
export async function productContentUpdate(
     productId: string,
     updateContent: UpdateContentType,
     updateFiled: string,
     url: string
) {
     try {
          if (!productId || !updateContent || !updateFiled) {
               return {
                    success: false,
                    message: "Update Product productId updateContent and updateFiled required",
               };
          }

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
                    message: "Admin and Creator use only can add product.",
               };
          }

          /**
           * Mongodb Connection stablish.
           */
          await connectMongoDB();

          const response = await Product.updateOne(
               { _id: productId },
               updateContent
          );

          revalidatePath(url);

          return {
               success: true,
               message: `Product ${updateFiled} content update.`,
               update: JSON.stringify(response),
          };
     } catch (error) {
          console.log("get product for edit error:", error);
          return {
               success: false,
               message: "get product for edit error.",
               errors: JSON.stringify(error),
          };
     }
}

type UpdateContentType = { name: string };
