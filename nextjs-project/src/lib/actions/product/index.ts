"use server";
import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { userRoleCheck } from "@/lib/actions/user";
import { Category } from "@/lib/schemas/mongoose/category";
import { Product } from "@/lib/schemas/mongoose/product";
import {
    productCategorySchema,
    productDescriptionSchema,
    productImagesSchema,
    productNameSchema,
    productPriceVariantSchema,
    productShortDescriptionSchema,
    productSlugSchema,
    productTagsSchema,
    productThumbnailSchema,
    productUnitSchema,
    ShippingCostArray,
    shippingCostArraySchema,
} from "@/lib/schemas/zod/edit-product-schema";
import { ProductDetailsType } from "@/types/mongoose/product";
import { replaceMongoIds } from "@/utils/replace";
import { formatZodError, getFirstErrorMessage } from "@/utils/zod-error";
import { MongoServerError } from "mongodb";
import { revalidatePath } from "next/cache";
import { deleteUploadedImage } from "../media";

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

        const productDetails = replaceMongoIds(response) as ProductDetailsType;

        return {
            success: true,
            product: JSON.stringify(productDetails),
            message: "Success full get product info for edit.",
        };
    } catch (error) {
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
    url: string | null = null
) {
    try {
        if (!productId || !input || !updateFiled) {
            return {
                success: false,
                message:
                    "Update Product productId updateContent and updateFiled required",
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
                        message: getFirstErrorMessage(parsedDescription.error),
                        errors: formatZodError(parsedDescription.error),
                        fieldErrors: parsedDescription.error.flatten(),
                    };
                }
                updateContent = parsedDescription.data;
                message = "Product description filed content change.";
                break;
            case "thumbnail":
                const parsedThumbnail = productThumbnailSchema.safeParse(input);
                if (!parsedThumbnail.success) {
                    return {
                        success: false,
                        message: getFirstErrorMessage(parsedThumbnail.error),
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
            case "variants&price":
                const parsedVariantAndPrice =
                    productPriceVariantSchema.safeParse(input);
                if (!parsedVariantAndPrice.success) {
                    return {
                        success: false,
                        message: getFirstErrorMessage(
                            parsedVariantAndPrice.error
                        ),
                        errors: formatZodError(parsedVariantAndPrice.error),
                        fieldErrors: parsedVariantAndPrice.error.flatten(),
                    };
                }
                updateContent = parsedVariantAndPrice.data;
                message = "Product variants and price update done.";
                break;
            case "category":
                const parsedCategory = productCategorySchema.safeParse(input);
                if (!parsedCategory.success) {
                    return {
                        success: false,
                        message: getFirstErrorMessage(parsedCategory.error),
                        errors: formatZodError(parsedCategory.error),
                        fieldErrors: parsedCategory.error.flatten(),
                    };
                }
                updateContent = parsedCategory.data;
                message = "Product category change done.";
                break;
            case "shortDescription":
                const parsedShortDescription =
                    productShortDescriptionSchema.safeParse(input);
                if (!parsedShortDescription.success) {
                    return {
                        success: false,
                        message: getFirstErrorMessage(
                            parsedShortDescription.error
                        ),
                        errors: formatZodError(parsedShortDescription.error),
                        fieldErrors: parsedShortDescription.error.flatten(),
                    };
                }
                updateContent = parsedShortDescription.data;
                message = "Product short description content update done.";
                break;
            case "tags":
                const parsedTags = productTagsSchema.safeParse(input);
                if (!parsedTags.success) {
                    return {
                        success: false,
                        message: getFirstErrorMessage(parsedTags.error),
                        errors: formatZodError(parsedTags.error),
                        fieldErrors: parsedTags.error.flatten(),
                    };
                }
                updateContent = parsedTags.data;
                message = "Product tags content update done.";
                break;

            case "shippingCost":
                const shippingCostData =
                    shippingCostArraySchema.safeParse(input);
                if (!shippingCostData.success) {
                    return {
                        success: false,
                        message: getFirstErrorMessage(shippingCostData.error),
                        errors: formatZodError(shippingCostData.error),
                        fieldErrors: shippingCostData.error.flatten(),
                    };
                }
                updateContent = shippingCostData.data;
                message = "Product tags content update done.";

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
                errors: JSON.stringify(error),
            };
        }

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
    | {
          variants: {
              type: string;
              id: string;
              title: string;
          }[];
          price: {
              price: number;
              variantId: string;
              select: boolean;
          }[];
      }
    | {
          category: string;
      }
    | {
          shortDescription: string;
      }
    | {
          tags: string[];
      }
    | ShippingCostArray
    | null;

type UpdateFiledType =
    | "name"
    | "slug"
    | "unit"
    | "description"
    | "thumbnail"
    | "images"
    | "variants&price"
    | "category"
    | "shortDescription"
    | "tags"
    | "shippingCost";

/**
 * Deletes a product from the database and optionally revalidates a path.
 *
 * @param {Object} params - The parameters for deleting the product.
 * @param {string} params.productId - The ID of the product to delete. This is required.
 * @param {string} params.images - A JSON string representing an array of images associated with the product. Each image object should contain `imgUrl` and `public_ids`.
 * @param {string} [params.pathName] - An optional path to revalidate after the product is deleted.
 * @returns {Promise<{
 *   success: boolean;
 *   message: string;
 *   response?: any;
 *   errors?: string;
 * }>} - A promise that resolves to an object indicating the success or failure of the operation, along with a message and optional response or error details.
 *
 * @throws {Error} - Throws an error if the deletion process encounters an issue.
 *
 * @remarks
 * - The function checks if the user is authenticated and has the required role (`admin` or `creator`) to delete the product.
 * - Deletes associated images from the storage using their `public_ids`.
 * - Deletes the product from the MongoDB database.
 * - Optionally revalidates a given path if `pathName` is provided.
 */
export async function deleteProduct({
    productId,
    images,
    pathName,
}: {
    productId: string;
    images: string;
    pathName?: string;
}) {
    try {
        if (!productId) {
            return {
                success: false,
                message: "Product id is required.",
            };
        }

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
                message: "Admin and Creator use only can delete product.",
            };
        }

        const imagesArray = JSON.parse(images) as {
            imgUrl: string;
            public_ids: string;
        }[];

        await Promise.all(
            imagesArray.map(async (image) => {
                const deleteResponse = await deleteUploadedImage({
                    public_id: image.public_ids,
                });

                return deleteResponse;
            })
        );

        await connectMongoDB();

        const response = await Product.deleteOne({ _id: productId });

        if (pathName) {
            revalidatePath(pathName);
        }

        return {
            success: true,
            message: "Product deleted successfully.",
            response,
        };
    } catch (error) {
        return {
            success: false,
            message: "Delete product error.",
            errors: JSON.stringify(error),
        };
    }
}
