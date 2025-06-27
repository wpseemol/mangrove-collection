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
import { ChevronDown, Printer } from "lucide-react";
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
import { orderTableColumns } from "./order-table-columns";

// Product data
export const products = [
     { id: "p1", name: "T-Shirt", price: 19.99 },
     { id: "p2", name: "Jeans", price: 49.99 },
     { id: "p3", name: "Sneakers", price: 89.99 },
];

interface OrderItem {
     productId: string;
     quantity: number;
}

export interface Payment {
     id: string;
     amount: number;
     status: "pending" | "processing" | "success" | "failed";
     email: string;
     orderItems?: OrderItem[];
}

export function OrderManageTable() {
     const [sorting, setSorting] = React.useState<SortingState>([]);
     const [columnFilters, setColumnFilters] =
          React.useState<ColumnFiltersState>([]);
     const [columnVisibility, setColumnVisibility] =
          React.useState<VisibilityState>({});
     const [rowSelection, setRowSelection] = React.useState({});
     const [pageSize, setPageSize] = React.useState(5);
     const [customPageSize, setCustomPageSize] = React.useState("");

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

     const handlePrint = () => {
          const printWindow = window.open("", "_blank");
          if (printWindow) {
               printWindow.document.write(`
        <html>
          <head>
            <title>Order Summary</title>
            <style>
              @media print {
                body { font-family: Arial, sans-serif; padding: 10px; }
                .print-header { text-align: center; margin-bottom: 20px; }
                .print-table { width: 100%; border-collapse: collapse; }
                .print-table th, .print-table td { 
                  border: 1px solid #ddd; 
                  padding: 8px; 
                  text-align: left; 
                }
                .print-table th { background-color: #f2f2f2; }
                .product-list { margin: 0; padding-left: 20px; }
                .total-row { font-weight: bold; }
              }
              @media (max-width: 600px) {
                .print-table { font-size: 12px; }
                .print-table th, .print-table td { padding: 4px; }
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h2>Order Summary</h2>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
            <table class="print-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Products</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${table
                     .getRowModel()
                     .rows.map((row) => {
                          const payment = row.original;
                          const productList =
                               payment.orderItems
                                    ?.map((item) => {
                                         const product = products.find(
                                              (p) => p.id === item.productId
                                         );
                                         return `<li>${
                                              product?.name || item.productId
                                         } (x${item.quantity})</li>`;
                                    })
                                    .join("") || "<li>No products</li>";

                          return `
                    <tr>
                      <td>${payment.id}</td>
                      <td>${payment.email}</td>
                      <td class="capitalize">${payment.status}</td>
                      <td><ul class="product-list">${productList}</ul></td>
                      <td>$${payment.amount.toFixed(2)}</td>
                    </tr>
                  `;
                     })
                     .join("")}
                <tr class="total-row">
                  <td colspan="4">Total</td>
                  <td>$${data
                       .reduce((sum, item) => sum + item.amount, 0)
                       .toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 100);
            </script>
          </body>
        </html>
      `);
               printWindow.document.close();
          }
     };

     return (
          <div className="w-full">
               <div className="flex items-center justify-between py-4">
                    <Input
                         placeholder="Filter emails..."
                         value={
                              (table
                                   .getColumn("email")
                                   ?.getFilterValue() as string) ?? ""
                         }
                         onChange={(event) =>
                              table
                                   .getColumn("email")
                                   ?.setFilterValue(event.target.value)
                         }
                         className="max-w-sm"
                    />
                    <div className="flex gap-2">
                         <Button
                              variant="outline"
                              onClick={handlePrint}
                              className="border-gray-300"
                         >
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                         </Button>
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
                                                       {column.id}
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
                                        <Button variant="outline" size="sm">
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

const data: Payment[] = [
     {
          id: "m5gr84i9",
          amount: 316,
          status: "success",
          email: "ken99@example.com",
          orderItems: [
               { productId: "p1", quantity: 2 },
               { productId: "p2", quantity: 1 },
          ],
     },
     {
          id: "3u1reuv4",
          amount: 242,
          status: "success",
          email: "Abe45@example.com",
          orderItems: [{ productId: "p3", quantity: 3 }],
     },
     {
          id: "derv1ws0",
          amount: 837,
          status: "processing",
          email: "Monserrat44@example.com",
     },
     {
          id: "5kma53ae",
          amount: 874,
          status: "success",
          email: "Silas22@example.com",
     },
     {
          id: "bhqecj4p",
          amount: 721,
          status: "failed",
          email: "carmella@example.com",
     },
     {
          id: "m5gr84i8",
          amount: 150,
          status: "success",
          email: "john@example.com",
          orderItems: [
               { productId: "p1", quantity: 1 },
               { productId: "p3", quantity: 2 },
          ],
     },
     {
          id: "3u1reuv5",
          amount: 300,
          status: "processing",
          email: "jane@example.com",
     },
     {
          id: "derv1ws1",
          amount: 450,
          status: "success",
          email: "mike@example.com",
          orderItems: [{ productId: "p2", quantity: 3 }],
     },
     {
          id: "5kma53af",
          amount: 200,
          status: "failed",
          email: "sara@example.com",
     },
     {
          id: "bhqecj4q",
          amount: 180,
          status: "success",
          email: "dave@example.com",
     },
];
