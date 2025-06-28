import { Button } from "@/components/ui/button";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderTableType } from "@/lib/actions/order/getOrderData";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export default function ActionComponent({ row }: { row: Row<OrderTableType> }) {
     console.log("ActionComponent row:", row);
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
                    <DropdownMenuLabel>
                         {row.original.id} Actions
                    </DropdownMenuLabel>
                    <DropdownMenuItem>
                         <Button size="sm" variant="ghost">
                              Edit Order
                         </Button>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                         <Button size="sm" variant="ghost">
                              Delete Order
                         </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                         <Button size="sm" variant="ghost">
                              View Order
                         </Button>
                    </DropdownMenuItem>
               </DropdownMenuContent>
          </DropdownMenu>
     );
}
