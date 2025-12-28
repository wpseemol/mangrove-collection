"use client";

import { HeroBannerContext } from "@/contexts";
import { generateUniqueIds } from "@/utils/unique-id-generate";
import React, { useState } from "react";

export interface SlidesType {
  type: "slides" | "right-top" | "right-bottom";
  id: string;
  imageUrl: string;
  title: string;
  linkStatus: boolean;
  linkTarget: string;
}

interface HeroBannerProviderProps {
  children: React.ReactNode;
  bannerSlideData: string;
}

const bannerBottomImage: SlidesType = {
  type: "right-bottom",
  id: "right-bottom",
  title: "",
  imageUrl: "",
  linkTarget: "#",
  linkStatus: false,
};

const bannerTopImage: SlidesType = {
  type: "right-top",
  id: "right-top",
  title: "",
  imageUrl: "",
  linkTarget: "#",
  linkStatus: false,
};

const initialSlides: SlidesType = {
  type: "slides",
  id: generateUniqueIds({ pattern: "****" }) as string,
  title: "",
  imageUrl: "",
  linkTarget: "#",
  linkStatus: false,
};

export function HeroBannerProvider({
  children,
  bannerSlideData,
}: HeroBannerProviderProps) {
  const parseBannerData = (): SlidesType[] => {
    try {
      const parsedData = JSON.parse(bannerSlideData);
      return Array.isArray(parsedData) ? parsedData : [initialSlides, bannerTopImage, bannerBottomImage];
    } catch {
      return [initialSlides, bannerTopImage, bannerBottomImage];
    }
  };

  const [slides, setSlides] = useState<SlidesType[]>(parseBannerData());

  return (
    <HeroBannerContext.Provider value={{ slides, setSlides }}>
      {children}
    </HeroBannerContext.Provider>
  );
}