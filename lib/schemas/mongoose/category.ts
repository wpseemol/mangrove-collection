import { CategoryBase } from '@/types/mongoose-models';
import mongoose from 'mongoose';

interface ICategory extends CategoryBase, mongoose.Document {}

const categorySchema = new mongoose.Schema<ICategory>({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
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

const Category =
    mongoose.models.Category ||
    mongoose.model<ICategory>('Category', categorySchema);

export { Category };
