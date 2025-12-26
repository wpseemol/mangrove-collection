"use client";

import { HeroBannerContext } from "@/contexts";
import { generateUniqueIds } from "@/utils/unique-id-generate";
import React, { useState } from "react";




export function HeroBannerProvider({ children }: { children: React.ReactNode }) {
     const [slides, setSlides] = useState<SlidesType[]>([initialSlides])


     return <HeroBannerContext.Provider value={{ slides, setSlides }}>{children}</HeroBannerContext.Provider>;
}


const initialSlides: SlidesType = {
          id: generateUniqueIds({ pattern: "****" }) as string,
          title: "",
          imageUrl: "",
          linkTarget: "#",
          linkStatus: false,
        }



export interface SlidesType {
          id: string;
          imageUrl: string;
          title: string;
          linkStatus: boolean;
          linkTarget: string;
     }