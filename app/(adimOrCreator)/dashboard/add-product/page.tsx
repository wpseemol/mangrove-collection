import { auth } from '@/auth/auth';
import { getCategory } from '@/db/mongoos-queries/get-category';
import { CategoryType } from '@/types/mongoose-models';
import AddProduct from './_components/add-product';

export default async function AddProductPage() {
    const allCategory: CategoryType = await getCategory();
    const session = await auth();

    return (
        <>
            <h1 className="md:text-3xl text-2xl font-semibold md:m-5 m-2 ">
                Add product
            </h1>
            {session && (
                <AddProduct
                    allCategory={JSON.stringify(allCategory)}
                    user={session?.user}
                />
            )}
        </>
    );
}
