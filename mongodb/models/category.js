import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        require: true,
    },
    categorySlug: {
        type: String,
        require: true,
        unique: true,
    },
    categoryImage: {
        type: String,
        require: true,
    },
    createBy: {
        type: mongoose.Schema.ObjectId,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Category =
    mongoose.models.Category ?? mongoose.model('Category', categorySchema);

export { Category };
