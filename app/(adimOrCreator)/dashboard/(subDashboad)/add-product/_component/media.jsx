import Images from './media/media-images';
import Thumbnail from './media/media-thumbnail';

export default function Media({ form }) {
    return (
        <>
            <header className="border-b border-neutral-500/30">
                <h2 className="font-semibold text-lg p-3">
                    Product information
                </h2>
            </header>

            <section className="p-3">
                <div className="mb-4">
                    <Thumbnail form={form} />
                </div>
                <div className="mb-4">
                    <Images form={form} />
                </div>
            </section>
        </>
    );
}
