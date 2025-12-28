import { createHomePageDetails, getHomePageDetails } from "@/lib/actions/home-page-details";
import HomePageEditor from "./_components";
import { HeroBannerProvider } from "./_components/hero-banner-provider";

export default function AdminHomeDesignPage() {
     createIfNotExists()
     return (
          <HeroBannerProvider>
               <HomePageEditor />
          </HeroBannerProvider>
     );
}



     /**
      * Create home page details if not exists database.
      */
     async function createIfNotExists()  {
          const response = await getHomePageDetails();
          if (!response.success || !response.data) {
              const isCreate = await createHomePageDetails();
              console.log("Home page details created:", isCreate);
          }
     }

       
