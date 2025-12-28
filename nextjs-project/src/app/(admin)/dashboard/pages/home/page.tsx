import {
  createHomePageDetails,
  getHomePageDetails,
} from "@/lib/actions/home-page-details";

import {
  HeroBannerProvider,
  SlidesType,
} from "./_components/hero-banner-provider";
import Header from "./_components/header";

import LivePreview from "./_components/live-preview";
import SlidesForm from "./_components/slide";
import BannerImages from "./_components/banner";
import { Toaster } from "sonner";

export default async function AdminHomeDesignPage() {
  const response = await getHomePageDetails();
  
  // Initialize banner data
  let bannerSlideData: string = "[]";

  let dbData: string= "";
  
  if (response.success && response.data) {
    const data = JSON.parse(response.data) as {
      sliders: SlidesType[];
      banners: SlidesType[];
    };

    dbData = JSON.stringify(data.sliders);
    
    // Combine sliders and banners into a single array
    const combinedSlides = [...(data.sliders || []), ...(data.banners || [])];
    bannerSlideData = JSON.stringify(combinedSlides);
  } else {
    // Create home page details if they don't exist
    await createHomePageDetails();
    // Default to empty array
    bannerSlideData = "[]";
  }

  return (
    <HeroBannerProvider bannerSlideData={bannerSlideData}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
               <div className="max-w-7xl mx-auto">
                    <Header
                         title="Home Page Editor"
                         subtitle="Manage your homepage content including slides and banners"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                         <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8 order-2 lg:order-1">
                               {/* Main Slider Section */}
                         
                               <SlidesForm data={dbData} />
                         
                               <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
                         
                               {/* Fixed Images Section */}
                               <div className="flex flex-col gap-6">
                                 <div>
                                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                     Fixed Images
                                   </h3>
                                   <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                                     Manage static side banners
                                   </p>
                                 </div>
                         
                                 {/* Fixed Images List right top */}
                                 <BannerImages />
                               </div>
                               <Toaster position="top-center" richColors closeButton />
                             </div>
                         <LivePreview />
                    </div>

                    
               </div>
          </div>
    </HeroBannerProvider>
  );
}