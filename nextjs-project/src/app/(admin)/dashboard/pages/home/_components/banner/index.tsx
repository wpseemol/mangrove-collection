"use client";

import { useHeroBanner } from "@/hooks";
import { BannersFormData, bannersSchema } from "@/lib/schemas/zod/slide-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import BannerTitle from "./banner-title";
import BannerImage from "./banner-image";
import BannerLinkSection from "./banner-link-section";
import BannerStatus from "./banner-status";
import BannerHeader from "./banner-header";

export default function BannerImages() {
  const [loading, setLoading] = React.useState(false);
  const { slides } = useHeroBanner();

  const form = useForm<BannersFormData>({
    resolver: zodResolver(bannersSchema),
    defaultValues: {
      banners: slides.filter(
        (slide) => slide.type === "right-top" || slide.type === "right-bottom"
      ),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "banners",
  });

  const onSubmit = (data: BannersFormData) => {
    console.log("submit data:", data);
  };


  console.log(slides);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-4"
        >
          

          <BannerHeader form={form} index={index} loading={loading} setLoading={setLoading} />
          
            {/* Banner Title Component */}
            <BannerTitle index={index} form={form} loading={loading} />

            {/* Banner Image Component */}
            <BannerImage index={index} form={form} setLoading={setLoading} />

            {/* Banner Link Section Component */}
            <BannerLinkSection index={index} form={form} />

            <BannerStatus form={form} loading={loading} />
          </div>
        
      ))}
    </form>
  );
}
