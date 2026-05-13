import { BannerSliderType } from "@/types/home";
import Image from "next/image";
import Link from "next/link";
import HeroSlickSlider from "./hero-slick-slider";
import { getHomePageDetails } from "@/lib/actions/home-page-details";
import { sliderContent } from "@/db/home/sliderContent";

export default async function HeroSection() {
    // Call the function to get data
    const { sliderData, bannerRightTop, bannerRightBottom } =
        await getHeroSectionData();

    return (
        <section
            // 2xl:pt-10 update 2xl:pt-6
            className="container mx-auto flex flex-col justify-center 2xl:pt-6 md:pt-8 pb-5 sm:pb-0"
        >
            {/* hero slider section 2xl:h-[515px] make it 600px */}
            <div className="grid grid-cols-2 lg:grid-cols-10 gap-3 lg:gap-6 p-3 md:p-0 2xl:h-[600px] lg:h-[450px]">
                {/* slider section */}
                <div className="lg:row-span-2 col-span-2 lg:col-span-7 border border-black/10 dark:border-white/80 shadow-sm lg:rounded-l-sm overflow-hidden">
                    <HeroSlickSlider sliderData={JSON.stringify(sliderData)} />
                </div>

                {/* right top section */}
                <div className="lg:col-span-3 relative flex overflow-hidden justify-center items-center border border-black/10 dark:border-white/10 shadow-sm lg:rounded-tr-sm">
                    {bannerRightTop.linkStatus ? (
                        <Link href={bannerRightTop.linkTarget}>
                            <figure>
                                <Image
                                    src={
                                        bannerRightTop.imageUrl ||
                                        "/assets/logo/no-image.jpg"
                                    }
                                    alt={bannerRightTop.title}
                                    className="object-cover object-center hover:scale-105 duration-200 lg:min-w-[345px] lg:min-h-[215px] 2xl:min-w-[410px] 2xl:min-h-[245px]"
                                    width={600}
                                    height={400}
                                    loading="eager"
                                    priority={true}
                                    // Add image optimization
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </figure>
                        </Link>
                    ) : (
                        <figure>
                            <Image
                                src={
                                    bannerRightTop.imageUrl ||
                                    "/assets/logo/no-image.jpg"
                                }
                                alt={bannerRightTop.title}
                                className="object-cover object-center hover:scale-105 duration-200 lg:min-w-[345px] lg:min-h-[215px] 2xl:min-w-[410px] 2xl:min-h-[245px]"
                                width={600}
                                height={400}
                                loading="eager"
                                priority={true}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </figure>
                    )}
                </div>

                {/* right bottom section */}
                <div className="lg:col-span-3 relative border border-black/10 dark:border-white/10 shadow-sm lg:rounded-br-sm overflow-hidden flex justify-center items-center">
                    {bannerRightBottom.linkStatus ? (
                        <Link href={bannerRightBottom.linkTarget}>
                            <figure>
                                <Image
                                    src={
                                        bannerRightBottom.imageUrl ||
                                        "/assets/logo/no-image.jpg"
                                    }
                                    alt={bannerRightBottom.title}
                                    className="object-cover object-center hover:scale-105 duration-200 lg:min-w-[345px] lg:min-h-[215px] 2xl:min-w-[410px] 2xl:min-h-[245px]"
                                    width={600}
                                    height={400}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </figure>
                        </Link>
                    ) : (
                        <figure>
                            <Image
                                src={
                                    bannerRightBottom.imageUrl ||
                                    "/assets/logo/no-image.jpg"
                                }
                                alt={bannerRightBottom.title}
                                className="object-cover object-center hover:scale-105 duration-200 lg:min-w-[345px] lg:min-h-[215px] 2xl:min-w-[410px] 2xl:min-h-[245px]"
                                width={600}
                                height={400}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </figure>
                    )}
                </div>
            </div>
        </section>
    );
}

// Function to fetch and process home page data
async function getHeroSectionData() {
    const response = await getHomePageDetails();

    let sliderData: BannerSliderType[] = sliderContent;

    let bannerRightTop: BannerSliderType = {
        id: "right-top",
        imageUrl: "/assets/logo/no-image.jpg",
        linkStatus: false,
        linkTarget: "#",
        title: "Mangrove Collection Right Top Banner",
        type: "right-top",
    };
    let bannerRightBottom: BannerSliderType = {
        id: "right-bottom", // Fixed: changed from "right-top" to "right-bottom"
        imageUrl: "/assets/logo/no-image.jpg",
        linkStatus: false,
        linkTarget: "#",
        title: "Mangrove Collection Right Bottom Banner", // Updated title
        type: "right-bottom",
    };

    if (response.success && response.data) {
        try {
            const data = JSON.parse(response.data) as {
                banners: BannerSliderType[];
                sliders: BannerSliderType[];
            };

            // Check if sliders array has items, otherwise use default
            sliderData = data.sliders.length > 0 ? data.sliders : sliderContent;

            const rightTopBanner = data.banners.find(
                (banner) => banner.type === "right-top",
            );
            const rightBottomBanner = data.banners.find(
                (banner) => banner.type === "right-bottom",
            );

            if (rightTopBanner) {
                bannerRightTop = { ...rightTopBanner };
            }
            if (rightBottomBanner) {
                bannerRightBottom = { ...rightBottomBanner };
            }
        } catch (error) {
            console.error("Error parsing home page data:", error);
            // Keep default values if parsing fails
        }
    }

    return {
        sliderData,
        bannerRightTop,
        bannerRightBottom,
    };
}
