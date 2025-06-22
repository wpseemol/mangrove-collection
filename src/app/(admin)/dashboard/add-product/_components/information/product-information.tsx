"use client";

import { AddProductFormType } from "@/types/add-products";
import Description from "./description";
import ProductName from "./product-name";
import ProductSlug from "./product-slug";
import ProductUnit from "./product-unit";

export default function ProductInformation({
     form,
     isFormReset,
}: {
     form: AddProductFormType;
     isFormReset: boolean;
}) {
     return (
          <>
               <div className="mb-4">
                    <ProductName form={form} />
               </div>
               <div className="mb-4 grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                         <ProductSlug form={form} />
                    </div>

                    <div className="mb-4">
                         <ProductUnit form={form} />
                    </div>
               </div>
               <div className="">
                    <Description form={form} isFormReset={isFormReset} />
               </div>
          </>
     );
}
