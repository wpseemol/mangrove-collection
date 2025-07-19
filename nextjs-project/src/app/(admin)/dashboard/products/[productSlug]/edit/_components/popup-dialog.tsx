export default function PopupButton() {
     return <div></div>;
}

import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";

export function PopupDialog({
     children,
     title,
     withFit,
}: {
     children: React.ReactNode;
     title: string;
     withFit?: boolean;
}) {
     return (
          <Dialog>
               <DialogTrigger asChild>
                    <button
                         type="button"
                         className="p-2 rounded hover:bg-gray-100 cursor-pointer "
                         aria-label="Edit Product Name"
                    >
                         <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5 text-gray-500"
                         >
                              <path
                                   strokeLinecap="round"
                                   strokeLinejoin="round"
                                   d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213l-4.182.455.455-4.182 13.089-13.089z"
                              />
                         </svg>
                    </button>
               </DialogTrigger>
               <DialogContent
                    className={`${
                         withFit ? "sm:max-w-fit sm:px-8" : "sm:max-w-[425px]"
                    } bg-gray-100 border-transparent shadow-2xl`}
               >
                    <DialogHeader>
                         <DialogTitle>{title}</DialogTitle>
                         <DialogDescription>
                              Update the product information below.
                         </DialogDescription>
                    </DialogHeader>
                    {children}
               </DialogContent>
          </Dialog>
     );
}
