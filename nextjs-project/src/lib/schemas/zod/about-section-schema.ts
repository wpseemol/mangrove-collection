import { z } from "zod";

// 1. Define the schema for a single section
export const sectionSchema = z.object({
    id: z.string().min(1, "ID is required"),
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().min(1, "Description is required"),
});

// 2. Define the schema for the array of sections
export const aboutSectionSchema = z.object({
    sections: z.array(sectionSchema).min(1, "At least one section is required"),
});

// To extract the TypeScript type from the schema
export type AboutSectionValues = z.infer<typeof aboutSectionSchema>;
