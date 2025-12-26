"use client";

import { useHeroBanner } from "@/hooks";
import { useState, useRef, useEffect } from "react";


export default function LivePreview() {
  const { slides } = useHeroBanner();
  const [activeView, setActiveView] = useState<"desktop" | "mobile">("desktop");
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Filter out slides without images for preview
  const slidesWithImages = slides.filter(slide => slide.imageUrl && slide.imageUrl.trim() !== "");

  // Default white/placeholder images
  const defaultImages = {
    mainBanner: "https://picsum.photos/800/400",
    topRight: "https://picsum.photos/400/300",
    bottomRight: "https://picsum.photos/400/300",
  };

  // Auto-slide functionality
  useEffect(() => {
    if (slidesWithImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slidesWithImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slidesWithImages.length]);

  // Handle next/previous slide
  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const goToNextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % slidesWithImages.length);
  };

  const goToPrevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + slidesWithImages.length) % slidesWithImages.length);
  };

  return (
    <div className="lg:col-span-7 xl:col-span-8 sticky top-24 order-1 lg:order-2 hidden lg:block">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
        {/* Preview Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="flex h-3 w-3 rounded-full bg-red-400" />
              <span className="flex h-3 w-3 rounded-full bg-yellow-400" />
              <span className="flex h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-2" />
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                visibility
              </span>
              Live Preview
            </h3>
            {slidesWithImages.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                {slidesWithImages.length} slide{slidesWithImages.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveView("desktop")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                activeView === "desktop"
                  ? "bg-white dark:bg-gray-600 text-slate-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                desktop_windows
              </span>
              Desktop
            </button>
            <button
              onClick={() => setActiveView("mobile")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                activeView === "mobile"
                  ? "bg-white dark:bg-gray-600 text-slate-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                smartphone
              </span>
              Mobile
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0d131a] dark:to-[#0a0f14] relative overflow-hidden flex flex-col">
          <div className="w-full h-full overflow-y-auto custom-scrollbar">
            {/* Mock Navigation Bar */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 h-16 w-full flex items-center justify-between px-8 relative z-20">
              <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex gap-6">
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Main Content */}
            <div className="p-6">
              <div className="grid grid-cols-12 gap-4 h-[500px]">
                {/* Left Main Banner - Custom Carousel */}
                <div className="col-span-8 relative rounded-lg overflow-hidden h-full group" ref={carouselRef}>
                  {slidesWithImages.length > 0 ? (
                    <div className="relative h-full overflow-hidden">
                      {/* Slides Container */}
                      <div className="relative h-full">
                        {slidesWithImages.map((slide, index) => (
                          <div
                            key={slide.id}
                            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                              index === activeIndex
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-full'
                            }`}
                          >
                            <div
                              className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                              style={{
                                backgroundImage: `url('${slide.imageUrl}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                            </div>
                            
                            {/* Slide Content Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-12">
                              <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-4">
                                Slide {index + 1}
                              </span>
                              <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight drop-shadow-lg">
                                {slide.title || "Discover Collection"}
                              </h1>
                              <button className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-xl shadow-black/20 hover:scale-105">
                                {slide.linkStatus && slide.linkTarget !== "#" 
                                  ? "Shop Now" 
                                  : "Explore Now"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Navigation Arrows */}
                      {slidesWithImages.length > 1 && (
                        <>
                          <button
                            onClick={goToPrevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border-0 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Previous slide"
                          >
                            <span className="material-symbols-outlined text-gray-800 dark:text-white">
                              chevron_left
                            </span>
                          </button>
                          <button
                            onClick={goToNextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 border-0 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Next slide"
                          >
                            <span className="material-symbols-outlined text-gray-800 dark:text-white">
                              chevron_right
                            </span>
                          </button>
                        </>
                      )}

                      {/* Carousel Dots */}
                      {slidesWithImages.length > 1 && (
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                          {slidesWithImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToSlide(index)}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                index === activeIndex
                                  ? "w-8 bg-white"
                                  : "w-2 bg-white/30 hover:bg-white/60"
                              }`}
                              aria-label={`Go to slide ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-full">
                      <div
                        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                        style={{
                          backgroundImage: `url('${defaultImages.mainBanner}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                      </div>
                      
                      {/* Default Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-12">
                        <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-4">
                          No Slides Added
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight drop-shadow-lg">
                          Discover Collection
                        </h1>
                        <button className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-xl shadow-black/20 hover:scale-105">
                          Explore Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side Banners */}
                <div className="col-span-4 flex flex-col gap-4 h-full">
                  {/* Top Right Banner - Shows second slide or default */}
                  <div className="flex-1 rounded-lg overflow-hidden relative group cursor-pointer">
                    <div
                      className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url('${slidesWithImages.length > 1 ? slidesWithImages[1]?.imageUrl : defaultImages.topRight}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    </div>
                    
                    {/* Banner Content */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1.5 rounded-md shadow-sm truncate max-w-full">
                        {slidesWithImages.length > 1 
                          ? (slidesWithImages[1]?.title || "Top Banner")
                          : "Top Banner"
                        }
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium">
                        View Collection
                      </span>
                    </div>
                  </div>

                  {/* Bottom Right Banner - Shows third slide or default */}
                  <div className="flex-1 rounded-lg overflow-hidden relative group cursor-pointer">
                    <div
                      className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url('${slidesWithImages.length > 2 ? slidesWithImages[2]?.imageUrl : defaultImages.bottomRight}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    </div>
                    
                    {/* Banner Content */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1.5 rounded-md shadow-sm truncate max-w-full">
                        {slidesWithImages.length > 2 
                          ? (slidesWithImages[2]?.title || "Bottom Banner")
                          : "Bottom Banner"
                        }
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium">
                        View Collection
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder Products Section */}
            <div className="p-8 grid grid-cols-3 gap-8 max-w-5xl mx-auto opacity-50 pointer-events-none select-none">
              <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            </div>

            {/* Current Slide Info */}
            {slidesWithImages.length > 0 && (
              <div className="mx-6 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      Active Slide Preview
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Slide {activeIndex + 1}: {slidesWithImages[activeIndex]?.title || "Untitled"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-sm">
                        link
                      </span>
                      <span>
                        {slidesWithImages[activeIndex]?.linkStatus ? "Linked" : "No Link"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Device Mockup for Mobile View */}
            {activeView === "mobile" && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-6 bg-gray-800 dark:bg-gray-900 rounded-b-xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}