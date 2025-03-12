'use client';

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useCartProducts } from '@/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa6';

export const columns: ColumnDef<CartProductsType>[] = [
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
        cell: ({ row }) => {
            const imgUrl: string = row.getValue('thumbnail');
            const productName: string = row.getValue('name');

            return (
                <figure className="w-14 h-14 overflow-hidden bg-neutral-600/55 rounded-sm">
                    <Link href={`/products/${row.original.slug}`}>
                        <Image
                            src={imgUrl}
                            width={100}
                            height={100}
                            alt={productName}
                            className="w-full h-full object-cover object-center "
                        />
                    </Link>
                </figure>
            );
        },
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
                    Name
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="lowercase">
                <Link href={`/products/${row.original.slug}`}>
                    {row.getValue('name')}
                </Link>
            </div>
        ),
    },

    {
        accessorKey: 'price',
        header: () => <div className="text-right font-medium">Price</div>,
        cell: ({ row }) => {
            const price = row.getValue('price');

            return <div className="text-right font-medium">{price}</div>;
        },
    },
    {
        accessorKey: 'quantity',
        header: () => <div className="">Quantity</div>,
        cell: ({ row }) => {
            const { setCartProducts } = useCartProducts();
            const quantity = row.original.quantity;

            const productId = row.original.id;

            const decrease = () => {
                if (quantity > 1) {
                    setCartProducts((prevData) =>
                        prevData.map((item) =>
                            item.id === productId
                                ? { ...item, quantity: quantity - 1 }
                                : item
                        )
                    );
                }
            };

            const increase = () => {
                setCartProducts((prevData) =>
                    prevData.map((item) =>
                        item.id === productId
                            ? { ...item, quantity: quantity + 1 }
                            : item
                    )
                );
            };

            return (
                <div className="font-medium w-fit flex items-center space-x-4 border-t border-b rounded-lg ml-auto">
                    <button
                        disabled={!(quantity > 1)}
                        onClick={decrease}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                        <svg
                            className="w-4 h-4 text-gray-800 dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24">
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h14"
                            />
                        </svg>
                    </button>
                    <span>{quantity}</span>

                    <button
                        onClick={increase}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                        <svg
                            className="w-4 h-4 text-gray-800 dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24">
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h14m-7 7V5"
                            />
                        </svg>
                    </button>
                </div>
            );
        },
    },
    {
        accessorKey: 'action',
        header: () => (
            <div className="text-right font-medium pr-10">Action</div>
        ),
        cell: ({ row }) => {
            const { setCartProducts } = useCartProducts();

            const productId = row.original.id;
            function handelRemove() {
                setCartProducts((prevData) =>
                    prevData.filter((item) => item.id !== productId)
                );

                console.log('click deletet');
            }

            return (
                <div className="text-right font-medium pr-12">
                    <button onClick={handelRemove} className="">
                        <FaTrash className="text-red-600/80 group-hover:scale-125 duration-200" />
                    </button>
                </div>
            );
        },
    },
];

export function CartProductTable({ data }: { data: CartProductsType[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const selectedOrgenalRows: CartProductsType[] = table
        .getSelectedRowModel()
        .rows.map((itme) => itme.original);

    console.log('selected table:', selectedOrgenalRows);

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter emails..."
                    value={
                        (table.getColumn('name')?.getFilterValue() as string) ??
                        ''
                    }
                    onChange={(event) =>
                        table
                            .getColumn('name')
                            ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }>
                                        {column.id === 'thumbnail'
                                            ? 'Image'
                                            : column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{' '}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}>
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

interface CartProductsType {
    quantity: number;
    price: number;
    slug: string;
    id: string;
    currency: string;
    name: string;
    thumbnail: string;
}
