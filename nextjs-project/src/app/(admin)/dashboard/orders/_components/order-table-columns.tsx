"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { CurrencyIcon } from "@/components/currency-icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderTableType } from "@/lib/actions/order/getOrderData";
import { mongodbIdToOrderId } from "@/utils/mongodb-id-to-order-id";
import ActionComponent from "./action-component";
import OrderStatusComponent from "./order-status-component";
import PaymentStatusComponent from "./payment-status-component";

export const orderTableColumns: ColumnDef<OrderTableType>[] = [
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
          accessorKey: "id",
          header: "Order ID",
          cell: ({ row }) => (
               <div className="">#{mongodbIdToOrderId(row.original.id)}</div>
          ),
     },
     {
          accessorKey: "clientName",
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
                         Clint Name
                         <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
               );
          },
          cell: ({ row }) => (
               <div className="">{row.getValue("clientName")}</div>
          ),
     },
     {
          accessorKey: "phone",
          enableHiding: false,
          header: ({ column }) => (
               <Button
                    variant="ghost"
                    onClick={() =>
                         column.toggleSorting(column.getIsSorted() === "asc")
                    }
               >
                    Phone Number
                    <ArrowUpDown className="ml-2 h-4 w-4" />
               </Button>
          ),
          cell: ({ row }) => <div className="">{row.getValue("phone")}</div>,
     },
     {
          accessorKey: "product",
          header: "Products",
          enableHiding: false,
          cell: ({ row }) => (
               <div>
                    <ul className="">
                         {row.original.products.map((product) => (
                              <li
                                   key={product.productId}
                                   className="capitalize before:content-['#'] before:mr-1"
                              >
                                   {product.name.toLocaleLowerCase()} (
                                   {product.quantity}x)
                                   {product.price.toFixed(2)}
                                   <CurrencyIcon currency={product.currency} />
                              </li>
                         ))}
                    </ul>
               </div>
          ),
     },

     {
          accessorKey: "totalAmount",
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
                         Total Amount
                         <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
               );
          },
          cell: ({ row }) => {
               return (
                    <div className="font-medium">
                         {row.original.totalAmount.toFixed(2)}{" "}
                         <CurrencyIcon currency={row.original.currency} />
                    </div>
               );
          },
     },
     {
          accessorKey: "date",
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
                         Date
                         <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
               );
          },
          cell: ({ row }) => {
               const date = new Date(row.getValue("date"));
               return (
                    <div className="text-sm text-gray-500">
                         {date.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                         })}{" "}
                         {date.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                         })}
                    </div>
               );
          },
     },
     {
          accessorKey: "paymentMethod",
          header: ({ column }) => (
               <Button
                    variant="ghost"
                    onClick={() =>
                         column.toggleSorting(column.getIsSorted() === "asc")
                    }
               >
                    Payment Method
                    <ArrowUpDown className="ml-2 h-4 w-4" />
               </Button>
          ),
          cell: ({ row }) => (
               <div>
                    {row.getValue("paymentMethod") === "cod"
                         ? "Cash on Delivery"
                         : row.getValue("paymentMethod") === "online-payment"
                         ? "Online Payment"
                         : "Card Payment"}
               </div>
          ),
     },
     {
          accessorKey: "paymentStatus",
          header: "Payment Status",
          cell: ({ row }) => <PaymentStatusComponent row={row} />,
     },
     {
          accessorKey: "orderStatus",
          header: "Order Status",
          cell: ({ row }) => <OrderStatusComponent row={row} />,
     },
     {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => <ActionComponent row={row} />,
          enableSorting: false,
          enableHiding: false,
     },
];

export const tableColumns: Record<string, string> = {
     id: "Order Id",
     date: "Date",
     paymentMethod: "Payment Method",
     paymentStatus: "Payment Status",
     orderStatus: "Order Status",
     action: "Action",
};
