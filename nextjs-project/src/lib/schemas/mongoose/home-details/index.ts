import { HomePageDetailsType } from '@/types/home';
import mongoose from 'mongoose';


interface IHomePageDetails extends HomePageDetailsType, mongoose.Document {}


const homePageDetailsSchema = new mongoose.Schema<IHomePageDetails>({
    pageId: {
        type: String,
        required: true,
        unique: true,
    },
    pageTitle: {
        type: String,
        required: true,
    },
    pageDescription: {
        type: String,
        required: true,
    },
    sliders: [{
        id: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            enum: ["right-top", "right-bottom", "slides"],
            required: true,
        },
        position: {
            type: Number,
            required: false,
        },
        imgUrl: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        linkTarget: {
            type: String,
            required: true,
        },
        linkStatus: {
            type: Boolean,
            required: true,

        }
    }],
    banners: [{
        id: {
            type: String,
            required: true,
            unique: true,
        },
        type:{
            type:String, 
            enum:["right-top", "right-bottom"],
            required:true
        },
        title:{
            type:String, 
            required:true
        },
        imageUrl:{
            type:String, 
            required:true
        },
        linkTarget:{
            type:String, 
            required:true
        },
        linkStatus:{
            type:Boolean, 
            required:true
        }
    }]}
)



export const HomePageDetails = mongoose.models.homePage || mongoose.model<IHomePageDetails>('homePage', homePageDetailsSchema);