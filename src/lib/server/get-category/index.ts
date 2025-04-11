"use server"

import { connectMongoDB } from "@/db/connections";
import { Category } from "@/lib/schemas/mongoose/category";
import { replaceMongoIds } from "@/utils/replace";


export async function getCategory():Promise<Categories[]> {
    try {
         /**
         * connect mongodb use mongoose.
         */

         await connectMongoDB();

         const showColumns = 'name slug imgUrl';
         const mongodbResponse = await Category.find({}, showColumns).lean();

         const categories = replaceMongoIds(mongodbResponse) as Categories[];
         return categories;
        
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}


interface Categories {
    id: string;
    name: string;
    slug: string;
    imgUrl: string;
}