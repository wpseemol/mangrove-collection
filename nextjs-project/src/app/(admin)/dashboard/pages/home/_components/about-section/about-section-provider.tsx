"use client";

import { AboutSectionContext } from "@/contexts";
import { defaultAboutData } from "@/db/home/sliderContent";
import { DetailsSectionType } from "@/types/home";
import React from "react";

export default function AboutSectionProvider({
    children,
    data,
}: {
    children: React.ReactNode;
    data: string;
}) {
    let defaultData: DetailsSectionType[] = [];
    if (data) {
        const responseData = JSON.parse(data) as {
            detailsSections: DetailsSectionType[];
        };
        defaultData = responseData.detailsSections;
    } else {
        defaultData = defaultAboutData;
    }

    const [sections, setSections] =
        React.useState<DetailsSectionType[]>(defaultData);

    return (
        <AboutSectionContext.Provider
            value={{
                sections,
                setSections,
            }}
        >
            {children}
        </AboutSectionContext.Provider>
    );
}
