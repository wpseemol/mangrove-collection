import mongoose from "mongoose";
import { HomePageDetailsType } from "@/types/home";

interface IHomePageDetails extends HomePageDetailsType, mongoose.Document {}

// Banner and Slider Schema
const bannerSliderSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["right-top", "right-bottom", "slides"],
        required: true,
        default: "slides",
    },
    title: {
        type: String,
        required: false,
        default: "",
    },
    imageUrl: {
        type: String,
        required: false,
        default: "",
    },
    linkTarget: {
        type: String,
        required: false,
        default: "#",
    },
    linkStatus: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const detailsSection = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: false,
        default: "",
    },
    description: {
        type: String,
        required: false,
        default: "",
    },
});

const homePageDetailsSchema = new mongoose.Schema<IHomePageDetails>(
    {
        pageId: {
            type: String,
            required: true,
            unique: true,
        },
        pageTitle: {
            type: String,
            default: "",
            required: false,
        },
        pageDescription: {
            type: String,
            default: "",
            required: false,
        },
        sliders: {
            type: [bannerSliderSchema],
            default: [],
            required: true,
        },
        banners: {
            type: [bannerSliderSchema],
            default: [],
            required: true,
        },
        detailsSections: {
            type: [detailsSection],
            default: [],
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export const HomePageDetails =
    mongoose.models.homePage ||
    mongoose.model<IHomePageDetails>("homePage", homePageDetailsSchema);
