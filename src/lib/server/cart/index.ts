"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function setCartData(
     productId: string,
     selectePriceId: string,
     quantity: number
) {
     if (!productId || !selectePriceId || !quantity) {
          console.error("Please ProdcutId and selectedPriceId are required");
          return;
     }

     const cartItem = {
          productId,
          selectePriceId,
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

          cookieStore.set("_cart", token, {
               httpOnly: true,
               secure: true,
               maxAge: 31536000, // 1 day
               path: "/",
          });

          return {
               cartItem: cart,
               carTotalItems: cart.length,
          };
     } catch (error) {
          console.log("set cart data error:", error);
          return null;
     }
}

export async function getCartData() {
     try {
          const cookieStore = await cookies();
          const cartDataToken = cookieStore.get("_cart")?.value;
          if (!cartDataToken) {
               return null;
          }

          try {
               const cartItem = jwt.verify(cartDataToken, SECRET_KEY_CART) as {
                    cart: CartItemType[];
               };

               return {
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

const SECRET_KEY_CART = "DLKJFLAJSLJFlkjdsljfl2094509odkjfooer";

interface CartItemType {
     productId: string;
     selectePriceId: string;
     quantity: number;
}
