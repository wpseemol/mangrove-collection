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
            {/* order status */}

            <section className="flex justify-between border-b border-green-800 bg-green-800/10 rounded-t-md p-3 px-6">
                <h2 className="text-base font-medium">{date}</h2>
                <div className="flex items-center gap-2">
                    {/* Icon based on status */}
                    {row.original.orderStatus === "pending" && (
                        <svg
                            className="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}

                    {row.original.orderStatus === "processing" && (
                        <svg
                            className="w-5 h-5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}

                    {row.original.orderStatus === "shipped" && (
                        <svg
                            className="w-5 h-5 text-purple-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-7a1 1 0 00-.293-.707l-4-4A1 1 0 0016 3h-3a1 1 0 00-1 1v8H7V5a1 1 0 00-1-1H3z" />
                        </svg>
                    )}

                    {row.original.orderStatus === "delivered" && (
                        <svg
                            className="w-5 h-5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}

                    {/* Status text */}
                    <h2 className="text-base font-medium capitalize">
                        {row.original.orderStatus}
                    </h2>
                </div>
            </section>

            <section className="flex flex-col justify-between last:mb-0">
                <Table>
                    <TableHeader className="border-b border-neutral-900/10">
                        <TableRow>
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
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
                                            src={
                                                product.image ||
                                                "/assets/logo/no-image.jpg"
                                            }
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
                                            currency={product.currency}
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
