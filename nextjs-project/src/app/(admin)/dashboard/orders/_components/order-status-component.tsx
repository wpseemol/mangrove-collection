import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderTableType } from "@/lib/actions/order/getOrderData";
import { orderStatusFiledUpdate } from "@/lib/actions/order/updateOrder";
import { mongodbIdToOrderId } from "@/utils/mongodb-id-to-order-id";
import { Row } from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function OrderStatusComponent({
    row,
}: {
    row: Row<OrderTableType>;
}) {
    const [dropDown, setDropDown] = useState<string>(
        row.getValue("orderStatus")
    );

    const pathName = usePathname();

    async function handleStatusChange(status: string) {
        setDropDown(status);
        if (row.original.orderStatus === status) {
            toast.success("Order Status already Update.");
            return;
        }

        const response = await orderStatusFiledUpdate(
            row.original.id,
            status,
            "orderStatus",
            pathName
        );

        if (response.success) {
            toast.success("Order status update success full.");
            return;
        } else {
            toast.error("Order status is not update please check.");
            return;
        }
    }

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild value={dropDown}>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        {dropDown === "pending" && (
                            <span className="text-yellow-500 font-semibold">
                                Pending
                            </span>
                        )}
                        {dropDown === "processing" && (
                            <span className="text-blue-500 font-semibold">
                                Processing
                            </span>
                        )}
                        {dropDown === "shipped" && (
                            <span className="text-green-500 font-semibold">
                                Shipped
                            </span>
                        )}
                        {dropDown === "delivered" && (
                            <span className="text-gray-500 font-semibold">
                                Delivered
                            </span>
                        )}
                        {dropDown === "cancelled" && (
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
                    <DropdownMenuLabel className="text-sm font-normal">
                        #{mongodbIdToOrderId(row.original.id)} order status
                        <hr className="text-gray-300 mt-1" />
                    </DropdownMenuLabel>

                    {/* Pass the correct status to each menu item */}
                    <DropdownMenuItem
                        onSelect={() => handleStatusChange("pending")}
                        className={
                            row.getValue("orderStatus") === "pending"
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : ""
                        }
                    >
                        Pending
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => handleStatusChange("processing")}
                        className={
                            row.getValue("orderStatus") === "processing"
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : ""
                        }
                    >
                        Processing
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => handleStatusChange("shipped")}
                        className={
                            row.getValue("orderStatus") === "shipped"
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : ""
                        }
                    >
                        Shipped
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => handleStatusChange("delivered")}
                        className={
                            row.getValue("orderStatus") === "delivered"
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : ""
                        }
                    >
                        Delivered
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => handleStatusChange("cancelled")}
                        className={
                            row.getValue("orderStatus") === "cancelled"
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : ""
                        }
                    >
                        Cancelled
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
