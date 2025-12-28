import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const slideSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(50, "Title must be 50 characters or less"),
  imageUrl: z
    .string()
    .url("Image URL must be a valid URL")
    .min(1, "Image URL is required"),
  linkTarget: z.string().min(1, "Link Target is required"),
  linkStatus: z.boolean(),
});

/* Slider (Array) Schema */
export const sliderFormSchema = z.object({
  slides: z.array(slideSchema).min(1, "At least one slide is required"),
});

export const bannerSchema = z.object({
  id: z.string(),
  type: z.enum(["right-top", "right-bottom", "slides"]),
  title: z.string(),
  imageUrl: z.string(),
  linkTarget: z.string(),
  linkStatus: z.boolean(),
});

/* Slider (Array) Schema */
export const bannersSchema = z.object({
  banners: z.array(bannerSchema).min(1, "At least one banner is required"),
});

/* Types */
export type SlideFormData = z.infer<typeof slideSchema>;
export type SlidersFormData = z.infer<typeof sliderFormSchema>;

export type BannerFormData = z.infer<typeof bannerSchema>;
export type BannersFormData = z.infer<typeof bannersSchema>;

export type BannersFormType = UseFormReturn<BannersFormData>;
export type SliderFormType = UseFormReturn<SlidersFormData>;
