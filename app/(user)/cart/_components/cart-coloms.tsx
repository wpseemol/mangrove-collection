'use client';

import { CaretSortIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CartProductType } from '@/types/cart';
import CartProductImage from './cart-product-image';
import TotalOrDeleted from './total-deleted';

export const columns: ColumnDef<CartProductType>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'thumbnail',
        header: 'Image',
        cell: ({ row }) => <CartProductImage row={row} />,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }>
                    Product Name
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue('name')}</div>
        ),
    },
    {
        accessorKey: 'category',
        header: () => <div className="text-right">Category</div>,
        cell: ({ row }) => {
            const category: { name: string; slug: string } =
                row.getValue('category');
            const amount = parseFloat(row.getValue('category'));

            // // Format the amount as a dollar amount
            // const formatted = new Intl.NumberFormat('en-US', {
            //     style: 'currency',
            //     currency: 'USD',
            // }).format(amount);

            return (
                <div className="text-right font-medium">{category.name}</div>
            );
        },
    },
    {
        accessorKey: 'price',
        header: 'Unit Price',
        cell: ({ row }) => {
            const price: number = row.getValue('price');
            const currency = row.original.currency;

            // console.log(row.getValue('price'));
            // const formatter = new Intl.NumberFormat('en-US', {
            //     style: 'currency',
            //     currency: 'BDT',
            //     minimumFractionDigits: 2,
            //     maximumFractionDigits: 2,
            // });

            switch (currency) {
                case 'taka':
                    return (
                        <>
                            <p>{price.toFixed(2)}&#2547;</p>
                        </>
                    );
                case 'dollar':
                    return (
                        <>
                            <p>{price.toFixed(2)}&#36;</p>
                        </>
                    );
                default:
                    <p>{price.toFixed(2)}</p>;
            }
        },
    },

    {
        accessorKey: 'total',
        header: () => <h2 className="text-center">Total</h2>,
        cell: ({ row }) => <TotalOrDeleted row={row} />,
    },
];
