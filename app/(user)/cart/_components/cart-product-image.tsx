import { CartProductType } from '@/types/cart';
import { Row } from '@tanstack/react-table';
import Image from 'next/image';

export default function CartProductImage({
    row,
}: {
    row: Row<CartProductType>;
}) {
    const imgUrl: string = row.getValue('thumbnail');
    const productName: string = row.getValue('name');

    return (
        <figure className="w-14 h-14 overflow-hidden bg-neutral-600/55 rounded-sm">
            <Image
                src={imgUrl}
                width={100}
                height={100}
                alt={productName}
                className="w-full h-full object-cover object-center "
            />
        </figure>
    );
}
