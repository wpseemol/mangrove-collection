import { INSIDE_DHAKA, OUTSIDE_DHAKA } from "@/lib/constant";
import { ProductType } from "@/types/mongoose/product";
import mongoose from "mongoose";

interface IProduct extends ProductType, mongoose.Document {}

const productSchema = new mongoose.Schema<IProduct>({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.ObjectId,
        require: true,
        ref: "Category",
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
        type: [
            {
                variantId: { type: String, required: true },
                price: { type: Number, required: true },
                select: { type: Boolean, required: true },
            },
        ],
        require: true,
    },
    shippingCost: {
        type: [
            {
                shippingId: { type: String, required: true },
                title: { type: String, required: true },
                price: { type: Number, required: true },
                shortDescription: { type: String, required: true },
            },
        ],
        required: true,
        default: [
            {
                shippingId: INSIDE_DHAKA,
                title: "Inside Dhaka",
                price: 160,
                shortDescription: "2-3 business days",
            },
            {
                shippingId: OUTSIDE_DHAKA,
                title: "Outside Dhaka",
                price: 160,
                shortDescription: "3-5 business days",
            },
        ],
    },
    currency: {
        type: String,
        required: true,
    },
    offer: {
        type: Number,
        required: false,
    },
    shortDescription: {
        type: String,
        required: false,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: [
        {
            id: { type: String, required: true },
            imgUrl: { type: String, required: true },
        },
    ],
    variants: [
        {
            id: { type: String, required: true },
            type: { type: String, required: true },
            title: { type: String, required: true },
        },
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    rating: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        // ref: 'Rating',
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        // ref: 'Comment',
    },
    popularity: {
        type: Number,
        required: false,
    },
    tags: {
        type: [String],
        required: false,
    },
});

const Product =
    mongoose.models.Product ||
    mongoose.model<IProduct>("Product", productSchema);

export { Product };
