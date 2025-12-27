import { getAllCloudinaryImages } from "@/lib/actions/media";
import ImageData from "./_components";

export default async function MedialPage() {

        const images = await getAllCloudinaryImages("")
        

    return (

        images.success && <ImageData imageData={images.data} />
        
    );
};