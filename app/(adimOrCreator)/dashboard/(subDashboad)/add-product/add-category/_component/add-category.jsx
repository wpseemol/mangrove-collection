import ProductCategoryContainer from '@/components/dashbord-contaiiner/product-category-container';

export default function AddCategory() {
    return (
        <main className="grid md:grid-cols-3 grid-cols-1 gap-4">
            <ProductCategoryContainer title="Category information">
                <div> this is some compoenent</div>
            </ProductCategoryContainer>
        </main>
    );
}
