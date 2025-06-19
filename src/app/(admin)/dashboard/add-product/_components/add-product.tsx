"use client";

import { Form } from "@/components/ui/form";
import { addProductSchema } from "@/lib/schemas/zod/add-product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "next-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ProductInformation from "./information/product-information";
import ProductCategoryContainer from "./product-category-container";

export default function AddProduct({
     allCategory,
     user,
}: {
     allCategory: string;
     user: string;
}) {
     /**
      * string to make object or content.
      */
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
     const category = JSON.parse(allCategory) as Categories[];
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
     const loginUser = JSON.parse(user) as User;

     const router = useRouter();

     /**
      * Initializes a React Hook Form instance for the Add Product form using the provided Zod schema.
      *
      * - Utilizes `zodResolver` to enforce validation rules defined in `addProductSchema`.
      * - Sets up default values for all product fields, including name, slug, unit, description, images, variants, pricing, category, and tags.
      * - The form state is strongly typed with the inferred type from the Zod schema.
      *
      * @typeParam z.infer<typeof addProductSchema> - The inferred type from the product schema, ensuring type safety for form data.
      * @returns The form instance, including methods and state for managing the Add Product form.
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
               currency: "",
               price: [{ variantId: "regular", price: 1, select: true }],
               category: "",
               shortDescription: "",
               tags: [],
          },
     });

     useEffect(() => {
          if (form.formState.isSubmitting) {
               const isFormError = form.formState.errors;
               if (
                    !!isFormError.name ||
                    !!isFormError.slug ||
                    !!isFormError.description
               ) {
                    router.push("#product-information");
               } else if (!!isFormError.thumbnail) {
                    router.push("#product-thumbnail");
               } else if (!!isFormError.currency) {
                    router.push("#product-price");
               } else if (!!isFormError.category) {
                    router.push("#product-outer-info");
               } else {
                    router.push("");
               }
          }
     }, [form.formState.isSubmitting, form.formState.errors, router]);

     /**
      * form submit here.
      * @onSubmit
      */

     async function onSubmit(values: z.infer<typeof addProductSchema>) {
          console.log(values);
     }

     return (
          <>
               <Form {...form}>
                    <form
                         onSubmit={onSubmit}
                         className="grid md:grid-cols-3 grid-cols-1 gap-4 md:mx-5 mb-5"
                    >
                         <div className="md:col-span-2">
                              <ProductCategoryContainer
                                   title="Product information"
                                   id="product-information"
                              >
                                   <ProductInformation form={form} />
                              </ProductCategoryContainer>
                         </div>
                    </form>
               </Form>
          </>
     );
}

/**
 * Represents a category entity.
 *
 * @interface Categories
 * @property {string} id - The unique identifier for the category.
 * @property {string} name - The name of the category.
 * @property {string} slug - The URL-friendly identifier for the category, typically used in web URLs.
 * @property {string} imgUrl - The URL of the image associated with the category.
 */
interface Categories {
     id: string;
     name: string;
     slug: string;
     imgUrl: string;
}
