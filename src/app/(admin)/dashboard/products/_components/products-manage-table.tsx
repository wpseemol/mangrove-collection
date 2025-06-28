"use client";

import {
     ColumnDef,
     ColumnFiltersState,
     flexRender,
     getCoreRowModel,
     getFilteredRowModel,
     getPaginationRowModel,
     getSortedRowModel,
     SortingState,
     useReactTable,
     VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
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
import { ProductManageType } from "@/lib/actions/products/get-product-manage";
import Image from "next/image";
import ProductDelete from "./product-delete";
import ProductEdit from "./product-edit";

export const columns: ColumnDef<ProductManageType>[] = [
     {
          id: "id",
          header: "ID",
          cell: ({ row }) => <h3>{row.index + 1}</h3>,
          enableSorting: false,
          enableHiding: false,
     },
     {
          accessorKey: "thumbnail",
          header: "Thumbnail",
          cell: ({ row }) => (
               <figure>
                    <Image
                         src={row.getValue("thumbnail")}
                         alt={row.original.name}
                         width={48}
                         height={48}
                         className="rounded-md object-cover"
                         unoptimized
                         loading="lazy"
                    />
               </figure>
          ),
     },
     {
          accessorKey: "name",
          enableHiding: false,
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
                    {row.original.name.toLocaleLowerCase()}
               </div>
          ),
     },
     {
          accessorKey: "category",
          header: "Category",
          enableSorting: false,
          cell: ({ row }) => (
               <span className="capitalize">
                    {row.original.category.name.toLocaleLowerCase()}
               </span>
          ),
     },
     {
          accessorKey: "author",
          header: "Author",
          cell: ({ row }) => <span>{row.original.author.name}</span>,
          enableSorting: false,
     },
     {
          accessorKey: "price",
          enableHiding: false,
          header: () => <div className="text-right">Price</div>,
          cell: ({ row }) => {
               return (
                    <div className="text-right font-medium">
                         {row.getValue("price")}
                    </div>
               );
          },
     },
     {
          id: "actions",
          header: () => <div className="text-right mr-20">Actions</div>,
          enableSorting: false,
          enableHiding: false,
          cell: ({ row }) => {
               return (
                    <div className="flex items-center justify-end space-x-2 mr-6">
                         <ProductEdit row={row} /> <span>|</span>
                         <ProductDelete row={row} />
                    </div>
               );
          },
     },
];

export function ProductsManageTable({ data }: { data: ProductManageType[] }) {
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

     return (
          <div className="w-full">
               <div className="flex items-center py-4">
                    <Input
                         placeholder="Search by name..."
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
                         className="max-w-sm border-gray-300"
                    />
                    <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                              <Button
                                   variant="outline"
                                   className="ml-auto border-gray-300"
                              >
                                   Columns <ChevronDown />
                              </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent
                              align="end"
                              className="border-gray-200 bg-gray-100"
                         >
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
                                                  {column.id}
                                             </DropdownMenuCheckboxItem>
                                        );
                                   })}
                         </DropdownMenuContent>
                    </DropdownMenu>
               </div>
               <div className="rounded-md overflow-hidden border border-gray-300">
                    <Table>
                         <TableHeader className="bg-gray-200 dark:bg-gray-800/90 rounded-md">
                              {table.getHeaderGroups().map((headerGroup) => (
                                   <TableRow key={headerGroup.id}>
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
                                             className="border-gray-200 hover:bg-gray-50 duration-100 dark:hover:bg-gray-700/50"
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
                                             No results.
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>
               <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="text-muted-foreground flex-1 text-sm">
                         {table.getFilteredSelectedRowModel().rows.length} of{" "}
                         {table.getFilteredRowModel().rows.length} row(s)
                         selected.
                    </div>
                    <div className="space-x-2">
                         <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300"
                              onClick={() => table.previousPage()}
                              disabled={!table.getCanPreviousPage()}
                         >
                              Previous
                         </Button>
                         <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300"
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
