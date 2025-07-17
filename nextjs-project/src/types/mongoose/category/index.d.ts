import mongoose from 'mongoose';

/**
 * Represents the schema for a category in the database.
 * This interface is used to define the structure of the category document.
 *
 * @interface CategorySchemaType
 * @property {string} name - The name of the category. Typically used to describe the category's title (e.g., "Technology", "Fashion").
 * @property {string} slug - A URL-friendly version of the category name, often used in URLs (e.g., "technology" or "fashion").
 * @property {string} imgUrl - The URL for an image representing the category (e.g., a logo or icon associated with the category).
 * @property {mongoose.Types.ObjectId} author - The reference to the user or entity who created or manages the category. This is an `ObjectId` that links to another collection (e.g., a `User` collection).
 * @property {Date} createdAt - The timestamp when the category was created. This is typically used to track the creation date for sorting or auditing purposes.
 */
export interface CategorySchemaType {
    name: string;
    slug: string;
    imgUrl: string;
    author: mongoose.Types.ObjectId; // Assuming author is an ObjectId from another collection
    createdAt: Date;
}
