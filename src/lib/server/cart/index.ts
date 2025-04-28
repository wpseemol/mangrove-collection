"use server";

import { connectMongoDB } from "@/db/connections";
import { Product } from "@/lib/schemas/mongoose/product";
import { replaceMongoIds } from "@/utils/replace";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

/**
 *
 * @param productId | string
 * @param selectedPriceId | string
 * @param quantity | number
 * @returns void
 * @description
 * 1. set cart data to cookie
 * 2. if cart data already exist then update the cart data
 * 3. if cart data not exist then create new cart data
 * 4. return cart data
 * 5. return null if error occurs
 * 6. return null if productId or selectedPriceId or quantity is not provided
 * 7. return null if cart data is not found
 */
export async function setCartData(
     productId: string,
     selectedPriceId: string,
     quantity: number
) {
     if (!productId || !selectedPriceId || !quantity) {
          console.error("Please ProdcutId and selectedPriceId are required");
          return;
     }

     const cartItem = {
          productId,
          selectedPriceId,
          quantity,
     };

     try {
          const cartData = await getCartData();

          let cart: CartItemType[] = [];

          if (cartData) {
               const cartDataArray = cartData.cartItem;
               const cartProductIds = cartDataArray.map(
                    (item) => item.productId
               );
               const isCartExist = cartProductIds.includes(productId);
               if (isCartExist) {
                    cart = [...cartDataArray];
               } else {
                    cart = [...cartDataArray, cartItem];
               }
          } else {
               cart = [cartItem];
          }

          const token = jwt.sign({ cart }, SECRET_KEY_CART, {
               expiresIn: "1y",
          }) as string;

          const cookieStore = await cookies();

          cookieStore.set(CART_KEY, token, {
               httpOnly: true,
               secure: true,
               maxAge: 31536000, // 1 year
               path: "/",
          });

          const cartProductIds = cart.map((item) => item.productId);

          return {
               cartProductIds: cartProductIds,
               cartItem: cart,
               carTotalItems: cart.length,
          };
     } catch (error) {
          console.log("set cart data error:", error);
          return null;
     }
}

/**
 * get cart data from cookie
 * @returns Promise<CartItemType[] | null>
 * @description
 * 1. get cart data from cookie
 * 2. return cart data
 * 3. return null if no cart data found
 */
export async function getCartData() {
     try {
          const cookieStore = await cookies();
          const cartDataToken = cookieStore.get(CART_KEY)?.value;
          if (!cartDataToken) {
               return null;
          }

          try {
               const cartItem = jwt.verify(cartDataToken, SECRET_KEY_CART) as {
                    cart: CartItemType[];
               };

               if (!cartItem || cartItem.cart.length < 1) {
                    console.log("cart data not found.");
                    return null;
               }

               const cartProductIds = cartItem.cart.map(
                    (item) => item.productId
               );

               return {
                    cartProductIds,
                    cartItem: cartItem.cart,
                    carTotalItems: cartItem.cart.length,
               };
          } catch (error) {
               console.error("Invalid JWT:", error);
               return null;
          }
     } catch (error) {
          console.error("get cart data error:", error);
          return null;
     }
}

export interface CartItemType {
     productId: string;
     selectedPriceId: string;
     quantity: number;
}

/**
 * get cart product details
 * @returns Promise<CartProductsType[] | null>
 * @description
 * 1. get cart data from cookie
 * 2. get product details from database
 * 3. return product details
 * 4. return null if no product found
 */

export async function getCartProductDetails(): Promise<
     CartProductsType[] | null
