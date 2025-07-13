"use server";
import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { userRoleCheck } from "@/lib/actions/user";
import { Category } from "@/lib/schemas/mongoose/category";
import { Product } from "@/lib/schemas/mongoose/product";
import { ProductDetailsType } from "@/types/mongoose/product";
import { replaceMongoIds } from "@/utils/replace";

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

export async function removeProductThumbnailUrl(productId: string) {
     try {
          if (!productId) {
               return {
                    success: false,
                    message: "ProductId is required for remove thumbnail.",
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

          const product = await Product.findById(productId).select("thumbnail");
          if (!product) {
               return {
                    success: false,
                    message: "Product not found.",
               };
          }
          if (product.thumbnail !== "") {
               await Product.updateOne({ _id: productId }, { thumbnail: "" });
          }

          return {
               success: true,
               message: "Thumbnail Image remove successful.",
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
