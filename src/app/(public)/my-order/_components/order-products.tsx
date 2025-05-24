import { CurrencyIcon } from "@/components/currency-icon";
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from "@/components/ui/table";
import { OrderProductType } from "@/types/my-order";
import { formatDate } from "@/utils/format-date";
import { Row } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import PrintInvoiceBtn from "./print-invoice-btn";

export default function OrderProducts({ row }: { row: Row<OrderProductType> }) {
     const date = formatDate(row.original.createdAt);

     return (
          <>
               <section className="flex justify-between border-b border-green-800 bg-green-800/10 rounded-t-md p-3 px-6">
                    <h2 className="text-base font-medium">{date}</h2>
                    <h2 className="text-base font-medium capitalize">
                         {row.original.orderStatus}
                    </h2>
               </section>
               <section className="flex flex-col justify-between last:mb-0">
                    <Table>
                         <TableHeader className="border-b border-neutral-900/10">
                              <TableRow>
                                   <TableHead className="w-[100px]">
                                        Image
                                   </TableHead>
                                   <TableHead>Name</TableHead>
                                   <TableHead>Method</TableHead>
                                   <TableHead>Quantity</TableHead>
                                   <TableHead className="text-right">
                                        Amount
                                   </TableHead>
                              </TableRow>
                         </TableHeader>

                         {row.original.products.map((product) => (
                              <TableBody
                                   key={product.productId}
                                   className="border-b border-neutral-900/10 hover:bg-neutral-800/5 duration-200"
                              >
                                   <TableRow>
                                        <TableCell>
                                             <figure className="w-12 h-12 rounded overflow-hidden">
                                                  <Image
                                                       src={product.image}
                                                       alt={product.name}
                                                       width={100}
                                                       height={100}
                                                       className="w-full h-full object-cover object-center group-hover:scale-125 duration-200 group-hover:shadow-md"
                                                  />
                                             </figure>
                                        </TableCell>
                                        <TableCell>
                                             <h2 className="capitalize">
                                                  <Link
                                                       href={`/products/${product.slug}`}
                                                  >
                                                       {product.name.toLowerCase()}
                                                  </Link>
                                             </h2>
                                        </TableCell>
                                        <TableCell className="uppercase">
                                             {row.original.paymentMethod}
                                        </TableCell>
                                        <TableCell className="uppercase">
                                             <p>Qty: {product.quantity}</p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <p>
                                                  {product.price.toFixed(2)}{" "}
                                                  <CurrencyIcon
                                                       currency={
                                                            product.currency
                                                       }
                                                  />
                                             </p>
                                        </TableCell>
                                   </TableRow>
                              </TableBody>
                         ))}
                    </Table>
               </section>
               <PrintInvoiceBtn row={row} />
          </>
     );
}
