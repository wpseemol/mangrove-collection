import HomePageEditor from "./_components";
import { HeroBannerProvider } from "./_components/hero-banner-provider";

export default function AdminHomeDesignPage() {
     return (
          <HeroBannerProvider>
               <HomePageEditor />
          </HeroBannerProvider>
     );
}
