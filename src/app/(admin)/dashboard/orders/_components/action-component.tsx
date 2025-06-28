import { Button } from "@/components/ui/button";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderTableType } from "@/lib/actions/order/getOrderData";
import { mongodbIdToOrderId } from "@/utils/mongodb-id-to-order-id";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export default function ActionComponent({ row }: { row: Row<OrderTableType> }) {
     return (
          <DropdownMenu>
               <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                         {/* <span className="sr-only">Open menu</span> */}
                         <MoreHorizontal />
                    </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent
                    align="end"
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
               >
                    <DropdownMenuLabel className="text-xs border-b border-gray-200">
                         #{mongodbIdToOrderId(row.original.id)} Actions
                    </DropdownMenuLabel>
                    <DropdownMenuItem>
                         <Button
                              size="sm"
                              variant="ghost"
                              className="py-0 px-0"
                         >
                              Edit Order
                         </Button>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                         <Button
                              size="sm"
                              variant="ghost"
                              className="py-0 px-0"
                         >
                              Delete Order
                         </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                         <Button
                              size="sm"
                              variant="ghost"
                              className="py-0 px-0"
                         >
                              View Order
                         </Button>
                    </DropdownMenuItem>
               </DropdownMenuContent>
          </DropdownMenu>
     );
}
