"use server";

import { connectMongoDB } from "@/db/connections";
import { Product } from "@/lib/schemas/mongoose/product";
import { replaceMongoIds } from "@/utils/replace";
import { SortOrder } from "mongoose";


export async function getPopularProducts(): Promise<CardProductType[]> {
    try {
        await connectMongoDB();

        const sortOption: { [key: string]: SortOrder } = { popularity: -1 };
        const limitOption = 12;
        const showColumns = 'name slug images thumbnail currency price';

        const response = await Product.find({}, showColumns)
            .sort(sortOption)
            .limit(limitOption)
            .lean();

        const popularProducts = replaceMongoIds(response) as CardProductType[];

        return popularProducts;
        
    } catch (error) {
        console.error("Error fetching popular products:", error);
        return [];
        
    }


}




/**
 * The `CardProductType` interface defines the structure for a product.
 *
 */
export interface CardProductType {
    id: string | number;
    name: string;
    slug: string;

    images: Image[];
    thumbnail: string;
    price: PriceType[];
    currency: string;
    shortDescription: string; // Added this field
    category: {
        name: string; // Added this field
        slug: string; // Added this field
    };
}

/**
 * The `PriceType` interface defines the structure for product pricing.
 * - `variantId`: The identifier for the specific variant.
 * - `price`: The price of the variant.
 * - `select`: Boolean indicating if this variant is selected.
 */
export interface PriceType {
    /**
     * Identifier for the variant.
     */
    variantId: string;

    /**
     * Price for the variant.
     */
    price: number;

    /**
     * Indicates if the variant is selected.
     */
    select: boolean;
}

/**
 * `Image` interface is type of Image
 * - `id` string and number.
 * - `imgUrl` string.
 */
export interface Image {
    id: string | number;
    imgUrl: string;
}

