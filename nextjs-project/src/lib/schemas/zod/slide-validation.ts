import { z } from "zod";

export const slideFormSchema = z.object({
     title: z
          .string()
          .min(1, "Title is required")
          .max(50, "Title must be 50 characters or less"),
     position: z
          .number()
          .int("Position must be an integer")
          .positive("Position must be a positive number"),
     imageUrl: z
          .union([
               z.string().url("Please enter a valid URL"),
               z.string().length(0),
          ])
          .optional()
          .transform((val) => val || ""),
     linkTarget: z
          .string()
          .regex(
               /^[a-zA-Z0-9\-_\/]*$/,
               "Link target can only contain letters, numbers, hyphens, underscores, and forward slashes"
          )
          .optional(),
});

export type SlideFormData = z.infer<typeof slideFormSchema>;

// Helper function to validate a slide
export const validateSlide = (data: unknown) => {
     return slideFormSchema.safeParse(data);
};

// Default values for form
export const defaultSlideValues: SlideFormData = {
     title: "",
     position: 1,
     imageUrl: "",
     linkTarget: "",
};
