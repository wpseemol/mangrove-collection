"use client";

import { PurchaseContext } from "@/contexts";
import { Dispatch, SetStateAction, useState } from "react";

export default function PurchProvider({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     const [buyProducts, setBuyProducts] = useState<Products[] | null>(null);
     const [shippingCost, setShippingCost] = useState<number | null>(null);
     const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
          null
     );

     const value: PurchaseContextType = {
          buyProducts,
          setBuyProducts,
          shippingCost,
          setShippingCost,
          paymentMethod,
          setPaymentMethod,
     };

     return (
          <>
               <PurchaseContext.Provider value={value}>
                    {children}
               </PurchaseContext.Provider>
          </>
     );
}

interface PurchaseContextType {
     paymentMethod: PaymentMethod | null;
     setPaymentMethod: Dispatch<SetStateAction<PaymentMethod | null>>;
     shippingCost: number | null;
     setShippingCost: Dispatch<SetStateAction<number | null>>;
     buyProducts: Products[] | null;
     setBuyProducts: Dispatch<SetStateAction<Products[] | null>>;
}

interface Products {
     productId: string;
     quantity: number;
     selectedPriceId: string;
}

type PaymentMethod = "cod" | "online-payment" | "card";
