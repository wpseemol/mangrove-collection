"use server";

import { connectMongoDB } from "@/db/connections";
import { Category } from "@/lib/schemas/mongoose/category";
import { replaceMongoIds } from "@/utils/replace";
import { PipelineStage, Types } from "mongoose";

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
     } catch (error) {
          console.log("Error fetching categories:", error);
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
     } catch (error) {
          console.log("get category name form category slug error:", error);
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
     } catch (error) {
          console.log("get category ids error:", error);
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
     } catch (error) {
          console.log("get category with count error:", error);
          return [];
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
 *
 *
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
