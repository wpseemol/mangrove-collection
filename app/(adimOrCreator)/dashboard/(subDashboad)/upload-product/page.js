import getCategory from '@/app/bd/mongoosQuery/getCategory';
import UploadComponent from '@/components/_upload/UploadComponent';

export default async function UploadProductPage() {
    const allCategory = await getCategory();

    return (
        <main>
            <UploadComponent allCategory={allCategory} />
        </main>
    );
}