> {
     try {
          const cartData = await getCartData();

          if (!cartData) {
               console.log("cart data not found.");
               return null;
          }

          const { cartProductIds, cartItem } = cartData;

          await connectMongoDB();

          const showColumns = "name thumbnail slug price currency";
          const productResponse = await Product.find(
               {
                    _id: { $in: cartProductIds },
               },
               showColumns
          ).lean();

          const product = replaceMongoIds(productResponse) as ProductType[];

          const cartProduct = product.map((pItem) => {
               const cartProductDetails = cartItem.find(
                    (item) => item.productId === pItem.id
               );

               const quantity = cartProductDetails?.quantity || 1;
               const selectedPriceId =
                    cartProductDetails?.selectedPriceId || "";
               const findPrice = pItem.price.find(
                    (item) =>
                         item.variantId === cartProductDetails?.selectedPriceId
               );
               const price = findPrice?.price || 0;

               return {
                    id: pItem.id,
                    name: pItem.name,
                    slug: pItem.slug,
                    thumbnail: pItem.thumbnail,
                    currency: pItem.currency,
                    selectedPriceId,
                    quantity,
                    price,
               };
          }) as CartProductsType[];

          return cartProduct;
     } catch (error) {
          console.error("get cart data product details error:", error);
          return null;
     }
}

interface ProductType {
     id: string;
     name: string;
     slug: string;
     currency: string;
     thumbnail: string;
     price: PriceType[];
}

interface PriceType {
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

export interface CartProductsType {
     quantity: number;
     selectedPriceId: string;
     price: number;
     slug: string;
     id: string;
     currency: string;
     name: string;
     thumbnail: string;
}

/**
 * cart product end section.
 * @param productId
 * @param quantity
 * @returns void
 * @description
 * 1. get cart data from cookie
 * 2. update cart product quantity
 * 3. set cart data to cookie
 * 4. return true if success
 * 5. return false if error occurs
 *
 */
export async function cartQuantityUpdate(
     productId: string,
     quantity: number
): Promise<boolean> {
     if (!productId || !quantity) {
          console.error("Please ProdcutId and quantity are required");
          return false;
     }

     try {
          const cartData = await getCartData();

          if (!cartData) {
               console.log("cart data not found.");
               return false;
          }

          const { cartItem } = cartData;

          const cartProduct = cartItem.map((item) => {
               if (item.productId === productId) {
                    return { ...item, quantity };
               }
               return item;
          });

          const token = jwt.sign({ cart: cartProduct }, SECRET_KEY_CART, {
               expiresIn: "1y",
          }) as string;

          const cookieStore = await cookies();

          cookieStore.set(CART_KEY, token, {
               httpOnly: true,
               secure: true,
               maxAge: 31536000, // 1 year
          });

          return true;
     } catch (error) {
          console.error("cart quantity update error:", error);
          return false;
     }
}

/**
 *
 * @param productIds string[] | string
 * @returns void
 * @description
 * 1. get cart data from cookie
 * 2. delete cart product
 * 3. set cart data to cookie.
 * 4. return true if success
 * 5. return false if error occurs
 */
export async function cartProductDelete(productIds: string[] | string) {
     if (!productIds) {
          console.error("Please ProdcutId are required");
          return false;
     }

     try {
          const cartData = await getCartData();

          if (!cartData || cartData.cartItem.length < 1) {
               console.log("cart data not found.");
               return false;
          }

          const { cartItem } = cartData;

          const cartProduct = cartItem.filter((item) => {
               if (Array.isArray(productIds)) {
                    return !productIds.includes(item.productId);
               }
               return item.productId !== productIds;
          });

          const cookieStore = await cookies();

          if (cartProduct.length < 1) {
               cookieStore.delete(CART_KEY);
               return true;
          }

          /**
           * set cart data to cookie
           */
          const token = jwt.sign({ cart: cartProduct }, SECRET_KEY_CART, {
               expiresIn: "1y",
          }) as string;
          /**
           * set cart data to cookie
           */
          cookieStore.set(CART_KEY, token, {
               httpOnly: true,
               secure: true,
               maxAge: 31536000, // 1 year
          });
          return true;
     } catch (error) {
          console.error("cart product delete error:", error);
          return false;
     }
}

const SECRET_KEY_CART = "DLKJFLAJSLJFlkjdsljfl2094509odkjfooer";
const CART_KEY = "__cart";
