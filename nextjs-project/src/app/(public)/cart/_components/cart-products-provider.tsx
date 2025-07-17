"use client";

import { CartProductsContext } from "@/contexts";
import { useState } from "react";

export default function CartProductsProvider({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     const [loading, setLoading] = useState<boolean>(true);
     const [cartProducts, setCartProducts] = useState<
          CartProductsType[] | null
     >(null);

     const [cartSelectedProducts, setCartSelectedProducts] = useState<
          CartSelectedProductsType[] | null
     >(null);

     const value = {
          loading,
          setLoading,
          cartProducts,
          setCartProducts,
          cartSelectedProducts,
          setCartSelectedProducts,
     };

     return (
          <>
               <CartProductsContext.Provider value={value}>
                    {children}
               </CartProductsContext.Provider>
          </>
     );
}

interface CartProductsType {
     quantity: number;
     price: number;
     slug: string;
     id: string;
     currency: string;
     name: string;
     thumbnail: string;
     selectedPriceId: string;
}

interface CartSelectedProductsType {
     id: string;
     quantity: number;
     currency: string;
     price: number;
     selectedPriceId: string;
}
