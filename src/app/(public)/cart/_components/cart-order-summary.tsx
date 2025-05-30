"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart, useCartProducts } from "@/hooks";
import { cartProductDelete } from "@/lib/server/cart";
import { setPurchaseData } from "@/lib/server/purchase";
import { PurchaseItemType } from "@/types/purchase";
import { useRouter } from "next/navigation";

export default function CartOrderSummary() {
     const { cartSelectedProducts, setCartProducts, setLoading, loading } =
          useCartProducts();
     const { setCart } = useCart();

     const router = useRouter();

     const subTotal = (cartSelectedProducts ?? []).reduce((acc, curr) => {
          const multiplyPrice = curr.price * curr.quantity;
          return acc + multiplyPrice;
     }, 0);

     const shippingFee = 0;

     const voucherCode = 0;

     const totalPrice = subTotal + shippingFee + voucherCode;

     const totalCount = (cartSelectedProducts ?? []).reduce((acc, curr) => {
          const count = curr.quantity + acc;
          return count;
     }, 0);

     async function handelShipping() {
          setLoading(true);
          try {
               /**
                * [{productId:string , quantity: number,selectedPriceId:string}]
                */
               const purchaseItems = (cartSelectedProducts ?? []).map(
                    (item) => ({
                         productId: item.id,
                         quantity: item.quantity,
                         selectedPriceId: item.selectedPriceId,
                    })
               ) as PurchaseItemType[];

               /**
                * @description set purchase data to cookie
                * @param purchaseItems
                * @returns boolean
                */
               await setPurchaseData(purchaseItems);
          } catch (error) {
               console.log("Product bye error:", error);
          }

          const deletedItemsIds = (cartSelectedProducts ?? []).map(
               (item) => item.id
          );

          setCartProducts((prevData) => {
               if (!prevData) return null;
               const removeProduct = prevData.filter(
                    (item) => !deletedItemsIds.includes(item.id)
               );

               if (removeProduct.length > 0) {
                    return removeProduct;
               }

               return null;
          });

          setCart((prev) => {
               const removeProduct = prev.cartProductIds.filter(
                    (item) => !deletedItemsIds.includes(item)
               );

               const cartCount = removeProduct.length;
               return {
                    cartCount,
                    cartProductIds: removeProduct,
               };
          });

          try {
               await cartProductDelete(deletedItemsIds);
          } catch (error) {
               console.log("Cart DELETE error:", error);
          }

          setLoading(false);

          router.push("/checkout"); // redirect to checkout page
     }

     return cartSelectedProducts ? (
          <Card className={`p-5 h-fit border-neutral-800/10`}>
               <CardHeader className="p-0 font-medium">
                    Order Summary
               </CardHeader>
               <CardContent className="px-0">
                    {/* cart price section */}
                    <div className="flex justify-between items-start my-3">
                         <p>
                              Subtotal (
                              {totalCount > 1
                                   ? totalCount + " items"
                                   : totalCount + " item"}
                              )
                         </p>{" "}
                         <span>{subTotal.toFixed(2)}&#2547;</span>
                    </div>
                    {/* cart price section */}

                    <div className="flex justify-between items-start my-3">
                         <p>Shipping Fee</p>{" "}
                         <span>{shippingFee.toFixed(2)}&#2547;</span>
                    </div>

                    {/* voucher code apply */}
                    <div className="flex items-center gap-2 mb-3">
                         <Input type="text" placeholder="Enter Voucher Code" />{" "}
                         <Button className="text-white">APPLY</Button>
                    </div>
                    {/* voucher code apply */}

                    {/* cart price section */}
                    <div className="flex justify-between items-start mb-3">
                         <p>Total</p>{" "}
                         <span>{totalPrice.toFixed(2)}&#2547;</span>
                    </div>
                    {/* cart price section */}
               </CardContent>

               <Button
                    disabled={loading}
                    onClick={() => handelShipping()}
                    className={`w-full text-white  disabled:pointer-events-auto cursor-pointer ${
                         loading
                              ? "disabled:cursor-progress"
                              : "disabled:cursor-not-allowed"
                    }`}
               >
                    {loading ? "Waiting..." : `Proceed to Pay (${totalCount})`}
               </Button>
          </Card>
     ) : (
          <Card>
               <CardContent>No data found.</CardContent>
          </Card>
     );
}
