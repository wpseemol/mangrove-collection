'use client';
import { CartTableRowType } from '@/types/cart';

export default function CartPrice({ row }: CartTableRowType) {
    const price: number = row.getValue('price');
    const currency = row.original.currency;

    // console.log(row.getValue('price'));
    // const formatter = new Intl.NumberFormat('en-US', {
    //     style: 'currency',
    //     currency: 'BDT',
    //     minimumFractionDigits: 2,
    //     maximumFractionDigits: 2,
    // });

    let totalPriceComponent = <span>{price.toFixed(2)}</span>;

    if (currency === 'taka') {
        totalPriceComponent = (
            <>
                <span>{price.toFixed(2)}&#2547;</span>
            </>
        );
    } else if (currency === 'dollar') {
        totalPriceComponent = (
            <>
                <span>{price.toFixed(2)}&#36;</span>
            </>
        );
    }

    return (
        <div className="flex justify-center items-center gap-x-3">
            {totalPriceComponent}
        </div>
    );
}
