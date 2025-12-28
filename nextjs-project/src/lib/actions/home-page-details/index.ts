"use server";

import { HomePageDetails } from "@/lib/schemas/mongoose/home-details";

export async function createHomePageDetails() {
  "use server";

 const response = await HomePageDetails.create({
    pageId: "home-page",
    pageTitle: "",
    pageDescription: "",
    sliders: [
      {
        type: "slides",
        id: "slide-1",
        title: "",
        imageUrl: "",
        linkTarget: "#",
        linkStatus: false,
      },
    ],
    banners: [
      {
        id: "right-top",
        type: "right-top",
        title: "",
        imageUrl: "",
        linkTarget: "",
        linkStatus: false,
      },
      {
        id: "right-bottom",
        type: "right-bottom",
        title: "",
        imageUrl: "",
        linkTarget: "",
        linkStatus: false,
      },
    ],
  });

  // Process the form data as needed
    return response;

}
