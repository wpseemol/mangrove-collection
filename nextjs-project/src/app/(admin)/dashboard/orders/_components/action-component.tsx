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
import { MoreHorizontal, Printer, Edit, Trash } from "lucide-react";
import { useRef } from "react";

export default function ActionComponent({ row }: { row: Row<OrderTableType> }) {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const order = row.original;

    const handelPrintInvoice = () => {
        const printContents = invoiceRef.current?.innerHTML;
        if (printContents) {
            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Invoice - ${mongodbIdToOrderId(order.id)}</title>
                            <style>
                                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 0; }
                                .invoice-page { width: 210mm; margin: auto; padding: 20mm; box-sizing: border-box; position: relative; }
                                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                                .company-info h1 { margin: 0; font-size: 28px; text-transform: uppercase; color: #000; }
                                .invoice-details { text-align: right; }
                                .section-title { font-size: 12px; text-transform: uppercase; color: #777; margin-bottom: 5px; font-weight: bold; }
                                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                                .invoice-items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                                .invoice-items th { background: #f8f8f8; text-align: left; border-bottom: 2px solid #eee; padding: 12px; font-size: 14px; }
                                .invoice-items td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                                .totals { margin-left: auto; width: 250px; }
                                .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                                .grand-total { border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 18px; }
                                .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(0,0,0,0.03); font-weight: bold; z-index: -1; pointer-events: none; }
                                @media print { .invoice-page { border: none; box-shadow: none; } }
                            </style>
                        </head>
                        <body>
                            <div class="invoice-page">
                                <div class="watermark">${order.paymentStatus.toUpperCase()}</div>
                                ${printContents}
                            </div>
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    return (
        <>
            {/* Hidden Invoice Template - Used only for Printing */}
            <div style={{ display: "none" }}>
                <div ref={invoiceRef}>
                    <div className="header">
                        <div className="company-info">
                            <h1>INVOICE</h1>
                            <p>
                                <strong>Mangrove Collection</strong>
                                <br />
                                Gmail: mangrove.collection@gmail.com
                                <br />
                                Phone: +880 1323 846556
                            </p>
                        </div>
                        <div className="invoice-details">
                            <p>
                                <span className="section-title">Invoice #</span>
                                <br />
                                <strong>{mongodbIdToOrderId(order.id)}</strong>
                            </p>
                            <p>
                                <span className="section-title">Date</span>
                                <br />
                                {new Date(order.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="grid">
                        <div>
                            <p className="section-title">Bill To:</p>
                            <p>
                                <strong>{order.clientName}</strong>
                                <br />
                                {order.address}
                                <br />
                                {order.phone}
                                <br />
                                {order.email}
                            </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p className="section-title">Payment Method:</p>
                            <p>
                                {order.paymentMethod.toUpperCase()}
                                <br />
                                Status: {order.paymentStatus.toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <table className="invoice-items">
                        <thead>
                            <tr>
                                <th>Product Details</th>
                                <th style={{ textAlign: "right" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.products.map(
                                (product: any, index: number) => (
                                    <tr key={index}>
                                        <td>
                                            <strong>
                                                {product.name || "Product Name"}
                                            </strong>
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#666",
                                                }}
                                            >
                                                ID: {product.id || "N/A"}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            {order.totalAmount -
                                                order.shippingCost}{" "}
                                            {order.currency}
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>

                    <div className="totals">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>
                                {order.totalAmount - order.shippingCost}{" "}
                                {order.currency}
                            </span>
                        </div>
                        <div className="total-row">
                            <span>Shipping:</span>
                            <span>
                                {order.shippingCost} {order.currency}
                            </span>
                        </div>
                        <div className="total-row grand-total">
                            <span>Total Amount:</span>
                            <span>
                                {order.totalAmount} {order.currency}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dropdown Menu UI */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-48 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                    <DropdownMenuLabel className="text-xs font-semibold px-2 py-1.5 opacity-50">
                        #{mongodbIdToOrderId(order.id)} Actions
                    </DropdownMenuLabel>

                    <DropdownMenuItem className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Edit Order
                    </DropdownMenuItem>

                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete Order
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={handelPrintInvoice}
                    >
                        <Printer className="mr-2 h-4 w-4" /> Print Invoice
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
