import Description from './product-information/product-description';
import ProductName from './product-information/product-name';
import ProductSlug from './product-information/product-slug';
import ProductUnit from './product-information/product-unit';

export default function ProductInformation({ form }) {
    return (
        <>
            <div className="mb-4">
                <ProductName form={form} />
            </div>
            <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="col-span-2">
                    <ProductSlug form={form} />
                </div>

                <div className="mb-4">
                    <ProductUnit form={form} />
                </div>
            </div>
            <div className="">
                <Description form={form} />
            </div>
        </>
    );
}
