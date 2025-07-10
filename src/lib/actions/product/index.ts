"use server";
import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { userRoleCheck } from "@/lib/actions/user";
import { Category } from "@/lib/schemas/mongoose/category";
import { Product } from "@/lib/schemas/mongoose/product";
import { ProductDetailsType } from "@/types/mongoose/product";
import { replaceMongoIds } from "@/utils/replace";

export async function getProductForEdit(productId: string) {
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
          if (!productId) {
               return {
                    success: false,
                    message: "Find product need to Product id.",
               };
          }

          await connectMongoDB();

          const productDetailsResponse = await Product.findOne({
               _id: productId,
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
