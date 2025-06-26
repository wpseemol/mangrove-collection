"use client";

import ButtonLoading from "@/components/button-loading";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { addProductDatabase } from "@/lib/actions/products/add-product-action";
import { addProductSchema } from "@/lib/schemas/zod/add-product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import ProductInformation from "./information/product-information";
import Media from "./media/media";
import OtherInformation from "./other-information/other-information";
import Pricing from "./pricing/pricing";
import ProductCategoryContainer from "./product-category-container";
import Variants from "./variants";

export default function AddProduct({ allCategory }: { allCategory: string }) {
     const [isFormReset, setIsFormReset] = useState<boolean>(false);
     const [isFileUpload, setIsFileUpload] = useState<boolean>(false);

     /**
      * isFormReset again false
      */
     useEffect(() => {
          if (isFormReset) {
               setTimeout(() => {
                    setIsFormReset(false);
               }, 1000);
          }
     }, [isFormReset]);

     /**
      * Initializes a React Hook Form instance for the Add Product form using the provided Zod schema.
      */
     const form = useForm<z.infer<typeof addProductSchema>>({
          resolver: zodResolver(addProductSchema),
          defaultValues: {
               name: "",
               slug: "",
               unit: "pc",
               description: "",
               thumbnail: "",
               images: [],
               variants: [
                    { id: "defaultId", type: "default", title: "Default" },
               ],
               currency: "taka",
               price: [{ variantId: "defaultId", price: 1, select: true }],
               category: "",
               shortDescription: "",
               tags: [],
          },
     });

     /**
      * form submit here.
      * @onSubmit
      */

     async function onSubmit(values: z.infer<typeof addProductSchema>) {
          const response = await addProductDatabase(values);
          console.log("test response:", response);
          if (!response.success) {
               toast.error(response.message);
               return;
          }

          if (response.success) {
               toast.success(response.message || "Login successful!");
               form.reset();
               setIsFormReset(true);
               return;
          }
     }

     return (
          <>
               <Form {...form}>
                    <form
                         onSubmit={form.handleSubmit(onSubmit)}
                         className="grid md:grid-cols-3 grid-cols-1 gap-4 md:mx-5 mb-5"
                    >
                         <div className="md:col-span-2">
                              <ProductCategoryContainer
                                   title="Product information"
                                   id="product-information"
                              >
                                   <ProductInformation
                                        form={form}
                                        isFormReset={isFormReset}
                                   />
                              </ProductCategoryContainer>
                              {/* product Media section */}
                              <ProductCategoryContainer
                                   title="Media"
                                   id="media"
                              >
                                   <Media
                                        form={form}
                                        isFormReset={isFormReset}
                                        setIsFileUpload={setIsFileUpload}
                                   />
                              </ProductCategoryContainer>

                              <ProductCategoryContainer
                                   title="Variants"
                                   id="variant-section"
                              >
                                   <Variants
                                        form={form}
                                        isFormReset={isFormReset}
                                   />
                              </ProductCategoryContainer>
                         </div>
                         <div className="md:col-span-1 ">
                              <ProductCategoryContainer
                                   id="product-price"
                                   className="h-fit"
                                   title="Pricing"
                              >
                                   <Pricing
                                        form={form}
                                        isFormReset={isFormReset}
                                   />
                              </ProductCategoryContainer>
                              <ProductCategoryContainer
                                   id="product-outer-info"
                                   className="h-fit"
                                   title="Other information"
                              >
                                   <OtherInformation
                                        allCategory={allCategory}
                                        form={form}
                                        isFormReset={isFormReset}
                                   />
                              </ProductCategoryContainer>
                         </div>

                         <section className="md:col-span-3 -mt-4">
                              <Button
                                   disabled={
                                        form.formState.isSubmitting ||
                                        isFileUpload
                                   }
                                   type="submit"
                                   className="text-white disabled:cursor-wait"
                              >
                                   {isFileUpload ? (
                                        "Wait..."
                                   ) : (
                                        <>
                                             Upload
                                             {form.formState.isSubmitting && (
                                                  <ButtonLoading />
                                             )}
                                        </>
                                   )}
                              </Button>
                         </section>
                    </form>
               </Form>

               <Toaster position="top-center" richColors closeButton />
          </>
     );
}
