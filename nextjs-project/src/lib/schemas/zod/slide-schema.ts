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

/* Types */
export type SlideFormData = z.infer<typeof slideSchema>;
export type SliderFormData = z.infer<typeof sliderFormSchema>;


export type SliderFormType = UseFormReturn<
     SliderFormData
>;