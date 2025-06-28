"use client";

import {
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
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
     DropdownMenu,
     DropdownMenuCheckboxItem,
     DropdownMenuContent,
     DropdownMenuItem,
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
import { Order } from "@/lib/schemas/mongoose/order";
import { orderTableColumns, tableColumns } from "./order-table-columns";

import {
     Select,
     SelectContent,
     SelectGroup,
     SelectItem,
     SelectLabel,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import PrintComponent from "./print-component";

export function OrderManageTable({ dataString }: { dataString: string }) {
     const data = JSON.parse(dataString) as Order[];

     const [sorting, setSorting] = React.useState<SortingState>([]);
     const [columnFilters, setColumnFilters] =
          React.useState<ColumnFiltersState>([]);
     const [columnVisibility, setColumnVisibility] =
          React.useState<VisibilityState>({});
     const [rowSelection, setRowSelection] = React.useState({});
     const [pageSize, setPageSize] = React.useState(5);
     const [customPageSize, setCustomPageSize] = React.useState("");
     const [selectForSearch, setSelectForSearch] = React.useState<string>("id");

     const table = useReactTable({
          data,
          columns: orderTableColumns,
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
               pagination: {
                    pageIndex: 0,
                    pageSize: pageSize,
               },
          },
     });

     const handlePageSizeChange = (size: number) => {
          setPageSize(size);
          setCustomPageSize("");
          table.setPageSize(size);
     };

     const handleCustomPageSize = (
          e: React.KeyboardEvent<HTMLInputElement>
     ) => {
          if (e.key === "Enter") {
               const size = parseInt(customPageSize);
               if (!isNaN(size)) {
                    setPageSize(Math.max(1, size));
                    table.setPageSize(Math.max(1, size));
               }
          }
     };

     return (
          <div className="w-full">
               <div className="flex items-center justify-between py-4">
                    <div className="flex md:flex-row flex-col gap-1 items-center">
                         <Select
                              value={selectForSearch}
                              onValueChange={setSelectForSearch}
                         >
                              <SelectTrigger className="border-gray-300">
                                   <SelectValue placeholder="Select field for search" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-50 border-gray-200">
                                   <SelectGroup>
                                        <SelectLabel>Select filed</SelectLabel>
                                        {Object.keys(searchColumnName).map(
                                             (item) => (
                                                  <SelectItem
                                                       key={item}
                                                       value={item}
                                                  >
                                                       Filter{" "}
                                                       {searchColumnName[item]}
                                                  </SelectItem>
                                             )
                                        )}
                                   </SelectGroup>
                              </SelectContent>
                         </Select>
                         <Input
                              placeholder={`Filter ${searchColumnName[selectForSearch]}...`}
                              value={
                                   (table
                                        .getColumn(selectForSearch)
                                        ?.getFilterValue() as string) ?? ""
                              }
                              onChange={(event) =>
                                   table
                                        .getColumn(selectForSearch)
                                        ?.setFilterValue(event.target.value)
                              }
                              className="max-w-sm border-gray-300"
                         />
                    </div>
                    <div className="flex gap-2">
                         <PrintComponent dataString={dataString} />
                         <DropdownMenu>
                              <DropdownMenuTrigger
                                   asChild
                                   className="border-gray-300"
                              >
                                   <Button variant="outline">
                                        Columns{" "}
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                   </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                   align="end"
                                   className="border-gray-300 bg-gray-100 shadow-md"
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
                                                       onCheckedChange={(
                                                            value
                                                       ) =>
                                                            column.toggleVisibility(
                                                                 !!value
                                                            )
                                                       }
                                                  >
                                                       {tableColumns[column.id]}
                                                  </DropdownMenuCheckboxItem>
                                             );
                                        })}
                              </DropdownMenuContent>
                         </DropdownMenu>
                    </div>
               </div>
               <div className="rounded-md border-gray-400 shadow-sm overflow-hidden">
                    <Table>
                         <TableHeader className="bg-gray-300">
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
                                             className="border-gray-400"
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
                                             colSpan={orderTableColumns.length}
                                             className="h-24 text-center"
                                        >
                                             No results.
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>
               <div className="flex items-center justify-between py-4">
                    <div className="text-muted-foreground text-sm">
                         {table.getFilteredSelectedRowModel().rows.length} of{" "}
                         {table.getFilteredRowModel().rows.length} row(s)
                         selected.
                    </div>

                    <div className="flex items-center space-x-4">
                         <div className="flex items-center space-x-2">
                              <span className="text-sm">Rows per page:</span>
                              <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                        <Button
                                             variant="outline"
                                             size="sm"
                                             className="border-gray-300"
                                        >
                                             {pageSize}{" "}
                                             <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent className="border-gray-300 bg-gray-100 shadow-md">
                                        {[5, 10, 20, 50].map((size) => (
                                             <DropdownMenuItem
                                                  key={size}
                                                  onClick={() =>
                                                       handlePageSizeChange(
                                                            size
                                                       )
                                                  }
                                             >
                                                  {size}
                                             </DropdownMenuItem>
                                        ))}
                                   </DropdownMenuContent>
                              </DropdownMenu>
                              <Input
                                   type="number"
                                   min="1"
                                   placeholder="Custom"
                                   className="w-20 border-gray-300"
                                   value={customPageSize}
                                   onChange={(e) =>
                                        setCustomPageSize(e.target.value)
                                   }
                                   onKeyDown={handleCustomPageSize}
                              />
                         </div>

                         <div className="flex space-x-2">
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
          </div>
     );
}

const searchColumnName = {
     orderStatus: "order status",
     paymentStatus: "payment status",
     paymentMethod: "payment method",
     clientName: "client name",
     id: "id",
     phone: "phone number",
};
