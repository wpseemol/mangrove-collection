"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { OrderProductType } from "@/types/my-order";
import {
     ColumnDef,
     flexRender,
     getCoreRowModel,
     getPaginationRowModel,
     useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import OrderProducts from "./order-products";

export const columns: ColumnDef<OrderProductType>[] = [
     {
          accessorKey: "createdAt",
          header: "Created At",
          cell: ({ row }) => {
               return <OrderProducts row={row} />;
          },
     },
];

export default function OrderTable({
     orderProducts,
}: {
     orderProducts: OrderProductType[];
}) {
     const [pageIndex, setPageIndex] = useState(0);
     const pageSize = 5;

     const table = useReactTable({
          columns,
          data: orderProducts,
          getCoreRowModel: getCoreRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          state: { pagination: { pageIndex, pageSize } },
          onPaginationChange: (updater) => {
               if (typeof updater === "function") {
                    setPageIndex(
                         (prev) =>
                              updater({ pageIndex: prev, pageSize }).pageIndex
                    );
               } else {
                    setPageIndex(updater.pageIndex);
               }
          },
     });

     return (
          <section className=" bg-white rounded-lg ">
               <Table>
                    <TableBody>
                         {table.getRowModel().rows?.length ? (
                              table.getRowModel().rows.map((row) => (
                                   <TableRow
                                        key={row.id}
                                        data-state={
                                             row.getIsSelected() && "selected"
                                        }
                                        className="border-none"
                                   >
                                        {row.getVisibleCells().map((cell) => (
                                             <TableCell
                                                  key={cell.id}
                                                  className="p-0"
                                             >
                                                  {flexRender(
                                                       cell.column.columnDef
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
          </section>
     );
}
