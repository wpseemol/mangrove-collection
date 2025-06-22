/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import ButtonLoading from "@/components/button-loading";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { addProductSchema } from "@/lib/schemas/zod/add-product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "next-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ProductInformation from "./information/product-information";
import Media from "./media/media";
import ProductCategoryContainer from "./product-category-container";

export default function AddProduct({
     allCategory,
     user,
}: {
     allCategory: string;
     user: string;
}) {
     const [isFormReset, setIsFormReset] = useState<boolean>(false);

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
      * string to make object or content.
      */

     const loginUser = JSON.parse(user) as User;

     const router = useRouter();

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
               variants: [],
               currency: "tk",
               price: [{ variantId: "regular", price: 1, select: true }],
               category: "some text",
               shortDescription: "short description",
               tags: [],
          },
     });

     /**
      * form submit here.
      * @onSubmit
      */

     async function onSubmit(values: z.infer<typeof addProductSchema>) {
          console.log("upload product:", values);
          if (true) {
               form.reset();
               setIsFormReset(true);
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
                                   />
                              </ProductCategoryContainer>

                              <ProductCategoryContainer
                                   title="Variants"
                                   id="variants"
                              >
                                   coming soon
                              </ProductCategoryContainer>
                         </div>
                         <div className="md:col-span-1 ">
                              <ProductCategoryContainer
                                   id="product-price"
                                   className="h-fit"
                                   title="Pricing"
                              >
                                   coming soon
                              </ProductCategoryContainer>
                              <ProductCategoryContainer
                                   id="product-outer-info"
                                   className="h-fit"
                                   title="Other information"
                              >
                                   coming soon
                              </ProductCategoryContainer>
                         </div>

                         <section className="md:col-span-3 -mt-4">
                              <Button
                                   disabled={form.formState.isSubmitting}
                                   type="submit"
                                   className="text-white"
                              >
                                   Upload
                                   {form.formState.isSubmitting && (
                                        <ButtonLoading />
                                   )}
                              </Button>
                         </section>
                    </form>
               </Form>
          </>
     );
}
