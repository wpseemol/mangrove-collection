"use server";
import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { userRoleCheck } from "@/lib/actions/user";
import { Category } from "@/lib/schemas/mongoose/category";
import { Product } from "@/lib/schemas/mongoose/product";
import {
     productDescriptionSchema,
     productImagesSchema,
     productNameSchema,
     productSlugSchema,
     productThumbnailSchema,
     productUnitSchema,
} from "@/lib/schemas/zod/edit-product-schema";
import { ProductDetailsType } from "@/types/mongoose/product";
import { replaceMongoIds } from "@/utils/replace";
import { formatZodError, getFirstErrorMessage } from "@/utils/zod-error";
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

          const response = await Product.findOne({
               slug: productSlug,
          })
               .populate({
                    path: "category",
                    model: Category,
                    select: "name slug",
               })
               .lean();

          if (!response) {
               return {
                    success: false,
                    message: "Edit product not found.",
               };
          }

          const productDetails = replaceMongoIds(
               response
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
 * @param url - A string for revalidatePath(url) url null cant reval path.
 * @returns An object indicating success or failure, a message, and the update response or error details.
 *
 */
export async function productContentUpdate(
     productId: string,
     input: UpdateContentType,
     updateFiled: UpdateFiledType,
     url: ""
) {
     try {
          if (!productId || !input || !updateFiled) {
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

          let updateContent: UpdateContentType = null;
          let message = "";

          switch (updateFiled) {
               case "name":
                    const parsedName = productNameSchema.safeParse(input);
                    if (!parsedName.success) {
                         return {
                              success: false,
                              message: getFirstErrorMessage(parsedName.error),
                              errors: formatZodError(parsedName.error),
                              fieldErrors: parsedName.error.flatten(),
                         };
                    }
                    updateContent = parsedName.data;
                    message = "Product name filed content update.";
                    break;
               case "slug":
                    const parsedSlug = productSlugSchema.safeParse(input);
                    if (!parsedSlug.success) {
                         return {
                              success: false,
                              message: getFirstErrorMessage(parsedSlug.error),
                              errors: formatZodError(parsedSlug.error),
                              fieldErrors: parsedSlug.error.flatten(),
                         };
                    }
                    updateContent = parsedSlug.data;
                    message = "Product slug filed content update.";
                    break;
               case "unit":
                    const parsedUnit = productUnitSchema.safeParse(input);
                    if (!parsedUnit.success) {
                         return {
                              success: false,
                              message: getFirstErrorMessage(parsedUnit.error),
                              errors: formatZodError(parsedUnit.error),
                              fieldErrors: parsedUnit.error.flatten(),
                         };
                    }
                    updateContent = parsedUnit.data;
                    message = "Product unit filed content change.";
                    break;
               case "description":
                    const parsedDescription =
                         productDescriptionSchema.safeParse(input);
                    if (!parsedDescription.success) {
                         return {
                              success: false,
                              message: getFirstErrorMessage(
                                   parsedDescription.error
                              ),
                              errors: formatZodError(parsedDescription.error),
                              fieldErrors: parsedDescription.error.flatten(),
                         };
                    }
                    updateContent = parsedDescription.data;
                    message = "Product description filed content change.";
                    break;
               case "thumbnail":
                    const parsedThumbnail =
                         productThumbnailSchema.safeParse(input);
                    if (!parsedThumbnail.success) {
                         return {
                              success: false,
                              message: getFirstErrorMessage(
                                   parsedThumbnail.error
                              ),
                              errors: formatZodError(parsedThumbnail.error),
                              fieldErrors: parsedThumbnail.error.flatten(),
                         };
                    }
                    updateContent = parsedThumbnail.data;
                    message = "Product thumbnail remove successful.";
                    break;
               case "images":
                    const parsedImages = productImagesSchema.safeParse(input);
                    if (!parsedImages.success) {
                         return {
                              success: false,
                              message: getFirstErrorMessage(parsedImages.error),
                              errors: formatZodError(parsedImages.error),
                              fieldErrors: parsedImages.error.flatten(),
                         };
                    }
                    updateContent = parsedImages.data;
                    message =
                         parsedImages.data.images.length > 0
                              ? "Product images update done."
                              : "Product images remove successful.";
                    break;
          }

          if (!updateContent) {
               return {
                    success: false,
                    message: "Product update content is require",
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

          if (url) {
               revalidatePath(url);
          }

          return {
               success: true,
               message,
               update: JSON.stringify(response),
          };
     } catch (error) {
          console.log("Product update error:", error);
          return {
               success: false,
               message: "Product update error.",
               errors: JSON.stringify(error),
          };
     }
}

type UpdateContentType =
     | { name: string }
     | { slug: string }
     | { unit: "pc" | "kg" }
     | { description: string }
     | { thumbnail: string }
     | {
            images: {
                 id: string;
                 imgUrl: string;
            }[];
       }
     | null;

type UpdateFiledType =
     | "name"
     | "slug"
     | "unit"
     | "description"
     | "thumbnail"
     | "images";
