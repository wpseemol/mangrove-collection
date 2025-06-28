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
import { OrderTableType } from "@/lib/actions/order/getOrderData";
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
     const test = JSON.parse(dataString) as Order[];

     console.log("order details:", test);

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

const data: OrderTableType[] = [
     {
          id: "ORD-78451",
          clientName: "Alex Turner",
          email: "alex.turner@example.com",
          phone: "+1555123456",
          date: new Date("2023-06-15T11:20:00Z"),
          products: [
               {
                    productId: "PROD-4512",
                    name: "Quantum Blender",
                    slug: "quantum-blender",
                    image: "/products/blender.jpg",
                    price: 129.99,
                    currency: "USD",
                    quantity: 1,
                    selectedPriceId: "price-blender-129",
                    variants: {
                         type: "color",
                         title: "Stainless Steel",
                    },
               },
               {
                    productId: "PROD-7845",
                    name: "Nebula Lamp",
                    slug: "nebula-lamp",
                    image: "/products/lamp.jpg",
                    price: 45.5,
                    currency: "USD",
                    quantity: 2,
                    selectedPriceId: "price-lamp-45",
               },
          ],
          totalAmount: 220.99,
          shippingCost: 15.0,
          paymentMethod: "online-payment",
          paymentStatus: "completed",
          orderStatus: "shipped",
          address: "789 Galaxy Way, Suite 200, Austin, TX 78701, USA",
          currency: "taka",
     },
     {
          id: "ORD-91234",
          clientName: "Sophia Chen",
          email: "sophia.chen@example.com",
          phone: "+1888999777",
          date: new Date("2023-06-18T08:45:00Z"),
          products: [
               {
                    productId: "PROD-3366",
                    name: "Aurora Keyboard",
                    slug: "aurora-keyboard",
                    image: "/products/keyboard.jpg",
                    price: 89.99,
                    currency: "USD",
                    quantity: 1,
                    selectedPriceId: "price-keyboard-89",
                    variants: {
                         type: "layout",
                         title: "QWERTY US",
                    },
               },
          ],
          totalAmount: 89.99,
          shippingCost: 0.0,
          paymentMethod: "card",
          paymentStatus: "pending",
          orderStatus: "processing",
          address: "321 Cosmos Lane, Toronto, ON M5V 2H1, Canada",
          currency: "taka",
     },
     {
          id: "ORD-56789",
          clientName: "Marcus Wright",
          email: "marcus.w@example.com",
          phone: "+1444555666",
          date: new Date("2023-06-20T16:30:00Z"),
          products: [
               {
                    productId: "PROD-1122",
                    name: "Infinity Scarf",
                    slug: "infinity-scarf",
                    image: "/products/scarf.jpg",
                    price: 29.99,
                    currency: "USD",
                    quantity: 3,
                    selectedPriceId: "price-scarf-29",
                    variants: {
                         type: "color",
                         title: "Midnight Blue",
                    },
               },
               {
                    productId: "PROD-9988",
                    name: "Celestial Mug",
                    slug: "celestial-mug",
                    image: "/products/mug.jpg",
                    price: 18.75,
                    currency: "taka",
                    quantity: 1,
                    selectedPriceId: "price-mug-18",
               },
          ],
          totalAmount: 108.72,
          shippingCost: 8.5,
          paymentMethod: "cod",
          paymentStatus: "pending",
          orderStatus: "pending",
          address: "555 Stellar Ave, Chicago, IL 60601, USA",
          currency: "taka",
     },
     {
          id: "ORD-34567",
          clientName: "Elena Rodriguez",
          email: "elena.r@example.com",
          phone: "+1777888999",
          date: new Date("2023-06-22T09:15:00Z"),
          products: [
               {
                    productId: "PROD-2233",
                    name: "Solar Charger",
                    slug: "solar-charger",
                    image: "/products/charger.jpg",
                    price: 79.95,
                    currency: "USD",
                    quantity: 1,
                    selectedPriceId: "price-charger-79",
               },
               {
                    productId: "PROD-4455",
                    name: "Lunar Backpack",
                    slug: "lunar-backpack",
                    image: "/products/backpack.jpg",
                    price: 65.0,
                    currency: "USD",
                    quantity: 1,
                    selectedPriceId: "price-backpack-65",
                    variants: {
                         type: "size",
                         title: "Medium",
                    },
               },
          ],
          totalAmount: 144.95,
          shippingCost: 12.0,
          paymentMethod: "online-payment",
          paymentStatus: "completed",
          orderStatus: "delivered",
          address: "222 Orbit Street, Madrid, 28001, Spain",
          currency: "taka",
     },
     {
          id: "ORD-67890",
          clientName: "Daniel Kim",
          email: "daniel.kim@example.com",
          phone: "+1666777888",
          date: new Date("2023-06-25T13:50:00Z"),
          products: [
               {
                    productId: "PROD-5566",
                    name: "Gravity Blanket",
                    slug: "gravity-blanket",
                    image: "/products/blanket.jpg",
                    price: 149.0,
                    currency: "USD",
                    quantity: 1,
                    selectedPriceId: "price-blanket-149",
                    variants: {
                         type: "weight",
                         title: "15 lbs",
                    },
               },
          ],
          totalAmount: 149.0,
          shippingCost: 0.0,
          paymentMethod: "card",
          paymentStatus: "failed",
          orderStatus: "cancelled",
          address: "777 Comet Road, Seoul, South Korea",
          currency: "taka",
     },
];

const searchColumnName = {
     orderStatus: "order status",
     paymentStatus: "payment status",
     paymentMethod: "payment method",
     clientName: "client name",
     id: "id",
};
