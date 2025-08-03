"use client";

import { Button } from "@/components/ui/button";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForManage } from "@/lib/actions/category";
import { Row } from "@tanstack/react-table";
import { useState } from "react";
import { CategoryUpdateForm } from "./category-update-form";

export default function CategoryEdit({ row }: { row: Row<CategoryForManage> }) {
     const [isOpen, setIsOpen] = useState<boolean>(false);
     return (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
               <DialogTrigger asChild>
                    <Button
                         type="button"
                         aria-label="Delete Product"
                         variant="ghost"
                         size="sm"
                         className=""
                    >
                         Edit Category
                    </Button>
               </DialogTrigger>
               <DialogContent
                    className={`sm:max-w-[625px] bg-gray-100 border-transparent shadow-2xl`}
               >
                    <DialogHeader>
                         <DialogTitle className="">
                              {`Category Update: ${row.original.name}`}
                         </DialogTitle>
                         <DialogDescription>
                              Update the category details below.
                         </DialogDescription>
                    </DialogHeader>
                    <CategoryUpdateForm
                         content={JSON.stringify({
                              name: row.original.name,
                              slug: row.original.slug,
                              imgUrl: row.original.imgUrl,
                         })}
                         categoryId={row.original.id}
                    />
               </DialogContent>
          </Dialog>
     );
}
