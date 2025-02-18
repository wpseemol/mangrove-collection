import { CategorySchemaType } from '@/types/mongoose/category';
import mongoose, { Document, Schema } from 'mongoose';

// Extend the CategoryBase interface and include mongoose.Document for Mongoose functionality
interface ICategory extends CategorySchemaType, Document {}

// Define the Mongoose schema
const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    imgUrl: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
});

// Define and export the model, checking if it already exists
const Category =
    mongoose.models.Category ||
    mongoose.model<ICategory>('Category', categorySchema);

export { Category };
