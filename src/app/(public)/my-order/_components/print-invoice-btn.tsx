"use client";

import {
     AlertDialog,
     AlertDialogCancel,
     AlertDialogContent,
     AlertDialogFooter,
     AlertDialogHeader,
     AlertDialogTitle,
     AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { OrderProductType } from "@/types/my-order";
import { formatDate } from "@/utils/format-date";
import { Row } from "@tanstack/react-table";
import html2canvas from "html2canvas";
import { useRef } from "react";
import "./invoice-style.css";

export default function PrintInvoiceBtn({
     row,
}: {
     row: Row<OrderProductType>;
}) {
     const invoiceRef = useRef<HTMLDivElement>(null);

     const handlePrint = () => {
          const printContents = invoiceRef.current?.innerHTML;
          if (printContents) {
               const printWindow = window.open("", "_blank");
               if (printWindow) {
                    printWindow.document.write(`
                         <html>
                         <head>
                              <title>Invoice</title>
                              <style>
                                   body {
                                        font-family: Arial, sans-serif;
                                        padding: 0;
                                        margin: 0;
                                        background: #f0f0f0;
                                   }
                                   .invoice-page {
                                        width: 210mm;
                                        min-height: 297mm;
                                        padding: 30mm;
                                        margin: auto;
                                        background: white;
                                        border: 1px solid #ccc;
                                        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
                                        box-sizing: border-box;
                                   }
                                   .invoice-header {
                                        border-bottom: 2px solid #000;
                                        padding-bottom: 10px;
                                        margin-bottom: 20px;
                                   }
                                   .invoice-header h1 {
                                        font-size: 24px;
                                        margin: 0;
                                   }
                                   .invoice-section {
                                        margin-bottom: 20px;
                                   }
                                   .invoice-section strong {
                                        display: inline-block;
                                        width: 120px;
                                   }
                                   .invoice-items {
                                        border-collapse: collapse;
                                        width: 100%;
                                   }
                                   .invoice-items th, .invoice-items td {
                                        border: 1px solid #ddd;
                                        padding: 8px;
                                        text-align: left;
                                   }
                                   .invoice-items th {
                                        background: #f9f9f9;
                                   }
                                   .invoice-total {
                                        text-align: right;
                                        font-size: 16px;
                                        font-weight: bold;
                                        margin-top: 20px;
                                   }
                                   .invoice-watermark {
                                        position: absolute;
                                        top: 40%;
                                        left: 50%;
                                        transform: translate(-50%, -50%) rotate(-30deg);
                                        font-size: 80px;
                                        font-weight: 700;
                                        color: rgba(255, 0, 0, 0.1);
                                        z-index: 0;
                                        pointer-events: none;
                                        }
                              </style>
                         </head>
                         <body>
                              <div class="invoice-page">
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

     const date = formatDate(row.original.createdAt);

     const handleSaveAsImage = async () => {
          try {
               if (!invoiceRef.current) return;

               const canvas = await html2canvas(invoiceRef.current, {
                    scale: 2, // Higher quality
                    logging: false, // Disable console logging
                    useCORS: true, // Handle cross-origin images
                    backgroundColor: "#ffffff", // White background
               });
               const link = document.createElement("a");
               link.download = `invoice-${date}.png`;
               link.href = canvas.toDataURL("image/png", 1.0); // Full quality PNG
               document.body.appendChild(link); // Required for Firefox
               link.click();
               document.body.removeChild(link); // Clean up
          } catch (error) {
               console.log("Image genarate:", error);
               return;
          }
     };

     const data = row.original;

     return (
          <AlertDialog>
               <AlertDialogTrigger asChild>
                    <Button className="text-white ml-auto block mt-3 mb-5 mr-3">
                         Print Invoice
                    </Button>
               </AlertDialogTrigger>
               <AlertDialogContent className=" bg-gray-100 border-gray-900/20 shadow-2xl h-full sm:max-w-screen max-w-screen rounded-none pt-0">
                    <AlertDialogHeader className="">
                         <AlertDialogTitle className="text-left">
                              Invoice View
                         </AlertDialogTitle>

                         {/* Invoice Content */}
                         <div
                              ref={invoiceRef}
                              className="bg-white text-black p-8 rounded shadow invoice-style md:w-3/5 mx-auto h-full w-[30rem] overflow-auto"
                         >
                              <div className="invoice-header">
                                   <h1>Invoice</h1>
                              </div>

                              <div className="invoice-section">
                                   <p>
                                        {/* ekhane order id hobe */}
                                        <strong>Order ID:</strong>{" "}
                                        {data.orderId || data.id}
                                   </p>
                                   <p>
                                        <strong>Customer:</strong>{" "}
                                        {data.address.name}
                                   </p>
                                   {data.address.email && (
                                        <p>
                                             <strong>Email:</strong> {}
                                        </p>
                                   )}
                                   <p>
                                        <strong>Phone:</strong>{" "}
                                        {data.address.phone}
                                   </p>
                                   <p>
                                        <strong>Address:</strong>{" "}
                                        {data.address.fullAddress || "N/A"}
                                   </p>
                              </div>

                              <table className="invoice-items">
                                   <thead>
                                        <tr>
                                             <th>#</th>
                                             <th>Product</th>
                                             <th>Qty</th>
                                             <th>Unit Price</th>
                                             <th>Subtotal</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {data.products?.map((item, idx) => (
                                             <tr key={idx}>
                                                  <td>{idx + 1}</td>
                                                  <td>{item.name}</td>
                                                  <td>{item.quantity}</td>
                                                  <td>
                                                       ৳{item.price.toFixed(2)}
                                                  </td>
                                                  <td>
                                                       ৳
                                                       {(
                                                            item.quantity *
                                                            item.price
                                                       ).toFixed(2)}
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>

                              <div className="invoice-total">
                                   <p>
                                        Subtotal: ৳
                                        {(
                                             data.totalAmount -
                                             data.shippingCost
                                        ).toFixed(2)}
                                   </p>
                                   <p>
                                        Shipping: ৳
                                        {data.shippingCost.toFixed(2)}
                                   </p>
                                   <p className="mt-2">
                                        Grand Total: ৳
                                        {data.totalAmount.toFixed(2)}
                                   </p>
                              </div>

                              {data.paymentStatus !== "completed" && (
                                   <div className="invoice-watermark">
                                        UNPAID
                                   </div>
                              )}
                         </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex justify-between items-center mt-6 absolute bottom-4 right-4">
                         <AlertDialogCancel className="w-fit">
                              Cancel
                         </AlertDialogCancel>
                         <div className="space-x-4">
                              <Button
                                   onClick={handlePrint}
                                   className="bg-blue-600 text-white"
                              >
                                   Print
                              </Button>
                              <Button
                                   onClick={handleSaveAsImage}
                                   className="bg-green-600 text-white"
                              >
                                   Save Picture
                              </Button>
                         </div>
                    </AlertDialogFooter>
               </AlertDialogContent>
          </AlertDialog>
     );
}
