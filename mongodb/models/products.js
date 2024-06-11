import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        require: true,
    },
    category: {
        type: String,
        require: true,
    },
    slug: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
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
    user: {
        type: mongoose.Schema.ObjectId,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product =
    mongoose.models.Product ?? mongoose.model('Product', productSchema);
