"use client";

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
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import * as React from "react";

import { CurrencyIcon } from "@/components/currency-icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
     DropdownMenu,
     DropdownMenuCheckboxItem,
     DropdownMenuContent,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from "@/components/ui/table";
import { useCartProducts } from "@/hooks";
import { CartProductsType } from "@/lib/server/cart";
import Image from "next/image";
import Link from "next/link";
import CartItemRemove from "./cart-item-remove";
import CartQuantity from "./cart-quantity";

export const columns: ColumnDef<CartProductsType>[] = [
     {
          id: "select",
          header: ({ table }) => (
               <Checkbox
                    checked={
                         table.getIsAllPageRowsSelected() ||
                         (table.getIsSomePageRowsSelected() && "indeterminate")
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
          accessorKey: "thumbnail",
          header: "Image",
          cell: ({ row }) => {
               const imgUrl = row.original.thumbnail;
               const productName = row.original.name;

               return (
                    <figure className="w-14 h-14 overflow-hidden bg-neutral-600/55 rounded-sm">
                         <Link href={`/products/${row.original.slug}`}>
                              <Image
                                   src={imgUrl}
                                   width={100}
                                   height={100}
                                   alt={productName}
                                   priority={true}
                                   className="w-full h-full object-cover object-center "
                              />
                         </Link>
                    </figure>
               );
          },
     },
     {
          accessorKey: "name",
          header: ({ column }) => {
               return (
                    <Button
                         variant="ghost"
                         onClick={() =>
                              column.toggleSorting(
                                   column.getIsSorted() === "asc"
                              )
                         }
                    >
                         Name
                         <ArrowUpDown />
                    </Button>
               );
          },
          cell: ({ row }) => (
               <div className="capitalize">
                    <Link href={`/products/${row.original.slug}`}>
                         {row.getValue("name")}
                    </Link>
               </div>
          ),
     },

     {
          accessorKey: "price",
          header: () => <div className="text-right font-medium">Price</div>,
          cell: ({ row }) => {
               const price = row.original.price;

               return (
                    <div className="text-right font-medium">
                         {price.toFixed(2)}{" "}
                         <CurrencyIcon currency={row.original.currency} />
                    </div>
               );
          },
     },
     {
          accessorKey: "quantity",
          header: () => <div className="flex justify-end pr-8">Quantity</div>,
          cell: ({ row }) => <CartQuantity row={row} />,
     },
     {
          accessorKey: "action",
          header: () => (
               <div className="text-right font-medium pr-10">Action</div>
          ),
          cell: ({ row }) => <CartItemRemove row={row} />,
     },
];

export function CartProductTable({ data }: { data: CartProductsType[] }) {
     const [sorting, setSorting] = React.useState<SortingState>([]);
     const [columnFilters, setColumnFilters] =
          React.useState<ColumnFiltersState>([]);
     const [columnVisibility, setColumnVisibility] =
          React.useState<VisibilityState>({});
     const [rowSelection, setRowSelection] = React.useState({});

     const { setCartSelectedProducts, cartProducts } = useCartProducts();

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
          initialState: {
               pagination: {
                    pageSize: 6,
                    pageIndex: 0,
               },
          },
          state: {
               sorting,
               columnFilters,
               columnVisibility,
               rowSelection,
          },
     });

     React.useEffect(() => {
          const selectedOrgenalRows: CartProductsType[] = table
               .getSelectedRowModel()
               .rows.map((itme) => itme.original);

          if (selectedOrgenalRows.length > 0) {
               setCartSelectedProducts(
                    selectedOrgenalRows.map((item) => ({
                         id: item.id,
                         quantity: item.quantity,
                         price: item.price,
                         currency: item.currency,
                         selectedPriceId: item.selectedPriceId,
                    }))
               );
          } else {
               setCartSelectedProducts(null);
          }
     }, [setCartSelectedProducts, rowSelection, table, cartProducts]);

     return (
          <div className="w-full">
               <div className="flex items-center py-4">
                    <Input
                         placeholder="Filter name..."
                         value={
                              (table
                                   .getColumn("name")
                                   ?.getFilterValue() as string) ?? ""
                         }
                         onChange={(event) =>
                              table
                                   .getColumn("name")
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
                                                       column.toggleVisibility(
                                                            !!value
                                                       )
                                                  }
                                             >
                                                  {column.id === "thumbnail"
                                                       ? "Image"
                                                       : column.id}
                                             </DropdownMenuCheckboxItem>
                                        );
                                   })}
                         </DropdownMenuContent>
                    </DropdownMenu>
               </div>
               <div className="rounded-md border border-neutral-800/10">
                    <Table>
                         <TableHeader>
                              {table.getHeaderGroups().map((headerGroup) => (
                                   <TableRow
                                        key={headerGroup.id}
                                        className="border-neutral-800/20 bg-neutral-800/10"
                                   >
                                        {headerGroup.headers.map((header) => {
                                             return (
                                                  <TableHead key={header.id}>
                                                       {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                   header.column
                                                                        .columnDef
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
                                                  row.getIsSelected() &&
                                                  "selected"
                                             }
                                             className="border-neutral-800/10 hover:bg-neutral-700/5 duration-300"
                                        >
                                             {row
                                                  .getVisibleCells()
                                                  .map((cell) => (
                                                       <TableCell key={cell.id}>
                                                            {flexRender(
                                                                 cell.column
                                                                      .columnDef
                                                                      .cell,
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
                                             className="h-24 text-center"
                                        >
                                             <div className="h-24 flex items-center justify-center">
                                                  <motion.div
                                                       initial={{
                                                            opacity: 0,
                                                            y: -10,
                                                       }}
                                                       animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                       }}
                                                       exit={{
                                                            opacity: 0,
                                                            y: 10,
                                                       }}
                                                       className="text-muted-foreground"
                                                  >
                                                       Your cart is empty.
                                                  </motion.div>
                                             </div>
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>
               <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                         {table.getFilteredSelectedRowModel().rows.length} of{" "}
                         {table.getFilteredRowModel().rows.length} row(s)
                         selected.
                    </div>
                    <div className="space-x-2">
                         <Button
                              variant="outline"
                              size="sm"
                              onClick={() => table.previousPage()}
                              disabled={!table.getCanPreviousPage()}
                         >
                              Previous
                         </Button>
                         <Button
                              variant="outline"
                              size="sm"
                              onClick={() => table.nextPage()}
                              disabled={!table.getCanNextPage()}
                         >
                              Next
                         </Button>
                    </div>
               </div>
          </div>
     );
}
