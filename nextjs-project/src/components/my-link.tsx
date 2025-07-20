import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import Link from "next/link";
import { forwardRef } from "react";

type CustomLinkProps = React.ComponentPropsWithoutRef<"a"> & {
     asChild?: boolean;
     forceReload?: boolean;
     href: string;
};

const MyLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
     ({ asChild, className, forceReload = true, onClick, ...props }, ref) => {
          const Comp = asChild ? Slot : "a";

          const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
               if (onClick) onClick(e);

               // If forceReload is true or the user is holding modifier keys
               if (
                    forceReload ||
                    e.ctrlKey ||
                    e.metaKey ||
                    e.shiftKey ||
                    e.altKey ||
                    props.target === "_blank"
               ) {
                    // Let the browser handle the link normally
                    return;
               }

               // Prevent default Next.js behavior for full reload
               if (forceReload) {
                    window.location.href = props.href;
                    e.preventDefault();
               }
          };

          if (forceReload) {
               return (
                    <Comp
                         ref={ref}
                         data-slot="link"
                         className={cn(
                              "hover:text-foreground transition-colors",
                              className
                         )}
                         onClick={handleClick}
                         {...props}
                    />
               );
          }

          return (
               <Link href={props.href} passHref legacyBehavior>
                    <Comp
                         ref={ref}
                         data-slot="link"
                         className={cn(
                              "hover:text-foreground transition-colors",
                              className
                         )}
                         onClick={handleClick}
                         {...props}
                    />
               </Link>
          );
     }
);

MyLink.displayName = "CustomLink";

export default MyLink;
