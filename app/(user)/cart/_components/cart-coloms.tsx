'use client';

import { CaretSortIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CartProductType } from '@/types/cart';
import CartPrice from './cart-price';
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
                    className="mx-auto"
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
        header: () => <div className="text-center">Category</div>,
        cell: ({ row }) => {
            const category: { name: string; slug: string } =
                row.getValue('category');
            const amount = parseFloat(row.getValue('category'));

            return (
                <div className="text-center font-medium">{category.name}</div>
            );
        },
    },
    {
        accessorKey: 'price',
        header: () => <h2 className="text-center">Unit Price</h2>,
        cell: ({ row }) => <CartPrice row={row} />,
    },

    {
        accessorKey: 'total',
        header: () => <h2 className="text-center">Total</h2>,
        cell: ({ row }) => <TotalOrDeleted row={row} />,
    },
];
