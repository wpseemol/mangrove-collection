"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
     const { setTheme, themes, theme } = useTheme();

     return (
          <DropdownMenu>
               <DropdownMenuTrigger asChild>
                    <Button
                         variant="outline"
                         size="icon"
                         className="rounded-full dark:hover:right-1 "
                    >
                         <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-100 duration-200" />
                         <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-0 duration-200" />
                         <span className="sr-only">Toggle theme</span>
                    </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent
                    align="end"
                    className="dark:bg-gray-900 bg-gray-100 border-gray-200/15"
               >
                    {themes.map((themeItem) => (
                         <DropdownMenuItem
                              key={themeItem}
                              onClick={() => setTheme(themeItem)}
                              className={`capitalize duration-200 ${
                                   themeItem === theme
                                        ? "bg-primary-foreground text-white"
                                        : ""
                              }`}
                         >
                              {themeItem}
                         </DropdownMenuItem>
                    ))}
               </DropdownMenuContent>
          </DropdownMenu>
     );
}
