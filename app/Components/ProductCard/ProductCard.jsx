import currencyIcon from '@/utils/currencyIcon';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ productDetails }) {
    return (
        <div className="border border-neutral-300/30 group hover:shadow-lg duration-300 sm:w-64 relative overflow-hidden">
            <Link href={'#'}>
                <figure className="overflow-hidden px-2 pt-4">
                    <Image
                        src={productDetails?.thumbnail}
                        width={300}
                        height={300}
                        alt="Product Name"
                        className="w-[17rem] h-[17rem] object-cover group-hover:scale-105 duration-500"
                    />
                </figure>

                <div className="text-center px-3 py-4 ">
                    <h3 className="font-bold text-sm">
                        {productDetails?.category}
                    </h3>
                    <h2>{productDetails?.productName}</h2>

                    <p>
                        <span className="">
                            {currencyIcon(productDetails?.currency)}
                        </span>{' '}
                        {productDetails?.price}{' '}
                        <span className="font-semibold">
                            (1{productDetails?.unit})
                        </span>
                    </p>
                </div>
            </Link>

            <div className="absolute bg-slate-500/60 flex sm:w-64 justify-center items-center gap-3 h-32 -bottom-36 group-hover:bottom-0 left-0 duration-300">
                <button className="text-sm px-4 py-2 bg-green-600 border border-green-600 rounded text-neutral-200 font-bold hover:text-white hover:bg-green-500 origin-top duration-500">
                    Buy Now
                </button>
                <button className=" text-sm px-3 py-2 bg-neutral-200 border border-neutral-200 rounded text-green-700 font-bold hover:text-green-600 hover:bg-white origin-center duration-300">
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
