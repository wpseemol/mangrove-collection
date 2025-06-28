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

export default function PaymentStatusComponent({
     row,
}: {
     row: Row<OrderTableType>;
}) {
     return (
          <DropdownMenu>
               <DropdownMenuTrigger asChild>
                    <Button
                         variant="ghost"
                         className="border-gray-300 caption-bottom capitalize"
                    >
                         {/* <span className="sr-only">Open menu</span> */}
                         {row.original.paymentStatus}
                    </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent
                    align="end"
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
               >
                    <DropdownMenuLabel>
                         <strong className="">#{row.original.id}</strong>{" "}
                         Payment Status
                    </DropdownMenuLabel>
                    <DropdownMenuItem value="pending">Pending</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem value="paid">Paid</DropdownMenuItem>
                    <DropdownMenuItem value="failed">Failed</DropdownMenuItem>
               </DropdownMenuContent>
          </DropdownMenu>
     );
}
