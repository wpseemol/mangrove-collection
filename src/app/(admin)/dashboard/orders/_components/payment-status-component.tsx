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
import { mongodbIdToOrderId } from "@/utils/mongodb-id-to-order-id";
import { Row } from "@tanstack/react-table";

export default function PaymentStatusComponent({
     row,
}: {
     row: Row<OrderTableType>;
}) {
     const handleStatusChange = (status: string) => {
          // Add your status update logic here
          console.log(`Changing status to: ${status}`);
          // Example: updateOrderStatus(row.original.id, status);
     };

     return (
          <DropdownMenu>
               <DropdownMenuTrigger asChild>
                    <Button
                         variant="ghost"
                         className="border-gray-300 caption-bottom capitalize"
                    >
                         {row.original.paymentStatus}
                    </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent
                    align="end"
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
               >
                    <DropdownMenuLabel>
                         <strong className="">
                              #{mongodbIdToOrderId(row.original.id)}
                         </strong>{" "}
                         Payment Status
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                         onSelect={() => handleStatusChange("pending")}
                    >
                         Pending
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                         onSelect={() => handleStatusChange("paid")}
                    >
                         Paid
                    </DropdownMenuItem>
                    <DropdownMenuItem
                         onSelect={() => handleStatusChange("failed")}
                    >
                         Failed
                    </DropdownMenuItem>
               </DropdownMenuContent>
          </DropdownMenu>
     );
}
