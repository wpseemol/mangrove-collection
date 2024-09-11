import { Button } from '@/components/ui/button';
import { CartProductType } from '@/types/cart';
import { Row } from '@tanstack/react-table';
import { MdDelete } from 'react-icons/md';

export default function TotalOrDeleted({ row }: { row: Row<CartProductType> }) {
    const price: number = row.getValue('price');
    const currency = row.original.currency;
    const quantity = row.original.quantity;

    console.log('cart product quentity:', quantity);

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
            {totalPriceComponent} <span className="text-xl">|</span>{' '}
            <CartItemDeleted row={row} />{' '}
        </div>
    );
}

function CartItemDeleted({ row }: { row: Row<CartProductType> }) {
    function handelDeleted() {
        console.log('click for deleted');
    }

    return (
        <Button
            onClick={() => handelDeleted()}
            variant={'ghost'}
            className="p-0 text-lg">
            <MdDelete />
        </Button>
    );
}
