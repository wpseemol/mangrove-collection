import { Metadata } from "next";
import CategorySection from "./_components/home/category-section";
import Contact from "./_components/home/contact";
import FeatureSection from "./_components/home/feature-section";
import HeroSection from "./_components/home/hero-section";
import NewArrivalProduct from "./_components/home/new-arrival-product";
import OtherDetails from "./_components/home/other-details";
import PopularProductSection from "./_components/home/popular-product-section";

/**
 * Meta information for the home page.
 */

const profileImage = `${process.env.NEXT_PUBLIC_BASE_URL}assets/logo/mangrove-collection.png`;

export const metadata: Metadata = {
     title: "Mangrove Collection | Natural Fish & Pure Honey",
     description:
          "Premium natural fish & 100% pure honey. Fresh, organic, sustainably sourced. Free delivery on orders over.",
     keywords: [
          "natural fish",
          "pure honey",
          "organic products",
          "sustainable seafood",
          "raw honey",
     ],

     openGraph: {
          title: "Mangrove Collection | Natural Fish & Pure Honey",
          description:
               "Premium natural fish & 100% pure honey. Fresh, organic, sustainably sourced. Free delivery on orders over .",
          url: process.env.NEXT_PUBLIC_BASE_URL,
          siteName: "Mangrove Collection",
          images: [
               {
                    url: profileImage,
                    width: 1200,
                    height: 630,
                    alt: "Mangrove Collection Organic Products",
               },
               {
                    url: profileImage,
                    width: 1000,
                    height: 1000,
                    alt: "Mangrove Collection Organic Products",
               },
          ],
          locale: "en_US",
          type: "website",
     },

     twitter: {
          card: "summary_large_image",
          title: "Mangrove Collection | Natural Fish & Pure Honey",
          description:
               "Fresh, organic, and sustainably sourced products delivered to your doorstep.",
          images: [profileImage],
          site: "@MangroveCollect",
          creator: "@MangroveCollect",
     },

     other: {
          "instagram:card": "summary_large_image",
          "instagram:title": "Mangrove Collection | Natural Fish & Pure Honey",
          "instagram:description":
               "Discover our fresh, organic seafood and honey products",
          "instagram:image": profileImage,

          "linkedin:card": "summary_large_image",
          "linkedin:title": "Mangrove Collection | Premium Organic Products",
          "linkedin:description":
               "Sustainable seafood and natural honey products",
          "linkedin:image": profileImage,
     },
};

export default function HomePage() {
     return (
          <main
               key="home-page" // Ensures page transition happens when the page changes
          >
               <HeroSection />
               <FeatureSection />
               <CategorySection />
               <PopularProductSection />
               <NewArrivalProduct />
               <Contact />
               <OtherDetails />
          </main>
     );
}
