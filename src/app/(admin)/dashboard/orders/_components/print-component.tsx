import { Button } from "@/components/ui/button";
import { OrderTableType } from "@/lib/actions/order/getOrderData";
import { Printer } from "lucide-react";

export default function PrintComponent({ dataString }: { dataString: string }) {
     const data = JSON.parse(dataString) as OrderTableType[];

     const handlePrint = () => {
          const printWindow = window.open("", "_blank");
          if (printWindow) {
               printWindow.document.write(`
        <html>
          <head>
            <title>Order Summary</title>
            <style>
              @media print {
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 10px;
                  position: relative;
                }
                .watermark {
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  font-size: 80px;
                  color: rgba(0,0,0,0.1);
                  z-index: -1;
                  pointer-events: none;
                  user-select: none;
                  text-align: center;
                }
                  .logo-top {
                  position: absolute;
                  top: 20px;
                  right: 20px;
                  max-height: 60px;
                  max-width: 150px;
                  border-radius: 10px;
                }
                .watermark .logo {
                  border-radius: 10px;
                  opacity: 0.15;
                  width: 200px;
                  height: auto;
                  margin-top: 20px;
                }
                /* Rest of your existing print styles */
                .print-header { text-align: center; margin-bottom: 20px; }
                .print-table { width: 100%; border-collapse: collapse; }
                .print-table th, .print-table td { 
                  border: 1px solid #ddd; 
                  padding: 8px; 
                  text-align: left; 
                }
                .print-table th { background-color: #f2f2f2; }
                .product-list { margin: 0; padding-left: 20px; }
                .total-row { font-weight: bold; }
              }
              @media (max-width: 600px) {
                .print-table { font-size: 12px; }
                .print-table th, .print-table td { padding: 4px; }
              }
            </style>
          </head>
          <body>
          <img src="/assets/logo/mangrove-collection.png" class="logo-top" alt="Mangrove Collection" />
            <div class="watermark">
              Mangrove Collection
              <img src="/assets/logo/mangrove-collection.png" class="logo" alt="Mangrove Collection" />
            </div>

            <div class="print-header">
              <h2>Order Summary</h2>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
            <table class="print-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Products</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${data
                     .map((order) => {
                          const productList = order.products
                               .map(
                                    (item) =>
                                         `<li>${item.name} (x${
                                              item.quantity
                                         }) - $${item.price.toFixed(2)}</li>`
                               )
                               .join("");

                          return `
                      <tr>
                        <td>${order.id}</td>
                        <td>${order.clientName}</td>
                        <td>${order.phone}</td>
                        <td class="capitalize">${order.orderStatus}</td>
                        <td><ul class="product-list">${productList}</ul></td>
                        <td>${order.totalAmount.toFixed(2)}/=</td>
                      </tr>
                    `;
                     })
                     .join("")}
                <tr class="total-row">
                  <td colspan="5">Total</td>
                  <td>$${data
                       .reduce((sum, item) => sum + item.totalAmount, 0)
                       .toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 100);
            </script>
          </body>
        </html>
      `);
               printWindow.document.close();
          }
     };

     return (
          <Button
               variant="outline"
               onClick={handlePrint}
               className="border-gray-300"
          >
               <Printer className="mr-2 h-4 w-4" />
               Print
          </Button>
     );
}
