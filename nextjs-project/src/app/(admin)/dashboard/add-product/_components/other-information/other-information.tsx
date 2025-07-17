import { AddProductFormType } from "@/types/add-products";
import CategorySelect from "./category-select";
import ShortDescription from "./short-description";
import TagsComponent from "./tags-component";

export default function OtherInformation({
     form,
     allCategory,
     isFormReset,
}: {
     form: AddProductFormType;
     allCategory: string;
     isFormReset: boolean;
}) {
     return (
          <>
               <section className="mb-4">
                    <CategorySelect form={form} allCategory={allCategory} />
               </section>
               <section className="mb-4">
                    <ShortDescription form={form} />
               </section>
               <section className="mb-4">
                    <TagsComponent form={form} isFormReset={isFormReset} />
               </section>
          </>
     );
}
