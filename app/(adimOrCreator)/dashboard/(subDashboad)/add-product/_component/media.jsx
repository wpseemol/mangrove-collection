import Images from './media/media-images';
import Thumbnail from './media/media-thumbnail';

export default function Media({ form }) {
    return (
        <>
            <div className="mb-4">
                <Thumbnail form={form} />
            </div>
            <div className="mb-4">
                <Images form={form} />
            </div>
        </>
    );
}
