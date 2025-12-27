"use client";

import { HeroBannerContext } from "@/contexts";
import { generateUniqueIds } from "@/utils/unique-id-generate";
import React, { useState } from "react";




export function HeroBannerProvider({ children }: { children: React.ReactNode }) {
     const [slides, setSlides] = useState<SlidesType[]>([initialSlides,bannerTopImage,bannerBottomImage]);


     return <HeroBannerContext.Provider value={{ slides, setSlides }}>{children}</HeroBannerContext.Provider>;
}




const bannerBottomImage: SlidesType = {
          type: "right-bottom",
          id: "right-bottom", 
          title: "",
          imageUrl: "",
          linkTarget: "#",
          linkStatus: false,
        }


const initialSlides: SlidesType = {
          type: "slides",
          id: generateUniqueIds({ pattern: "****" }) as string,
          title: "",
          imageUrl: "",
          linkTarget: "#",
          linkStatus: false,
        }

const bannerTopImage: SlidesType = {
          type: "right-top",
          id: "right-top",
          title: "",
          imageUrl: "",
          linkTarget: "#",
          linkStatus: false,
        }


export interface SlidesType {
          type: "slides"|"right-top"|"right-bottom";
          id: string;
          imageUrl: string;
          title: string;
          linkStatus: boolean;
          linkTarget: string;
     }