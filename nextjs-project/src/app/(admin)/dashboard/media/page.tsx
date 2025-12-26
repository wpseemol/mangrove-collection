import { getAllCloudinaryImages } from "@/lib/actions/media";

export default async function MedialPage() {

        const images = await getAllCloudinaryImages()
        console.log("images", images);

    return (
        <div className="p-3">

            {JSON.stringify(images)}
        </div>
        
    );
};