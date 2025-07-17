"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
     ColumnDef,
     flexRender,
     getCoreRowModel,
     getPaginationRowModel,
     useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { TableHead, TableHeader } from "@/components/ui/table";
import {
     ColumnFiltersState,
     SortingState,
     VisibilityState,
     getFilteredRowModel,
     getSortedRowModel,
} from "@tanstack/react-table";

export const columns: ColumnDef<Address>[] = [
     {
          accessorKey: "name",
          header: () => (
               <div className="flex justify-center items-center"> Name</div>
          ),
          cell: ({ row }) => {
               return (
                    <div className="flex items-center gap-2 justify-center">
                         {row.original.name}
                    </div>
               );
          },
     },
     {
          accessorKey: "phone",
          header: () => (
               <div className="flex justify-center items-center"> Phone</div>
          ),
          cell: ({ row }) => {
               return (
                    <div className="flex items-center gap-2 justify-center">
                         {row.original.phone}
                    </div>
               );
          },
     },
     {
          accessorKey: "address",
          header: () => (
               <div className="flex justify-center items-center"> Address</div>
          ),
          cell: ({ row }) => {
               return (
                    <div className="flex items-center gap-2 justify-center">
                         {row.original.fullAddress}
                    </div>
               );
          },
     },
     {
          accessorKey: "status",
          header: () => (
               <div className="flex justify-center items-center"> Status</div>
          ),
          cell: ({ row }) => {
               return (
                    <div className="flex items-center gap-2 justify-center">
                         <span>
                              {row.original.isSelected
                                   ? "Selected"
                                   : "Deselected"}
                         </span>
                    </div>
               );
          },
     },
];

export default function AddressBookTable({ data }: { data: AddressBook }) {
     const [sorting, setSorting] = React.useState<SortingState>([]);
     const [columnFilters, setColumnFilters] =
          React.useState<ColumnFiltersState>([]);
     const [columnVisibility, setColumnVisibility] =
          React.useState<VisibilityState>({});
     const [rowSelection, setRowSelection] = React.useState({});

     const table = useReactTable({
          data: data.addresses,
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
          <div className="w-full my-4">
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
               {/* <div className="flex items-center justify-end space-x-2 py-4">
                    <Button className="text-white">
                         <Link href={"/my-order?section=add-new-address"}>
                              Add New Address
                         </Link>
                    </Button>
               </div> */}
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

interface Address {
     name: string;
     email: string | null;
     phone: string;
     landmark?: string;
     region: string | null;
     city: string | null;
     fullAddress: string;
     isSelected: boolean;
     zone: string | null;
}

interface AddressBook {
     userId?: string | null;
     addresses: Address[];
}
