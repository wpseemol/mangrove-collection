import { cn } from "@/lib/utils";
import { AiOutlineReload } from "react-icons/ai";
import { FcSynchronize } from "react-icons/fc";

export default function ButtonLoading() {
     return (
          <>
               ...
               <span className="ml-2">
                    <FcSynchronize className="text-xl animate-spin" />
               </span>
          </>
     );
}

export function LoadingIcon({ className }: { className?: string }) {
     return (
          <span>
               <AiOutlineReload
                    className={cn(`text-xl animate-spin`, className)}
               />
          </span>
     );
}
