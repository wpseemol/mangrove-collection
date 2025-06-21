"use client";

import { AddProductFormType } from "@/types/add-products";
import Thumbnail from "./thumbnail";

export default function Media({ form }: { form: AddProductFormType }) {
     return (
          <>
               <div id="product-thumbnail" className="mb-4">
                    <Thumbnail form={form} />
               </div>
               <div className="mb-4">{/* <Images form={form} /> */}</div>
          </>
     );
}
