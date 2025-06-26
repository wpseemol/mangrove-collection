"use server";

import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { userRoleCheck } from "@/lib/actions/user";
import { Category } from "@/lib/schemas/mongoose/category";
import { Product } from "@/lib/schemas/mongoose/product";
import { replaceMongoIds } from "@/utils/replace";
import { ObjectId } from "mongodb";

export async function getProductManage() {
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
                    message: "Admin and Creator use only can add product.",
               };
          }
          /**
           * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
           */

          await connectMongoDB();

          const showField =
               "name slug thumbnail shortDescription currency price";

          const mongodbResponse = await Product.find({}, showField)
               .populate({
                    path: "category",
                    model: Category,
                    select: "name slug",
               })
               .lean();

          const products = replaceMongoIds(mongodbResponse)?.map((product) => {
               return {
                    ...product,
                    category:
                         {
                              ...product.category,
                              id: (product.category._id as ObjectId).toString(),
                         } || {},
               };
          });

          console.log("getProductManage products:", products);
     } catch (error) {
          console.log("Error in getProductManage:", error);
          return {
               success: false,
               message: "Failed to fetch product manage data.",
          };
     }
}
