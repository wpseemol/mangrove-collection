import currencyIcon from '@/utils/currencyIcon';
import Image from 'next/image';
import CardBtn from './CardBtn';

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
        <div
            className="w-full shadow hover:shadow-lg grid lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-3 grid-cols-1 items-center gap-4 lg:h-[17.5rem] md:h-[12rem] h-[17.5rem]
        duration-200
        ">
            <figure className="animate-fade animate-duration-1000 col-span-1 w-full h-full overflow-hidden flex justify-center items-center border-r">
                <Image
                    src={thumbnail}
                    width={300}
                    height={300}
                    className="w-auto"
                    alt={productName}
                />
            </figure>
            <div className=" animate-fade-left animate-duration-1000 md:col-span-3 sm:col-span-2  w-full">
                <p className="text-xs font-extralight hover:text-primaryColor duration-200 text-[#999]">
                    {category?.name}
                </p>
                <h2 className="text-[28px] font-medium my-2">{productName}</h2>
                <p className=" text-green-800 mb-2">
                    <span>{currencyIcon(currency)}</span> {price}{' '}
                    <span className="font-semibold">(1{unit})</span>
                </p>
                <p className="text-[#585858] text-base mb-2">
                    {shortDescription}
                </p>

                <div className="flex items-center gap-3 ">
                    <CardBtn />
                </div>
            </div>
        </div>
    );
}
