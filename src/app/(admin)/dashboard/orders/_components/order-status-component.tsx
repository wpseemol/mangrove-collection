import { Button } from "@/components/ui/button";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderTableType } from "@/lib/actions/order/getOrderData";
import { Row } from "@tanstack/react-table";

export default function OrderStatusComponent({
     row,
}: {
     row: Row<OrderTableType>;
}) {
     return (
          <div className="flex items-center gap-2">
               <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className="h-8 w-8 p-0">
                              {row.getValue("orderStatus") === "pending" && (
                                   <span className="text-yellow-500 font-semibold">
                                        Pending
                                   </span>
                              )}
                              {row.getValue("orderStatus") === "processing" && (
                                   <span className="text-blue-500 font-semibold">
                                        Processing
                                   </span>
                              )}
                              {row.getValue("orderStatus") === "shipped" && (
                                   <span className="text-green-500 font-semibold">
                                        Shipped
                                   </span>
                              )}
                              {row.getValue("orderStatus") === "delivered" && (
                                   <span className="text-gray-500 font-semibold">
                                        Delivered
                                   </span>
                              )}
                              {row.getValue("orderStatus") === "cancelled" && (
                                   <span className="text-red-500 font-semibold">
                                        Cancelled
                                   </span>
                              )}
                         </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                         align="end"
                         className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                         <DropdownMenuLabel className="tex-sm font-normal">
                              {row.original.id} order status
                              <hr className="text-gray-300" />
                         </DropdownMenuLabel>

                         <DropdownMenuItem>Pending</DropdownMenuItem>
                         <DropdownMenuItem>Processing</DropdownMenuItem>
                         <DropdownMenuItem>Shipped</DropdownMenuItem>
                         <DropdownMenuItem>Delivered</DropdownMenuItem>
                         <DropdownMenuItem>Cancelled</DropdownMenuItem>
                    </DropdownMenuContent>
               </DropdownMenu>
          </div>
     );
}
