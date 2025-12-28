"use server";

import { connectMongoDB } from "@/db/connections";
import { HomePageDetails } from "@/lib/schemas/mongoose/home-details";

/**
 * Create home page details in the database.
 * 
 * @returns 
 */
export async function createHomePageDetails() {

    try {
       await connectMongoDB();
       const response = await HomePageDetails.create({
         pageId: "home-page",
         sliders: [
           {
             id: "slide-1",
           },
         ],
         banners: [
           {
             id: "right-top",
             type: "right-top",
           },
           {
             id: "right-bottom",
             type: "right-bottom",
           },
         ],
       });

         return {success: true, data: response, message: "Home page details created successfully."};

    } catch (error) {
        return {success: false, data: null, error, message: "Error creating home page details."};
    }
  
}


/**
 * get home page details from the database.
 * 
 * @returns {Promise<HomePageDetailsType | null>} The home page details or null if not found.
 */


export async function getHomePageDetails() {
    try {
        
        // connect mongodb if not connected
        connectMongoDB();

        const homePageDetails = await HomePageDetails.findOne({ pageId: "home-page" }).lean();
        return {success: true, data: homePageDetails, message: "Home page details fetched successfully."};
    } catch (error) {
        return {success: false, data: null, error, message: "Error fetching home page details."};
    }
}