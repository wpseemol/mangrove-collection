import { AddProductFormType } from '@/types/add-product';
import CategorySelect from './other-information/category-select';
import ShortDescription from './other-information/short-description';

export default function OtherInformation({
    form,
    allCategory,
}: {
    form: AddProductFormType;
    allCategory: string;
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
                {/* <TagsComponent form={form} /> */}
            </section>
        </>
    );
}
