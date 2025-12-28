import {
  createHomePageDetails,
  getHomePageDetails,
} from "@/lib/actions/home-page-details";
import HomePageEditor from "./_components";
import {
  HeroBannerProvider,
  SlidesType,
} from "./_components/hero-banner-provider";

export default async function AdminHomeDesignPage() {
  const response = await getHomePageDetails();
  
  // Initialize banner data
  let bannerSlideData: string = "[]";
  
  if (response.success && response.data) {
    const data = JSON.parse(response.data) as {
      sliders: SlidesType[];
      banners: SlidesType[];
    };
    
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
      <HomePageEditor />
    </HeroBannerProvider>
  );
}