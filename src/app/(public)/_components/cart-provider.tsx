"use client";

import { CartContext } from "@/contexts";
import { useState } from "react";

export default function CartProvider({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     const [cart, setCart] = useState<Cart>(catStatet);

     const value = { cart, setCart };

     return (
          <>
               <CartContext.Provider value={value}>
                    {children}
               </CartContext.Provider>
          </>
     );
}

interface Cart {
     cartCount: number | null;
     cartProductIds: string[];
}

const catStatet: Cart = {
     cartCount: null,
     cartProductIds: [],
};
