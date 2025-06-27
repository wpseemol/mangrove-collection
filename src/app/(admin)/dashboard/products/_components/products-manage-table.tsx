"use client";

import { Button } from "@/components/ui/button";
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
import {
     ColumnDef,
     flexRender,
     getCoreRowModel,
     getFilteredRowModel,
     getPaginationRowModel,
     getSortedRowModel,
     SortingState,
     useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ProductDelete from "./product-delete";
import ProductEdit from "./product-edit";

const columns: ColumnDef<ProductManageType>[] = [
     {
          accessorKey: "id",
          header: "ID",
          cell: (info) => info.row.index + 1,
     },
     {
          accessorKey: "thumbnail",
          header: "Thumbnail",
          cell: (info) => {
               const src = info.getValue() as string;
               if (!src) return null;
               // Use dynamic import to avoid SSR issues
               return (
                    <Image
                         src={src}
                         alt="Thumbnail"
                         width={48}
                         height={48}
                         className="w-12 h-12 object-cover rounded"
                    />
               );
          },
     },
     {
          accessorKey: "name",
          header: ({ column }) => {
               return (
                    <Button
                         variant="ghost"
                         className="p-0 hover:bg-transparent"
                         onClick={() =>
                              column.toggleSorting(
                                   column.getIsSorted() === "asc"
                              )
                         }
                    >
                         Name
                         <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
               );
          },
          cell: (info) => (
               <p className="capitalize">
                    {info.row.original.name.toLocaleLowerCase()}
               </p>
          ),
     },

     {
          accessorKey: "category",
          header: "Category",
          cell: (info) => (info.getValue() as { name: string }).name,
     },
     {
          accessorKey: "price",
          header: "Price",
          cell: (info) => `${info.getValue()} ${info.row.original.currency}`,
     },
     {
          accessorKey: "action",
          header: () => <p className="text-right pr-14">Action</p>,
          cell: (info) => {
               return (
                    <div className="flex justify-end gap-2 items-center p-2">
                         <ProductEdit info={info} />
                         <span>|</span>
                         <ProductDelete info={info} />
                    </div>
               );
          },
     },
];

export default function ProductsManageTable({
     data,
}: {
     data: ProductManageType[];
}) {
     const [sorting, setSorting] = useState<SortingState>([]);
     const [globalFilter, setGlobalFilter] = useState("");
     const [showCategory, setShowCategory] = useState(true);
     const [showThumbnail, setShowThumbnail] = useState(true);

     const dynamicColumns = [
          columns.find((col) => col.accessorKey === "id"),
          ...(showThumbnail
               ? [columns.find((col) => col.accessorKey === "thumbnail")]
               : []),
          columns.find((col) => col.accessorKey === "name"),
          ...(showCategory
               ? [columns.find((col) => col.accessorKey === "category")]
               : []),
          columns.find((col) => col.accessorKey === "price"),
          columns.find((col) => col.accessorKey === "action"),
     ].filter(Boolean) as ColumnDef<ProductManageType>[];

     const table = useReactTable({
          data,
          columns: dynamicColumns,
          onSortingChange: setSorting,
          getCoreRowModel: getCoreRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          state: {
               sorting,
               globalFilter,
          },
          onGlobalFilterChange: setGlobalFilter,
     });

     return (
          <div className="space-y-4">
               <div className="flex items-center justify-between gap-2">
                    <div>
                         <Input
                              type="text"
                              placeholder="Search by name..."
                              value={globalFilter ?? ""}
                              onChange={(e) => setGlobalFilter(e.target.value)}
                              className="border border-gray-300 px-3 py-2 rounded w-64"
                         />
                    </div>

                    <div className="flex items-center gap-4">
                         <label className="flex items-center gap-2">
                              <input
                                   type="checkbox"
                                   checked={showCategory}
                                   onChange={() => setShowCategory((v) => !v)}
                              />
                              Show Category
                         </label>
                         <label className="flex items-center gap-2">
                              <input
                                   type="checkbox"
                                   checked={showThumbnail}
                                   onChange={() => setShowThumbnail((v) => !v)}
                              />
                              Show Thumbnail
                         </label>
                    </div>
               </div>

               <Table>
                    <TableHeader>
                         {table.getHeaderGroups().map((headerGroup) => (
                              <TableRow key={headerGroup.id}>
                                   {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                             {flexRender(
                                                  header.column.columnDef
                                                       .header,
                                                  header.getContext()
                                             )}
                                        </TableHead>
                                   ))}
                              </TableRow>
                         ))}
                    </TableHeader>
                    <TableBody className="border border-gray-200 rounded-2xl">
                         {table.getRowModel().rows.map((row) => (
                              <TableRow
                                   key={row.id}
                                   className="border-gray-200 hover:bg-gray-50 transition-colors group"
                              >
                                   {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                             {flexRender(
                                                  cell.column.columnDef.cell,
                                                  cell.getContext()
                                             )}
                                        </TableCell>
                                   ))}
                              </TableRow>
                         ))}
                    </TableBody>
               </Table>

               <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                    <span>
                         Page{" "}
                         <strong>
                              {table.getState().pagination.pageIndex + 1} of{" "}
                              {table.getPageCount()}
                         </strong>
                    </span>
               </div>
          </div>
     );
}
