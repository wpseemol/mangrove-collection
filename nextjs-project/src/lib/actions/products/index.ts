"use server";

import { sizeArray } from "@/app/(public)/products/_components/filter-section";
import { connectMongoDB } from "@/db/connections";
import { Category } from "@/lib/schemas/mongoose/category";
import { Product } from "@/lib/schemas/mongoose/product";
import { ProductDetailsType, ProductType } from "@/types/mongoose/product";
import { CardProductType } from "@/types/product";
import { replaceMongoIds } from "@/utils/replace";
/**
 * getProduct searchproms information need
 * @param searchParams
 */
export async function getProducts(
     searchParams: SearchParams
): Promise<CardProductType[]> {
     try {
          await connectMongoDB();

          const { categorisIds, price, size } = searchParams;

          const priceObj: PriceObj = {
               minPrice: null,
               maxPrice: null,
          };

          let findOption = {};

          if (categorisIds) {
               findOption = { ...findOption, category: { $in: categorisIds } };
          }

          if (price) {
               const priceArr = price?.split("-");
               if (!isNaN(parseInt(priceArr[0]))) {
                    priceObj.minPrice = parseInt(priceArr[0]);
               }
               if (!isNaN(parseInt(priceArr[1]))) {
                    priceObj.maxPrice = parseInt(priceArr[1]);
               }

               if (
                    priceObj.maxPrice &&
                    priceObj.minPrice &&
                    priceObj.maxPrice > priceObj.minPrice
               ) {
                    findOption = {
                         ...findOption,
                         "price.price": {
                              $gte: priceObj.minPrice,
                              $lte: priceObj.maxPrice,
                         },
                    };
               }
          }

          if (size && sizeArray.includes(size)) {
               findOption = {
                    ...findOption,
                    size: size,
               };
          }

          const showField =
               "name slug images thumbnail shortDescription currency price";

          const mongodbResponse = await Product.find(findOption, showField)
               .populate({
                    path: "category",
                    model: Category,
                    select: "name slug",
               })
               .lean();

          const products = replaceMongoIds(
               mongodbResponse
          ) as CardProductType[];

          return products;
     } catch (error) {
          console.log("get product error:", error);
          return [];
     }
}

interface SearchParams {
     categorisIds: string[] | null;
     price: string | null;
     size: string | null;
}

interface PriceObj {
     minPrice: null | number;
     maxPrice: null | number;
}

import { SortOrder } from "mongoose";

export async function getNewArrivalProducts(): Promise<CardProductType[]> {
     /**
      * The function `getNewArrivalProducts` fetches the latest products from the database.
      * It connects to the MongoDB database, retrieves the products sorted by their creation date,
      * and limits the result to a specified number of products.
      */
     try {
          await connectMongoDB();

          const sortOption: { [key: string]: SortOrder } = { createdAt: -1 };
          const limitOption = 6;
          const showColumns = "name slug images thumbnail currency price";

          const response = await Product.find({}, showColumns)
               .sort(sortOption)
               .limit(limitOption)
               .lean();

          const newArrivalProducts = replaceMongoIds(
               response
          ) as CardProductType[];
          return newArrivalProducts;
     } catch (error) {
          console.log("Error fetching new arrival products:", error);
          return [];
     }
}

export async function getPopularProducts(): Promise<CardProductType[]> {
     try {
          await connectMongoDB();

          const sortOption: { [key: string]: SortOrder } = { popularity: -1 };
          const limitOption = 12;
          const showColumns = "name slug images thumbnail currency price";

          const response = await Product.find({}, showColumns)
               .sort(sortOption)
               .limit(limitOption)
               .lean();

          const popularProducts = replaceMongoIds(
               response
          ) as CardProductType[];

          return popularProducts;
     } catch (error) {
          console.log("Error fetching popular products:", error);
          return [];
     }
}

export async function getProductsDetails(slug: string) {
     try {
          await connectMongoDB();

          if (!slug) {
               return null;
          }

          const productDetailsResponse = await Product.findOne({ slug })
               .populate({
                    path: "category",
                    model: Category,
                    select: "name slug",
               })
               .lean();

          const productDetails = replaceMongoIds(
               productDetailsResponse
          ) as ProductDetailsType;

          return productDetails;
     } catch (error) {
          console.log("get product details error:", error);
          return null;
     }
}

export async function getRelatedProducts(
     skipId: string,
     categoryId: string
): Promise<CardProductType[]> {
     try {
          if (!categoryId || !skipId) {
               console.log("CategoryId skip product id is rewired.");
               return [];
          }

          await connectMongoDB();

          const limitOption = 6;
          const showField =
               "name slug images thumbnail shortDescription currency price";
          const findOption = {
               category: categoryId,
               _id: { $ne: skipId },
          };

          const relatedProductResponse = await Product.find(
               findOption,
               showField
          )
               .limit(limitOption)
               .lean();

          const relatedProducts = replaceMongoIds(
               relatedProductResponse
          ) as CardProductType[];
          return relatedProducts;
     } catch (error) {
          console.log("get related product error:", error);
          return [];
     }
}

/**
 * getOrderProductsDetails function params ids
 * @param ids string array string you mast pass JSON.string method
 * @returns products details array object .
 *
 */
export async function getOrderProductsDetails(ids: string): Promise<
     | null
     | (ProductType & {
            id: string;
       })[]
> {
     if (!ids) {
          console.log("get Order Products Details:", ids);
          return null;
     }

     const productIds = JSON.parse(ids) as string[];

     try {
          await connectMongoDB();

          const response = await Product.find({
               _id: { $in: productIds },
          }).lean();

          const productsDetails = replaceMongoIds(response) as (ProductType & {
               id: string;
          })[];
          return productsDetails;
     } catch (error) {
          console.log("get Order Products Details:", error);
          return null;
     }
}
