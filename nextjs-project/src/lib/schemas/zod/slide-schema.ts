import { UseFormReturn } from "react-hook-form";
import { z } from "zod";


const noHtmlMessage = "HTML or script tags are not allowed";
const noHtml = (val: string) => !/<[^>]*>/g.test(val);


export const slideSchema = z.object({
  id: z.string().refine(noHtml, { message: noHtmlMessage }),

  title: z
    .string()
    .min(1, "Title is required")
    .max(60, "Title must be 60 characters or less")
    .refine(noHtml, { message: noHtmlMessage }),

  imageUrl: z
    .string()
    .url("Image URL must be a valid URL")
    .refine(noHtml, { message: noHtmlMessage }),

  linkTarget: z
  .string()
  .trim().min(1, "Link is required")
  .transform((val) => {
    // keep hash
    if (val === "#") return "#";

    // keep absolute URLs
    if (val.startsWith("https://")) return val;

    // already starts with /
    if (val.startsWith("/")) return val;

    // auto add /
    return `/${val}`;
  })
  .refine(noHtml, { message: noHtmlMessage }),

  linkStatus: z.boolean(),
});

/* Slider (Array) Schema */
export const sliderFormSchema = z.object({
  slides: z.array(slideSchema).min(1, "At least one slide is required"),
});



export const bannerSchema = z.object({
  id: z.string().refine(noHtml, { message: noHtmlMessage }),

  type: z.enum(["right-top", "right-bottom", "slides"]),

  title: z
    .string()
    .max(60, "Title must be 60 characters or less")
    .refine(noHtml, { message: noHtmlMessage }),

  imageUrl: z
    .string()
    .url("Image URL must be a valid URL")
    .refine(noHtml, { message: noHtmlMessage }),

  linkTarget: z
  .string()
  .trim().min(1, "Link is required")
  .transform((val) => {
    // keep hash
    if (val === "#") return "#";

    // keep absolute URLs
    if (val.startsWith("https://")) return val;

    // already starts with /
    if (val.startsWith("/")) return val;

    // auto add /
    return `/${val}`;
  })
  .refine(noHtml, { message: noHtmlMessage }),
  

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
