import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    category: {
        type: mongoose.Schema.ObjectId,
        require: true,
        ref: 'Category',
    },
    slug: {
        type: String,
        require: true,
        unique: true,
    },
    unit: {
        type: String,
        require: true,
    },
    size: {
        type: String,
        require: false,
    },
    price: {
        type: Array,
        require: true,
    },
    currency: {
        type: String,
        require: true,
    },
    offer: {
        type: Number,
        require: false,
    },
    shortDescription: {
        type: String,
        require: false,
    },
    thumbnail: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    images: {
        type: Array,
        require: false,
    },
    variants: {
        type: Array,
        require: false,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    rating: {
        type: Number,
        require: false,
    },
    ratingCollection: {
        type: mongoose.Schema.ObjectId,
        require: false,
    },
    comment: {
        type: mongoose.Schema.ObjectId,
        require: false,
    },
    popularity: {
        type: Number,
        require: false,
        default: 0,
    },
    tags: { type: Array, require: false },
});

const Product =
    mongoose.models.Product ?? mongoose.model('Product', productSchema);

export { Product };
