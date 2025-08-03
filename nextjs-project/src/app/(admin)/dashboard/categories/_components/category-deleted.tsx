"use client";

import { CategoryForManage } from "@/lib/actions/category";
import { Row } from "@tanstack/react-table";

export default function CategoryDeleted({
     row,
}: {
     row: Row<CategoryForManage>;
}) {
     return <button>Deleted</button>;
}
