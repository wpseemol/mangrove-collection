import DynamicBreadcrumb from "@/components/dynamic-breadcrumb";
import { getProductsDetails } from "@/lib/server/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "./_components/product-details";
import RelatedProduct from "./_components/related-product";
import VariantContentUpdateProvider from "./_components/varient-update-provider";

export async function generateMetadata({
     params,
}: {
     params: Promise<{ productSlug: string }>;
}): Promise<Metadata> {
     const productSlug = (await params).productSlug;

     const productDetails = await getProductsDetails(productSlug);

     if (!productDetails) {
          return {
               title: "Product not found - MyStore",
               description: "The product you're looking for does not exist.",
               robots: "noindex, nofollow",
          };
     }

     const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productSlug}`;
     const cleanDescription = stripHtml(productDetails.description).substring(
          0,
          160
     );

     return {
          title: `${productDetails.name} | Mangrove Collection`,
          description: cleanDescription,
          keywords: [
               productDetails.name,
               "mangrove",
               "mangrove-collection",
               "buy online",
               "ecommerce",
               "best price",
               "MyStore",
          ],
          authors: [
               { name: "MyStore Team", url: process.env.NEXT_PUBLIC_BASE_URL },
          ],
          openGraph: {
               title: productDetails.name,
               description: cleanDescription,
               images: {
                    url: productDetails.thumbnail,
                    width: 300,
                    height: 300,
                    alt: productDetails.name,
               },

               url: `${process.env
                    .NEXT_PUBLIC_BASE_URL!}/products/${productSlug}`,
               siteName: "Mangorve Collection",
               locale: "en_US",
          },

          twitter: {
               card: "summary_large_image",
               title: productDetails.name,
               description: cleanDescription,
               images: [productDetails.thumbnail],
               site: "@mangrove-collection", // replace with your actual Twitter handle
          },
          metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
          alternates: {
               canonical: fullUrl,
          },
     };
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
     return html.replace(/<\/?[^>]+(>|$)/g, "");
}

export default async function ProductDetailsPage({
     params,
}: {
     params: Promise<{ productSlug: string }>;
}) {
     const productSlug = (await params).productSlug;

     const productDetails = await getProductsDetails(productSlug);

     if (!productDetails) {
          notFound();
     }

     return (
          <main className="container mx-auto min-h-[calc(100vh-25rem)]">
               {/* breadcrumb Product page*/}
               <DynamicBreadcrumb />
               {/* breadcrumb Product page*/}

               <VariantContentUpdateProvider>
                    <ProductDetails details={productDetails} />
               </VariantContentUpdateProvider>
               <RelatedProduct
                    categoryId={productDetails.category._id}
                    skipId={productDetails.id}
               />
          </main>
     );
}
