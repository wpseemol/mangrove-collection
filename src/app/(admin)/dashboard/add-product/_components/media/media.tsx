"use client";

import { AddProductFormType } from "@/types/add-products";
import Thumbnail from "./thumbnail";

export default function Media({
     form,
     isFormReset,
}: {
     form: AddProductFormType;
     isFormReset: boolean;
}) {
     return (
          <>
               <div id="product-thumbnail" className="mb-4">
                    <Thumbnail form={form} isFormReset={isFormReset} />
               </div>
               <div className="mb-4">{/* <Images form={form} /> */}</div>
          </>
     );
}
