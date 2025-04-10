import { Metadata } from "next";


/**
 * tase Open grap image path set
 * 
 */

export const metadata: Metadata = {
  title: "Mangrove Collection | Natural Fish & Pure Honey",
  description: "Premium natural fish & 100% pure honey. Fresh, organic, sustainably sourced. Free delivery on orders over.",
  keywords: ["natural fish", "pure honey", "organic products", "sustainable seafood", "raw honey"],
  
  openGraph: {
    title: "Mangrove Collection | Natural Fish & Pure Honey",
    description: "Premium natural fish & 100% pure honey. Fresh, organic, sustainably sourced. Free delivery on orders over .",
    url: "https://www.mangrovecollection.com",
    siteName: "Mangrove Collection",
    images: [
      {
        url: "https://www.mangrovecollection.com/og-social.jpg",
        width: 1200,
        height: 630,
        alt: "Mangrove Collection Organic Products",
      },
      {
        url: "https://www.mangrovecollection.com/og-square.jpg",
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
    description: "Fresh, organic, and sustainably sourced products delivered to your doorstep.",
    images: ["https://www.mangrovecollection.com/twitter-card.jpg"],
    site: "@MangroveCollect",
    creator: "@MangroveCollect",
  },

  other: {
    "instagram:card": "summary_large_image",
    "instagram:title": "Mangrove Collection | Natural Fish & Pure Honey",
    "instagram:description": "Discover our fresh, organic seafood and honey products",
    "instagram:image": "https://www.mangrovecollection.com/instagram-card.jpg",
    
    "linkedin:card": "summary_large_image",
    "linkedin:title": "Mangrove Collection | Premium Organic Products",
    "linkedin:description": "Sustainable seafood and natural honey products",
    "linkedin:image": "https://www.mangrovecollection.com/linkedin-card.jpg",
  }
};


export default function HomePage() {
  return (
    <>
      this is home page
    </>
  );
};