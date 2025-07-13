"use client";

import { ProductManageType } from "@/lib/actions/products/get-product-manage";
import { Row } from "@tanstack/react-table";
import Link from "next/link";

export default function ProductEdit({ row }: { row: Row<ProductManageType> }) {
     return (
          <Link href={`/dashboard/products/${row.original.slug}/edit`}>
               Edit
          </Link>
     );
}
