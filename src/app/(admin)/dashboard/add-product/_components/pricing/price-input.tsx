"use client";
import { Input } from "@/components/ui/input";

import { useState } from "react";

export default function PriceInput({
     onChangeValue,
}: {
     onChangeValue: (value: number) => void;
}) {
     const [inputPrice, setInputPrice] = useState<number | null>(null);

     function handelPriceInput(event: React.ChangeEvent<HTMLInputElement>) {
          if (event) {
               const value = parseFloat(event.target.value);

               onChangeValue(value);
               setInputPrice(value);
          }
     }

     return (
          <>
               <Input
                    value={inputPrice ? inputPrice : ""}
                    type="number"
                    onChange={handelPriceInput}
                    className=" bg-transparent border border-neutral-500/20
                p-2 focus:outline-none focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded placeholder:text-neutral-400"
                    placeholder="Product price"
               />
          </>
     );
}
