export default function PopupButton() {
     return <div></div>;
}

import { Button } from "@/components/ui/button";
import {
     Dialog,
     DialogClose,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function PopupDialog({
     content,
     filedName,
     title,
}: {
     content: string;
     filedName: string;
     title: string;
}) {
     return (
          <Dialog>
               <DialogTrigger asChild>
                    <button
                         type="button"
                         className="p-2 rounded hover:bg-gray-100 cursor-pointer"
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
               <DialogContent className="sm:max-w-[425px] bg-gray-100 border-transparent shadow-2xl">
                    <DialogHeader>
                         <DialogTitle>{title}</DialogTitle>
                         <DialogDescription>
                              Update the product information below.
                         </DialogDescription>
                    </DialogHeader>
                    <form>
                         <div className="grid gap-4">
                              <div className="grid gap-3">
                                   <Input
                                        id="username-1"
                                        name={filedName}
                                        defaultValue={content}
                                   />
                              </div>
                         </div>
                         <DialogFooter className="mt-2">
                              <DialogClose asChild>
                                   <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button type="submit" className="text-white">
                                   Save changes
                              </Button>
                         </DialogFooter>
                    </form>
               </DialogContent>
          </Dialog>
     );
}
