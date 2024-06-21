import currencyIcon from '@/utils/currencyIcon';
import Image from 'next/image';

export default function ListViewCard({ productDetails }) {
    const {
        productName,
        category,
        offer,
        shortDescription,
        currency,
        price,
        unit,
        slug,
        thumbnail,
    } = productDetails;

    return (
        <div className="w-full border border-neutral-300/30 grid lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-3 grid-cols-1 items-center gap-4 ">
            <figure className="border col-span-1 h-[17.5rem] overflow-hidden flex justify-center items-center">
                <Image
                    src={thumbnail}
                    width={300}
                    height={300}
                    className="w-auto"
                    alt={productName}
                />
            </figure>
            <div className=" lg:col-span-3 sm:col-span-2 border w-full">
                <p>{category?.name}</p>
                <h2>{productName}</h2>
                <p className="animate-fade-up animate-duration-1000">
                    <span>{currencyIcon(currency)}</span> {price}{' '}
                    <span className="font-semibold">(1{unit})</span>
                </p>
                <p>{shortDescription}</p>

                <div>
                    <button className="text-sm px-4 py-2 bg-green-600 border border-green-600 rounded text-neutral-200 font-bold hover:text-white hover:bg-green-500 origin-top duration-500">
                        Buy Now
                    </button>
                    <button className=" text-sm px-3 py-2 bg-neutral-200 border border-neutral-200 rounded text-green-700 font-bold hover:text-green-600 hover:bg-white origin-center duration-300">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
