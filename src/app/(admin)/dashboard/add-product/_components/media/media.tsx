"use client";

import { AddProductFormType } from "@/types/add-products";
import { Dispatch, SetStateAction } from "react";
import Images from "./images";
import Thumbnail from "./thumbnail";

export default function Media({
     form,
     isFormReset,
     setIsFileUpload,
}: {
     form: AddProductFormType;
     isFormReset: boolean;
     setIsFileUpload: Dispatch<SetStateAction<boolean>>;
}) {
     return (
          <>
               <div id="product-thumbnail" className="mb-4">
                    <Thumbnail
                         form={form}
                         isFormReset={isFormReset}
                         setIsFileUpload={setIsFileUpload}
                    />
               </div>
               <div className="mb-4">
                    <Images
                         form={form}
                         isFormReset={isFormReset}
                         setIsFileUpload={setIsFileUpload}
                    />
               </div>
          </>
     );
}
