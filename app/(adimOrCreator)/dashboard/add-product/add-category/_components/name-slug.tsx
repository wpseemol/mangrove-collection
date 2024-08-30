import { AddCategoryFormType } from '@/types/add-category';
import CategoryName from './category-name';
import CategorySlug from './category-slug';

export default function NameSlugSection({
    form,
}: {
    form: AddCategoryFormType;
}) {
    return (
        <div className="mb-4 grid md:grid-cols-4 grid-cols-1 gap-3">
            <div className="md:col-span-2">
                <CategoryName form={form} />
            </div>

            <div className="md:col-span-2">
                <CategorySlug form={form} />
            </div>
        </div>
    );
}
