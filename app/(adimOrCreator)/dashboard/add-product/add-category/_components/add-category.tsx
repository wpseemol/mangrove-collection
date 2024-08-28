import ProductCategoryContainer from './product-category-container';

export default function AddCategoryComponent() {
    return (
        <section className="grid md:grid-cols-3 grid-cols-1 gap-4 mx-5">
            <ProductCategoryContainer
                className="md:col-span-2"
                title="Category information">
                {/* <AddCategorySection /> */}
                <span>category section</span>
            </ProductCategoryContainer>
        </section>
    );
}
