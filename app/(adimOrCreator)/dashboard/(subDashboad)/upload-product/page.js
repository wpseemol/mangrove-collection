import UploadComponent from '@/app/Components/upload/UploadComponent';
import getCategory from '@/app/bd/mongoosQuery/getCategory';

export default async function UploadProductPage() {
    const allCategory = await getCategory();

    return (
        <main>
            <UploadComponent allCategory={allCategory} />
        </main>
    );
}
