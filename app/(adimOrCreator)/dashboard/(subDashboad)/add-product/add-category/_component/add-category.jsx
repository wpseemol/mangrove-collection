import AddCategory from '@/components/_upload/AddCategory';
import ProductCategoryContainer from '@/components/dashboard-container/product-category-container';

export default function AddCategoryComponent() {
    return (
        <main className="grid md:grid-cols-3 grid-cols-1 gap-4">
            <ProductCategoryContainer
                className="md:col-span-2"
                title="Category information">
                <AddCategory />
            </ProductCategoryContainer>
        </main>
    );
}
