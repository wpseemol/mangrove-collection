"use server";

import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { Category } from "@/lib/schemas/mongoose/category";
import { replaceMongoIds } from "@/utils/replace";
import { PipelineStage, Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { deleteUploadedImage } from "../media";
import { userRoleCheck } from "../user";

export async function getCategory(): Promise<Categories[]> {
     try {
          /**
           * connect mongodb use mongoose.
           */

          await connectMongoDB();

          const showColumns = "name slug imgUrl";
          const mongodbResponse = await Category.find({}, showColumns).lean();

          const categories = replaceMongoIds(mongodbResponse) as Categories[];
          return categories;
     } catch {
          return [];
     }
}

export async function getCategoryNameFromSlug(cateogyrSlug: string[]) {
     try {
          await connectMongoDB();

          const showColumns = "name";
          const mongodbResponse = await Category.find(
               {
                    slug: { $in: cateogyrSlug },
               },
               showColumns
          ).lean();
          const replaceMongoIdsCategoryResponse = replaceMongoIds(
               mongodbResponse
          ) as {
               name: string;
               id: string;
          }[];
          const categoryName = replaceMongoIdsCategoryResponse.map(
               (category) => category.name
          );
          return categoryName;
     } catch {
          return [];
     }
}

/**
 * getCategoryIds fucntion give category slug array
 * @param categorySlguArray
 * @returns string array
 * return string array of categoryids
 */
export async function getCategoryids(
     categorySlguArray: string[]
): Promise<string[]> {
     try {
          await connectMongoDB();

          const showColumns = "_id";
          const mongodbResponse = await Category.find(
               {
                    slug: { $in: categorySlguArray },
               },
               showColumns
          ).lean();

          /**
           * Array to mongodb `_id` replace `id`
           */
          const categoriesIds = mongodbResponse.map((categoryId) =>
               (categoryId._id as Types.ObjectId).toString()
          );

          return categoriesIds;
     } catch {
          return [];
     }
}

export async function getCategoryWithCount(
     limit: Limit = 5
): Promise<CategoryWithCount[]> {
     try {
          await connectMongoDB();

          const pipeline: PipelineStage[] = [
               {
                    $lookup: {
                         from: "products",
                         localField: "_id",
                         foreignField: "category",
                         as: "products",
                    },
               },
               {
                    $project: {
                         name: 1,
                         slug: 1,
                         productCount: { $size: "$products" },
                    },
               },
          ];

          if (limit !== "ALL") {
               pipeline.push({
                    $limit: limit < 0 ? limit : 5,
               });
          }

          const mongodbResponse = await Category.aggregate(pipeline).exec();

          const categoriesWithCount = replaceMongoIds(
               mongodbResponse
          ) as CategoryWithCount[];
          return categoriesWithCount;
     } catch {
          return [];
     }
}

export async function getCategoryForManage() {
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

          await connectMongoDB();

          const pipeline: PipelineStage[] = [
               {
                    $lookup: {
                         from: "products",
                         localField: "_id",
                         foreignField: "category",
                         as: "products",
                    },
               },
               {
                    $lookup: {
                         from: "users",
                         localField: "author",
                         foreignField: "_id",
                         as: "author",
                    },
               },

               { $unwind: "$author" },
               {
                    $project: {
                         name: 1,
                         slug: 1,
                         imgUrl: 1,
                         "author._id": 1,
                         "author.name": 1,
                         "author.email": 1,
                         "author.role": 1,
                         productCount: { $size: "$products" },
                         createdAt: 1,
                    },
               },
               { $sort: { createdAt: -1 } },
          ];

          const response = await Category.aggregate(pipeline).exec();

          const responseReplaceId = replaceMongoIds(
               response
          ) as CategoryForManage[];

          /**
           * Replace MongoDB `_id` with `id` and format author data
           * remove array buffer related error.
           */
          const categories = responseReplaceId.map((category) => ({
               ...category,
               author: replaceMongoIds(category.author) as AuthorForManage,
          }));

          return {
               success: true,
               categories,
               message: "Category fetched successfully.",
          };
     } catch (error) {
          return {
               success: false,
               message: "Error fetching categories for management.",
               error: JSON.stringify(error),
          };
     }
}

