"use server";

import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { userRoleCheck } from "@/lib/actions/user";
import { Category } from "@/lib/schemas/mongoose/category";
import { Product } from "@/lib/schemas/mongoose/product";
import { Price } from "@/types/mongoose/product";
import { replaceMongoIds } from "@/utils/replace";
import { ObjectId } from "mongodb";

export async function getProductManage() {
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
      * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
      */

     try {
          await connectMongoDB();

          const showField =
               "name slug thumbnail shortDescription currency price";

          const mongodbResponse = await Product.find()
               .populate({
                    path: "category",
                    model: Category,
                    select: "name slug",
               })
               .select(showField)
               .sort({ createdAt: -1 })
               .lean();

          const mongodbReplaceIds = replaceMongoIds(
               mongodbResponse
          ) as ManageProduct[];

          const products = mongodbReplaceIds.map((product) => {
               const price = product.price.find((p) => p.select)?.price || 0;

               return {
                    ...product,
                    price,
                    category: {
                         id: product.category._id.toString(),
                         name: product.category.name,
                         slug: product.category.slug,
                    },
               };
          });

          return {
               success: true,
               message: "Product manage data fetched successfully.",
               products,
          };
     } catch (error) {
          console.log("Error in getProductManage:", error);
          return {
               success: false,
               message: "Failed to fetch product manage data.",
          };
     }
}

/**
 * Represents a product entity for management purposes.
 *
 * @property id - The unique identifier of the product.
 * @property name - The display name of the product.
 * @property slug - The URL-friendly identifier for the product.
 * @property thumbnail - The URL or path to the product's thumbnail image.
 * @property shortDescription - A brief description of the product.
 * @property currency - The currency code (e.g., 'USD', 'EUR') used for pricing.
 * @property price - An array of price objects associated with the product.
 * @property category - The category to which the product belongs, including its unique identifier, name, and slug.
 */
interface ManageProduct {
     id: string;
     name: string;
     slug: string;
     thumbnail: string;
     shortDescription: string;
     currency: string;
     price: Price[];
     category: {
          _id: ObjectId;
          name: string;
          slug: string;
     };
}

type ProductType = Awaited<ReturnType<typeof getProductManage>>;

/**
 * Extracts the type of a single product item from the `products` property of `ProductType`.
 *
 * This type uses TypeScript's conditional and infer types to obtain the element type of the
 * `products` array within `ProductType`. If `ProductType["products"]` is an array, it infers
 * the type of its elements as `ProductManageType`. If not, it resolves to `never`.
 *
 * This is useful for working with individual product objects when the overall type
 * describes a collection of products.
 */
export type ProductManageType = NonNullable<
     ProductType["products"]
> extends Array<infer U>
     ? U
     : never;
