"use client";
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
import { orderStatusFiledUpdate } from "@/lib/actions/order/updateOrder";
import { mongodbIdToOrderId } from "@/utils/mongodb-id-to-order-id";
import { Row } from "@tanstack/react-table";
import { usePathname } from "next/navigation";

import { useState } from "react";
import { toast } from "sonner";

export default function PaymentStatusComponent({
    row,
}: {
    row: Row<OrderTableType>;
}) {
    const [dropDown, setDropDown] = useState<string>(
        row.original.paymentStatus
    );

    const pathName = usePathname();

    const handleStatusChange = async (status: string) => {
        setDropDown(status);
        if (row.original.paymentStatus === status) {
            toast.success("Payment Status already Update.");
            return;
        }

        const response = await orderStatusFiledUpdate(
            row.original.id,
            status,
            "paymentStatus",
            pathName
        );

        if (response.success) {
            toast.success("Payment status update success full.");
            return;
        } else {
            toast.error("Payment status is not update please check.");
            return;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild value={dropDown}>
                <Button
                    variant="ghost"
                    className="border-gray-300 caption-bottom capitalize"
                >
                    {dropDown === "completed" ? "Paid" : dropDown}
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
                    onSelect={() =>
                        // in data base is completed mean paid
                        handleStatusChange("completed")
                    }
                >
                    Paid
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleStatusChange("failed")}>
                    Failed
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={() => handleStatusChange("refunded")}
                >
                    Refunded
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