/**
 * Deletes a category from the database after validating the user's session and role.
 * Also deletes the associated category image and optionally revalidates a specified path.
 *
 * @param {Object} params - The parameters for the category deletion action.
 * @param {string} params.categoryId - The unique identifier of the category to be deleted.
 * @param {string} params.categoryImageUrl - The URL of the category's associated image to be deleted.
 * @param {string} [params.pathName] - An optional path to revalidate after the category is deleted.
 *
 * @returns {Promise<Object>} - A promise that resolves to an object containing the success status,
 * a message, and optionally the response or error details.
 *
 * @throws {Error} - Throws an error if the deletion process encounters an issue.
 *
 * @remarks
 * - The function checks if the user is authenticated and has the required role (`admin` or `creator`).
 * - Deletes the category image using the `deleteUploadedImage` function.
 * - Connects to the MongoDB database and deletes the category document.
 * - Optionally revalidates the provided path using `revalidatePath`.
 * - Returns a success or failure response with appropriate messages.
 */
export async function categoryDeletedAction({
     categoryId,
     categoryImageUrl,
     pathName,
}: {
     categoryId: string;
     categoryImageUrl: string;
     pathName?: string;
}) {
     if (!categoryId || !categoryImageUrl) {
          return {
               success: false,
               message: "Error fetching categories for management.",
          };
     }

     try {
          const session = await auth();
          /**
           * Validates user and input, then deletes a category if authorized; returns operation result and errors if any.
           */
          if (!session || !session.user) {
               return {
                    success: false,
                    message: "You must be logged in to delete a category.",
               };
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
                    message: "Only Admins and Creators are authorized to delete categories.",
               };
          }

          await deleteUploadedImage({
               url: categoryImageUrl,
          });

          await connectMongoDB();

          const response = await Category.deleteOne({ _id: categoryId });

          if (pathName) {
               revalidatePath(pathName);
          }

          return {
               success: true,
               message: "Category deleted successfully.",
               response: JSON.stringify(response),
          };
     } catch (error) {
          return {
               success: false,
               message: "An error occurred while deleting the category.",
               error: JSON.stringify(error),
          };
     }
}

type Limit = "ALL" | number;

/**
 * Represents a category with an associated product count.
 *
 * @interface CategoryWithCount
 * @property {string} id - The unique identifier for the category.
 * @property {string} name - The name of the category.
 * @property {string} slug - The URL-friendly identifier for the category, typically used in web URLs.
 * @property {number} productCount - The total number of products associated with the category.
 */

export interface CategoryWithCount {
     id: string;
     name: string;
     slug: string;
     productCount: number;
}

/**
 * Represents a category entity.
 *
 * @interface Categories
 * @property {string} id - The unique identifier for the category.
 * @property {string} name - The name of the category.
 * @property {string} slug - The URL-friendly identifier for the category, typically used in web URLs.
 * @property {string} imgUrl - The URL of the image associated with the category.
 */
interface Categories {
     id: string;
     name: string;
     slug: string;
     imgUrl: string;
}

/**
 * Represents an author with management details.
 *
 * @interface AuthorForManage
 * @property {string} _id - The unique identifier for the author.
 * @property {string} name - The name of the author.
 * @property {string} email - The email address of the author.
 * @property {string} role - The role of the author (e.g., admin, creator).
 */
export interface AuthorForManage {
     _id: unknown;
     id: string;
     name: string;
     email: string;
     role: string;
}

/**
 * Represents a category with additional management details.
 *
 * @interface CategoryForManage
 * @property {string} id - The unique identifier for the category.
 * @property {string} name - The name of the category.
 * @property {string} slug - The URL-friendly identifier for the category, typically used in web URLs.
 * @property {string} imgUrl - The URL of the image associated with the category.
 * @property {AuthorForManage} author - The author of the category, containing their ID, name, email, and role.
 * @property {string} createdAt - The date and time when the category was created.
 */
export interface CategoryForManage {
     id: string;
     name: string;
     slug: string;
     imgUrl: string;
     author: AuthorForManage;
     productCount: number;
}
