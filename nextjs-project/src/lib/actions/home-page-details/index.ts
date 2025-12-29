"use server";

import { SlidesType } from "@/app/(admin)/dashboard/pages/home/_components/hero-banner-provider";
import { auth } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { HomePageDetails } from "@/lib/schemas/mongoose/home-details";
import { userRoleCheck } from "../user";
import { bannersSchema, sliderFormSchema } from "@/lib/schemas/zod/slide-schema";
import { formatZodError, getFirstErrorMessage } from "@/utils/zod-error";

/**
 * Create home page details in the database.
 *
 * @returns
 */
export async function createHomePageDetails() {
        try {
                const session = await auth();
                /**
                 * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
                 */
                if (!session || !session.user) {
                        return {
                                success: false,
                                message: "You are not login user.",
                        };
                }

                const isAdmin = await userRoleCheck(
                        session?.user.id,
                        session?.user.role,
                        "admin"
                );

                const isCreator = await userRoleCheck(
                        session?.user.id,
                        session?.user.role,
                        "creator"
                );

                if (!isAdmin && !isCreator) {
                        return {
                                success: false,
                                message: "Admin and Creator use only can add Home Page details.",
                        };
                }
                /**
                 * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
                 */

                /**
                 * product input validates.
                 */

                await connectMongoDB();
                const response = (await HomePageDetails.create({
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
                })) as unknown;

                return {
                        success: true,
                        data: { response },
                        message: "Home page details created successfully.",
                };
        } catch (error) {
                return {
                        success: false,
                        data: null,
                        error,
                        message: "Error creating home page details.",
                };
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

                const homePageDetails = (await HomePageDetails.findOne(
                        { pageId: "home-page" },
                        {
                                _id: 0,
                                banners: 1,
                                sliders: 1,
                        }
                ).lean()) ;

                if(!homePageDetails){
                        return {
                            success: false,
                        data: "",
                        message: "Home page details fetched successfully. data not found.",    
                        }
                }


                return {
                        success: true,
                        data: JSON.stringify(homePageDetails),
                        message: "Home page details fetched successfully.",
                };
        } catch (error) {
                return {
                        success: false,
                        data: "",
                        error,
                        message: "Error fetching home page details.",
                };
        }
}

/**
 * Update home page details in the database.
 *
 * @param {HomePageDetailsType} sliderDataString - The updated home page details.
 * @returns {Promise<{ success: boolean; data: HomePageDetailsType | null; message: string; error?: any }>} The result of the update operation.
 *
 */

export async function updateHeroSliders(sliderDataString: string) {
        try {
                const session = await auth();
                /**
                 * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
                 */
                if (!session || !session.user) {
                        return {
                                success: false,
                                message: "You are not login user.",
                        };
                }

                const isAdmin = await userRoleCheck(
                        session?.user.id,
                        session?.user.role,
                        "admin"
                );

                const isCreator = await userRoleCheck(
                        session?.user.id,
                        session?.user.role,
                        "creator"
                );

                if (!isAdmin && !isCreator) {
                        return {
                                success: false,
                                message: "Admin and Creator use only can add update data.",
                        };
                }
                /**
                 * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
                 */

                const inputData = JSON.parse(sliderDataString) as {
                        slides: SlidesType[];
                };

                const slideData = sliderFormSchema.safeParse(inputData);
                if (!slideData.success) {
                        return {
                                success: false,
                                message: getFirstErrorMessage(slideData.error),
                                errors: formatZodError(slideData.error),
                                fieldErrors: slideData.error.flatten(),
                        };
                }

                const response = await HomePageDetails.updateOne(
                        { pageId: "home-page" },
                        {sliders: slideData.data.slides}
                );

                return {
                        success: true,
                        data: response as unknown,
                        message: "Home page sliders updated successfully.",
                };

                // await connectMongoDB();
        } catch (error) {
                return {
                        success: false,
                        data: "",
                        error,
                        message: "Error connecting to the database.",
                };
        }
}



/**
 * 
 * @param bannersDataString banner data pass
 * @returns 
 */

export async function updateHeroBannerImages(bannersDataString: string){
        try {
                const session = await auth();
                /**
                 * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
                 */
                if (!session || !session.user) {
                        return {
                                success: false,
                                message: "You are not login user.",
                        };
                }

                const isAdmin = await userRoleCheck(
                        session?.user.id,
                        session?.user.role,
                        "admin"
                );

                const isCreator = await userRoleCheck(
                        session?.user.id,
                        session?.user.role,
                        "creator"
                );

                if (!isAdmin && !isCreator) {
                        return {
                                success: false,
                                message: "Admin and Creator use only can add update data.",
                        };
                }
                /**
                 * Validates user and input, then adds a new product if authorized; returns operation result and errors if any.
                 */

                const inputData = JSON.parse(bannersDataString) as {
                        slides: SlidesType[];
                };

                const bannerData = bannersSchema.safeParse(inputData);
                if (!bannerData.success) {
                        return {
                                success: false,
                                message: getFirstErrorMessage(bannerData.error),
                                errors: formatZodError(bannerData.error),
                                fieldErrors: bannerData.error.flatten(),
                        };
                }

                const response = await HomePageDetails.updateOne(
                        { pageId: "home-page" },
                        {banners: bannerData.data.banners}
                );

                return {
                        success: true,
                        data: response as unknown,
                        message: "Home page sliders updated successfully.",
                };

                // await connectMongoDB();
        } catch (error) {
                return {
                        success: false,
                        data: "",
                        error,
                        message: "Error connecting to the database.",
                };
        }
}