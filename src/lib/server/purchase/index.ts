"use server";

import { PurchaseItemType } from "@/types/purchase";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

/**
 *
 * @param purchaseItem | PurchaseItemType[]
 * @description
 * 1. set purchase data to cookie
 * @returns boolean
 */
export async function setPurchaseData(
     purchaseItem: PurchaseItemType[]
): Promise<boolean> {
     try {
          /**
           * check purchaseItem is empty or not
           * if empty then return false
           */
          if (!purchaseItem || purchaseItem.length < 1) {
               console.log("purchase data not found.");
               return false;
          }

          const purchases = purchaseItem;
          const token = jwt.sign({ purchases }, SECRET_KEY_PURCHASES, {
               expiresIn: "1y",
          }) as string;

          const cookieStore = await cookies();
          cookieStore.set(COOKIE_KEY_PURCHASES, token, {
               httpOnly: true,
               secure: true,
               maxAge: 31536000, // 1 year
          });
          return true;
     } catch (error) {
          console.error("Error setting purchase data:", error);
          return false;
     }
}

/**
 *
 * @returns Promise<PurchaseItemType[] | null>
 * @description
 * 1. get purchase data from cookie
 * 2. return purchase data
 * 3. return null if no purchase data found
 *
 */
export async function getPurchaseData(): Promise<PurchaseItemType[] | null> {
     try {
          const cookieStore = await cookies();
          const purchaseDataToken =
               cookieStore.get(COOKIE_KEY_PURCHASES)?.value;
          if (!purchaseDataToken) {
               return null;
          }

          try {
               const purchaseItem = jwt.verify(
                    purchaseDataToken,
                    SECRET_KEY_PURCHASES
               ) as { purchases: PurchaseItemType[] };

               if (!purchaseItem || purchaseItem.purchases.length < 1) {
                    console.log("purchase data not found.");
                    return null;
               }

               return purchaseItem.purchases;
          } catch (error) {
               console.error("Error verifying purchase data:", error);
               return null;
          }
     } catch (error) {
          console.error("Error getting purchase data:", error);
          return null;
     }
}

/**
 *
 * @param productId | string
 * @param quantity | number
 * @description
 * 1. update purchase data in cookie
 * 2. return true if success
 * 3. return false if error or no purchase data found
 */
export async function purchaseQuantityUpdate(
     productId: string,
     quantity: number
): Promise<boolean> {
     if (!productId || !quantity) {
          console.log("productId or quantity is empty.");
          return false;
     }

     try {
          const purchaseData = await getPurchaseData();
          if (!purchaseData) {
               return false;
          }

          const purchaseItem = purchaseData.map((item) => {
               if (item.productId === productId) {
                    return {
                         ...item,
                         quantity: quantity,
                    };
               }
               return item;
          });

          const token = jwt.sign(
               { purchases: purchaseItem },
               SECRET_KEY_PURCHASES,
               {
                    expiresIn: "1y",
               }
          ) as string;

          const cookieStore = await cookies();
          cookieStore.set(COOKIE_KEY_PURCHASES, token, {
               httpOnly: true,
               secure: true,
               maxAge: 31536000,
               path: "/",
          });

          return true;
     } catch (error) {
          console.error("Error updating purchase quantity:", error);
          return false;
     }
}

export async function purchaseDataDelete(productId: string): Promise<boolean> {
     if (!productId) {
          console.log("productId is empty.");
          return false;
     }

     try {
          const purchaseData = await getPurchaseData();
          if (!purchaseData) {
               return false;
          }

          const purchaseItem = purchaseData.filter(
               (item) => item.productId !== productId
          );

          const cookieStore = await cookies();
          if (purchaseItem.length < 1) {
               cookieStore.delete(COOKIE_KEY_PURCHASES);
               return true;
          }

          const token = jwt.sign(
               { purchases: purchaseItem },
               SECRET_KEY_PURCHASES,
               {
                    expiresIn: "1y",
               }
          ) as string;

          cookieStore.set(COOKIE_KEY_PURCHASES, token, {
               httpOnly: true,
               secure: true,
               maxAge: 31536000,
               path: "/",
          });
          return true;
     } catch (error) {
          console.error("Error deleting purchase data:", error);
          return false;
     }
}

const SECRET_KEY_PURCHASES = "DKFLKELKksjdfje2443jljdfssldkjf";

const COOKIE_KEY_PURCHASES = "__purchase";
