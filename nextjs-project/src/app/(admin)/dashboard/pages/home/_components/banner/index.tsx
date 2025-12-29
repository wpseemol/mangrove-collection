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
import { useRouter } from "next/navigation";
import { updateHeroBannerImages } from "@/lib/actions/home-page-details";
import { toast } from "sonner";

export default function BannerImages({ data }: { data: string }) {
        const [loading, setLoading] = React.useState(false);
        const { slides } = useHeroBanner();

        const form = useForm<BannersFormData>({
                resolver: zodResolver(bannersSchema),
                defaultValues: {
                        banners: slides.filter(
                                (slide) =>
                                        slide.type === "right-top" ||
                                        slide.type === "right-bottom"
                        ),
                },
        });

        const { fields } = useFieldArray({
                control: form.control,
                name: "banners",
        });

        const router = useRouter();

        const onSubmit = async (data: BannersFormData) => {
                const response = await updateHeroBannerImages(
                        JSON.stringify(data)
                );
                if (!response.success) {
                        toast.error(response.message);
                        return;
                }

                if (response.success) {
                        toast.success(
                                response.message ||
                                        "Banner Image add Successful."
                        );
                        router.refresh();
                        return;
                }
        };

        return (
                <form onSubmit={form.handleSubmit(onSubmit)}>
                        {fields.map((field, index) => (
                                <div
                                        key={field.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-4"
                                >
                                        <BannerHeader
                                                form={form}
                                                index={index}
                                                loading={loading}
                                                setLoading={setLoading}
                                        />

                                        {/* Banner Title Component */}
                                        <BannerTitle
                                                index={index}
                                                form={form}
                                                loading={loading}
                                        />

                                        {/* Banner Image Component */}
                                        <BannerImage
                                                index={index}
                                                form={form}
                                                setLoading={setLoading}
                                        />

                                        {/* Banner Link Section Component */}
                                        <BannerLinkSection
                                                index={index}
                                                form={form}
                                        />

                                        <BannerStatus
                                                form={form}
                                                loading={loading}
                                                data={data}
                                        />
                                </div>
                        ))}
                </form>
        );
}
