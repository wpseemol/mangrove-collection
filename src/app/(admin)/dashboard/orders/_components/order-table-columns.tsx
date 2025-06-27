"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Payment, products } from "./order-manage-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const orderTableColumns: ColumnDef<Payment>[] = [
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
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => (
               <div className="capitalize">{row.getValue("status")}</div>
          ),
     },
     {
          accessorKey: "email",
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
                         Email
                         <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
               );
          },
          cell: ({ row }) => (
               <div className="lowercase">{row.getValue("email")}</div>
          ),
     },
     {
          accessorKey: "amount",
          header: () => <div className="text-right">Amount</div>,
          cell: ({ row }) => {
               const amount = parseFloat(row.getValue("amount"));

               const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
               }).format(amount);

               return <div className="text-right font-medium">{formatted}</div>;
          },
     },
     {
          id: "products",
          header: "Products",
          cell: ({ row }) => {
               const payment = row.original;
               const [quantities, setQuantities] = useState<
                    Record<string, number>
               >(
                    Object.fromEntries(
                         products.map((product) => [
                              product.id,
                              payment.orderItems?.find(
                                   (item) => item.productId === product.id
                              )?.quantity || 0,
                         ])
                    )
               );

               const handleQuantityChange = (
                    productId: string,
                    value: number
               ) => {
                    const newQuantity = Math.max(0, value);
                    setQuantities((prev) => ({
                         ...prev,
                         [productId]: newQuantity,
                    }));

                    // In a real app, you would update the order here
                    console.log(
                         `Updated product ${productId} quantity to ${newQuantity}`
                    );
               };

               const getProductName = (productId: string) => {
                    return (
                         products.find((p) => p.id === productId)?.name ||
                         productId
                    );
               };

               return (
                    <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                   {payment.orderItems?.reduce(
                                        (sum, item) => sum + item.quantity,
                                        0
                                   ) || 0}{" "}
                                   items
                              </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent className="w-64 p-4">
                              <DropdownMenuLabel>
                                   Product Quantities
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <div className="space-y-3">
                                   {products.map((product) => (
                                        <div
                                             key={product.id}
                                             className="flex items-center justify-between"
                                        >
                                             <span className="text-sm">
                                                  {product.name}
                                             </span>
                                             <Input
                                                  type="number"
                                                  min="0"
                                                  className="w-20"
                                                  value={
                                                       quantities[product.id] ||
                                                       0
                                                  }
                                                  onChange={(e) =>
                                                       handleQuantityChange(
                                                            product.id,
                                                            parseInt(
                                                                 e.target.value
                                                            ) || 0
                                                       )
                                                  }
                                             />
                                        </div>
                                   ))}
                              </div>
                         </DropdownMenuContent>
                    </DropdownMenu>
               );
          },
     },
     {
          id: "actions",
          enableHiding: false,
          cell: ({ row }) => {
               const payment = row.original;

               return (
                    <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                   <span className="sr-only">Open menu</span>
                                   <MoreHorizontal className="h-4 w-4" />
                              </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                   onClick={() =>
                                        navigator.clipboard.writeText(
                                             payment.id
                                        )
                                   }
                              >
                                   Copy payment ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>View customer</DropdownMenuItem>
                              <DropdownMenuItem>
                                   View payment details
                              </DropdownMenuItem>
                         </DropdownMenuContent>
                    </DropdownMenu>
               );
          },
     },
];
