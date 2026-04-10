import { BannerSliderType, DetailsSectionType } from "@/types/home";

export const sliderContent: BannerSliderType[] = [
    {
        imageUrl: "/assets/image/mangrove-collection.jpg",
        linkStatus: false,
        linkTarget: "#",
        title: "Mangrove collection",
        id: "slide-1",
        type: "slides",
    },
    {
        imageUrl: "",
        linkStatus: false,
        linkTarget: "#",
        title: "Mangrove collection",
        id: "slide-2",
        type: "slides",
    },
];

export const defaultAboutData: DetailsSectionType[] = [
    {
        id: "main_about",
        title: "আমাদের গল্প",
        description:
            "আমরা Mangrove collection বিভিন্ন ধরণের সমুদ্র জলের মাছ, কাঁকড়া, বিভিন্ন ধরণের চিংড়ি, সুন্দরবনের কাঁচা মধু সহ সুন্দরবন এলাকার অন্যান্য পণ্য সরাসরি সংগ্রহ ও সরবরাহ করি।",
    },
    {
        id: "our_mission",
        title: "আমাদের মূল উদ্দেশ্য",
        description:
            "প্রাকৃতিক সম্পদের ভরপুর সুন্দরবনের আসল স্বাদ আপনার কাছে পৌঁছে দেয়া এবং ভেজালমুক্ত খাবারের নিশ্চয়তা প্রদান করা।",
    },
    {
        id: "quality_assurance",
        title: "গুণমান নিশ্চিতকরণ",
        description:
            "অর্ডার গ্রহণ করার পরেই আমরা তাজা মাছ সংগ্রহ করি। নিজস্ব তত্ত্বাবধানে সকল স্বাস্থ্যবিধি মেনে পণ্য সরবরাহ করাই আমাদের আত্মবিশ্বাস।",
    },
];
