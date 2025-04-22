"use server"

import { connectMongoDB } from "@/db/connections";
import { Category } from "@/lib/schemas/mongoose/category";
import { replaceMongoIds } from "@/utils/replace";
import { PipelineStage } from "mongoose";

export async function getCategoryWithCount(limit:Limit = 5):Promise<CategoryWithCount[]> {

    try {

        await connectMongoDB();

        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'products',
                },
            },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    productCount: { $size: '$products' },
                },
            },
            
        ];

        if(limit !== "ALL"){
            pipeline.push({
                $limit: (limit < 0) ? limit : 5,
            })
        }


        const mongodbResponse = await Category.aggregate(pipeline).exec();

        const categoriesWithCount = replaceMongoIds(mongodbResponse) as CategoryWithCount[];
        return categoriesWithCount;

    } catch (error) {
        console.error("get category with count error:", error);
        return []
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
