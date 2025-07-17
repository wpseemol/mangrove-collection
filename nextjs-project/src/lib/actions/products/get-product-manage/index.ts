"use server";

import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { userRoleCheck } from "@/lib/actions/user";
import { Category } from "@/lib/schemas/mongoose/category";
import { Product } from "@/lib/schemas/mongoose/product";
import { User } from "@/lib/schemas/mongoose/user";
import { Price } from "@/types/mongoose/product";
import { extractPublicIdFromUrl } from "@/utils/public-id-from-url";
import { replaceMongoIds } from "@/utils/replace";
import { generateUniqueIds } from "@/utils/unique-id-generate";
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
               "name slug thumbnail images shortDescription currency price";

          const mongodbResponse = await Product.find({}, showField)
               .populate({
                    path: "category",
                    model: Category,
                    select: "name slug",
               })
               .populate({ path: "author", model: User, select: "name email" })
               .sort({ createdAt: -1 })
               .lean();

          const mongodbReplaceIds = replaceMongoIds(
               mongodbResponse
          ) as ManageProduct[];

          const products = mongodbReplaceIds.map((product) => {
               const price = product.price.find((p) => p.select)?.price || 0;

               const author = {
                    id: product.author._id.toString(),
                    name:
                         product.author._id.toString() === session.user.id
                              ? "You"
                              : product.author.name,
                    email: product.author.email,
               };
               const { images, ...rest } = product;

               const picturesUrlWithId = [
                    {
                         id: generateUniqueIds({ pattern: "***" }) as string,
                         imgUrl: product.thumbnail,
                    },
                    ...images,
               ];

               const public_ids = picturesUrlWithId.map((imgObj) =>
                    extractPublicIdFromUrl(imgObj.imgUrl)
               );

               return {
                    ...rest,
                    price,
                    public_ids,
                    author,
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
               products: JSON.stringify(products),
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
     images: { id: string; imgUrl: "string" }[];
     shortDescription: string;
     currency: string;
     price: Price[];
     category: {
          _id: ObjectId;
          name: string;
          slug: string;
     };
     author: {
          _id: ObjectId;
          name: string;
          email: string;
     };
}

/**
 * Represents the structure of a product returned by the getProductManage function.
 *
 * @property id - The unique identifier of the product.
 * @property name - The name of the product.
 * @property slug - The URL-friendly identifier for the product.
 * @property thumbnail - The URL of the product's thumbnail image.
 * @property shortDescription - A brief description of the product.
 * @property currency - The currency code for the product's price.
 * @property price - The selected price of the product.
 * @property category - The category information, including id, name, and slug.
 * @property author - The author information, including id, name, and email.
 * @property public_ids - An array of public IDs extracted from the product's images.
 */
export interface ProductManageType {
     id: string;
     name: string;
     slug: string;
     thumbnail: string;
     shortDescription: string;
     currency: string;
     price: number;
     category: {
          id: string;
          name: string;
          slug: string;
     };
     author: {
          id: string;
          name: string;
          email: string;
     };
     public_ids: string[];
}
