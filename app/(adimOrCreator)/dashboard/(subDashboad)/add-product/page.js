import getCategory from '@/app/bd/mongoosQuery/getCategory';
import AddProductSection from './_component/add-product-section';

export default async function AddProductPage() {
    const allCategory = await getCategory();

    return (
        <>
            <h1 className="md:text-3xl text-2xl font-semibold md:ml-5 ml-2 md:mb-5 mb-2">
                Add product
            </h1>
            <AddProductSection allCategory={allCategory} />
        </>
    );
}
