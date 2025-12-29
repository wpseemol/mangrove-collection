"use client";

import { HeroBannerContext } from "@/contexts";
import { generateUniqueIds } from "@/utils/unique-id-generate";
import React, { useState, useMemo } from "react";

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

const DEFAULT_BANNER_BOTTOM: SlidesType = {
  type: "right-bottom",
  id: "right-bottom",
  title: "",
  imageUrl: "",
  linkTarget: "#",
  linkStatus: false,
};

const DEFAULT_BANNER_TOP: SlidesType = {
  type: "right-top",
  id: "right-top",
  title: "",
  imageUrl: "",
  linkTarget: "#",
  linkStatus: false,
};

const DEFAULT_SLIDE: SlidesType = {
  type: "slides",
  id: generateUniqueIds({ pattern: "****" }) as string,
  title: "",
  imageUrl: "",
  linkTarget: "#",
  linkStatus: false,
};

const DEFAULT_SLIDES = [DEFAULT_SLIDE, DEFAULT_BANNER_TOP, DEFAULT_BANNER_BOTTOM];

export function HeroBannerProvider({
  children,
  bannerSlideData,
}: HeroBannerProviderProps) {
  const initialSlides = useMemo(() => {
    try {
      const parsedData = JSON.parse(bannerSlideData) as SlidesType[];
      
      if (!Array.isArray(parsedData)) {
        return DEFAULT_SLIDES;
      }

      // Check if we have both banner types
      const hasTopBanner = parsedData.some(item => item.type === "right-top");
      const hasBottomBanner = parsedData.some(item => item.type === "right-bottom");
      const hasSlides = parsedData.some(item => item.type === "slides");

      // If we have both banners and at least one slide, return as is
      if (hasTopBanner && hasBottomBanner && hasSlides) {
        return parsedData;
      }

      // Otherwise, merge existing data with defaults
      const existingSlides = parsedData.filter(item => item.type === "slides");
      const slidesToUse = existingSlides.length > 0 ? existingSlides : [DEFAULT_SLIDE];
      
      return [
        ...slidesToUse,
        hasTopBanner ? parsedData.find(item => item.type === "right-top")! : DEFAULT_BANNER_TOP,
        hasBottomBanner ? parsedData.find(item => item.type === "right-bottom")! : DEFAULT_BANNER_BOTTOM
      ];
    } catch {
      return DEFAULT_SLIDES;
    }
  }, [bannerSlideData]);

  const [slides, setSlides] = useState<SlidesType[]>(initialSlides);

  return (
    <HeroBannerContext.Provider value={{ slides, setSlides }}>
      {children}
    </HeroBannerContext.Provider>
  );
}