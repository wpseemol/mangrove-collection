import { BannerSliderType } from "@/types/home";
import Image from "next/image";
import Link from "next/link";
import HeroSlickSlider from "./hero-slick-slider";
import { getHomePageDetails } from "@/lib/actions/home-page-details";
import { sliderContent } from "@/db/home/sliderContent";

export default async function HeroSection() {
     const response = await getHomePageDetails();

     let sliderData: BannerSliderType[] = [];

     let bannerRightTop: BannerSliderType = {
          id: "right-top",
          imageUrl: "/assets/logo/no-image.jpg",
          linkStatus: false,
          linkTarget: "#",
          title: "Mangrove Collection Right Top Banner",
          type: "right-top",
     };
     let bannerRightBottom: BannerSliderType = {
          id: "right-top",
          imageUrl: "/assets/logo/no-image.jpg",
          linkStatus: false,
          linkTarget: "#",
          title: "Mangrove Collection Right Top Banner",
          type: "right-bottom",
     };

     if (response.success && response.data) {
          const data = JSON.parse(response.data) as {
               banners: BannerSliderType[];
               sliders: BannerSliderType[];
          };
          sliderData = data.sliders.length >= 0 ? data.sliders : sliderContent;

          const rightTopBanner = data.banners.find(
               (banner) => banner.type === "right-top"
          );
          const rightBottomBanner = data.banners.find(
               (banner) => banner.type === "right-bottom"
          );

          if (rightTopBanner) {
               bannerRightTop = { ...rightTopBanner };
          }
          if (rightBottomBanner) {
               bannerRightBottom = { ...rightBottomBanner };
          }
     }

     return (
          <section className=" container mx-auto flex flex-col justify-center 2xl:pt-10 md:pt-8 pb-5 sm:pb-0 ">
               {/* hero slider section */}
               <div className="grid grid-cols-2 lg:grid-cols-10 gap-3 lg:gap-6 p-3 md:p-0 2xl:h-[515px] lg:h-[450px] ">
                    {/* 2xl:h-[515px] lg:h-[450px] */}
                    {/* slider section */}
                    <div className="lg:row-span-2 col-span-2 lg:col-span-7 border border-black/10 dark:border-white/80 shadow-sm lg:rounded-l-sm overflow-hidden ">
                         <HeroSlickSlider
                              sliderData={JSON.stringify(sliderData)}
                         />
                    </div>
                    {/* right top section */}
                    <div className="lg:col-span-3 relative flex overflow-hidden justify-center items-center border border-black/10 dark:border-white/10 shadow-sm lg:rounded-tr-sm">
                         {bannerRightTop.linkStatus ? (
                              <Link href={bannerRightTop.linkTarget}>
                                   <figure className="">
                                        <Image
                                             src={bannerRightTop.imageUrl}
                                             alt={bannerRightTop.title}
                                             className="object-cover object-center hover:scale-105 duration-200 lg:w-min-[345px] lg:h-min-[215px] 2xl:w-min-[410px] 2xl:h-min-[245px]"
                                             width={655}
                                             height={452}
                                             loading="eager"
                                             priority={true}
                                        />
                                   </figure>
                              </Link>
                         ) : (
                              <figure className="">
                                   <Image
                                        src={bannerRightTop.imageUrl}
                                        alt={bannerRightTop.title}
                                        className="object-cover object-center hover:scale-105 duration-200 lg:w-min-[345px] lg:h-min-[215px] 2xl:w-min-[410px] 2xl:h-min-[245px]"
                                        width={655}
                                        height={452}
                                        loading="eager" // Add this for above-the-fold images
                                        priority={true}
                                   />
                              </figure>
                         )}
                    </div>
                    {/*right button section */}
                    <div className="lg:col-span-3 relative  border border-black/10 dark:border-white/10 shadow-sm lg:rounded-br-sm overflow-hidden flex justify-center items-center">
                         {bannerRightBottom.linkStatus ? (
                              <Link href={bannerRightBottom.linkTarget}>
                                   <figure className="">
                                        <Image
                                             src={bannerRightBottom.imageUrl}
                                             alt={bannerRightBottom.title}
                                             className="object-cover object-center hover:scale-105 duration-200 lg:w-min-[345px] lg:h-min-[215px] 2xl:w-min-[410px] 2xl:h-min-[245px]"
                                             width={655}
                                             height={452}
                                        />
                                   </figure>
                              </Link>
                         ) : (
                              <figure className="">
                                   <Image
                                        src={bannerRightBottom.imageUrl}
                                        alt={bannerRightBottom.title}
                                        className="object-cover object-center hover:scale-105 duration-200 lg:w-min-[345px] lg:h-min-[215px] 2xl:w-min-[410px] 2xl:h-min-[245px]"
                                        width={655}
                                        height={452}
                                   />
                              </figure>
                         )}
                    </div>
               </div>
               {/* hero slider section */}
          </section>
     );
}
