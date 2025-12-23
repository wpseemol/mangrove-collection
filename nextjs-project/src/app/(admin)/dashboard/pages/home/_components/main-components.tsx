"use client";

import { useState } from "react";

export default function MainComponents() {
  const [activeView, setActiveView] = useState<"desktop" | "mobile">("desktop");
  const [slides, setSlides] = useState([
    {
      id: 1,
      title: "Slide 1",
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
      linkTarget: "collections/summer-sale",
    },
    {
      id: 2,
      title: "Slide 2",
      status: "draft",
      imageUrl: "",
      linkTarget: "",
    },
  ]);
  const [fixedImages, setFixedImages] = useState([
    {
      id: 1,
      title: "Top Image",
      position: "top",
      imageUrl: "https://images.unsplash.com/photo-1544982503-9f984c14501a",
      linkTarget: "products/organic-catch",
    },
    {
      id: 2,
      title: "Bottom Image",
      position: "bottom",
      imageUrl: "https://images.unsplash.com/photo-1579895697621-e37456d22b6f",
      linkTarget: "collections/fresh-seafood",
    },
  ]);

  const addNewSlide = () => {
    const newSlide = {
      id: slides.length + 1,
      title: `Slide ${slides.length + 1}`,
      status: "draft" as const,
      imageUrl: "",
      linkTarget: "",
    };
    setSlides([...slides, newSlide]);
  };

  const updateSlide = (id: number, field: string, value: string) => {
    setSlides(
      slides.map((slide) =>
        slide.id === id ? { ...slide, [field]: value } : slide
      )
    );
  };

  const deleteSlide = (id: number) => {
    setSlides(slides.filter((slide) => slide.id !== id));
  };

  const duplicateSlide = (id: number) => {
    const slideToDuplicate = slides.find((slide) => slide.id === id);
    if (slideToDuplicate) {
      const duplicatedSlide = {
        ...slideToDuplicate,
        id: Math.max(...slides.map((s) => s.id)) + 1,
        title: `${slideToDuplicate.title} (Copy)`,
        status: "draft" as const,
      };
      setSlides([...slides, duplicatedSlide]);
    }
  };

  const updateFixedImage = (id: number, field: string, value: string) => {
    setFixedImages(
      fixedImages.map((image) =>
        image.id === id ? { ...image, [field]: value } : image
      )
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 `}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Home Page Editor
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-2">
            Manage your homepage content including slides and banners
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Controls */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8 order-2 lg:order-1">
            {/* Main Slider Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Main Slider
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                    Manage rotating slides
                  </p>
                </div>
                <button
                  onClick={addNewSlide}
                  className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    add
                  </span>
                  Add Slide
                </button>
              </div>

              {/* Slides List */}
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group transition-opacity ${
                    slide.status === "draft" ? "opacity-70 hover:opacity-100" : ""
                  }`}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300">
                        drag_indicator
                      </span>
                      <h3 className="text-slate-900 dark:text-white font-bold text-base">
                        {slide.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          slide.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {slide.status === "active" ? "Active" : "Draft"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicateSlide(slide.id)}
                        className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Duplicate"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          content_copy
                        </span>
                      </button>
                      <button
                        onClick={() => deleteSlide(slide.id)}
                        className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-5">
                    {/* Image Preview */}
                    <div className="w-full">
                      <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold mb-2 block">
                        Preview Image
                      </label>
                      {slide.imageUrl ? (
                        <div className="aspect-[21/9] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative group/image border border-gray-200 dark:border-gray-700">
                          <div
                            className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover/image:scale-105"
                            style={{ backgroundImage: `url(${slide.imageUrl})` }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <span className="text-white text-xs font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                edit
                              </span>
                              Change
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[21/9] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-500 transition-colors cursor-pointer group/upload">
                          <span className="material-symbols-outlined text-[32px] mb-1 group-hover/upload:scale-110 transition-transform">
                            add_photo_alternate
                          </span>
                          <span className="text-xs font-medium">
                            Select Image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Image URL Input */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold flex justify-between">
                          Image URL
                          <span className="text-[10px] font-normal text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                            Upload
                          </span>
                        </label>
                        <div className="flex w-full items-stretch rounded-lg shadow-sm focus-within:ring-2 ring-blue-500/20 transition-shadow">
                          <input
                            className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white text-sm rounded-l-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-0"
                            placeholder="https://"
                            type="text"
                            value={slide.imageUrl}
                            onChange={(e) =>
                              updateSlide(slide.id, "imageUrl", e.target.value)
                            }
                          />
                          <button className="inline-flex items-center px-3 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">
                              open_in_new
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Link Target Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold">
                          Link Target
                        </label>
                        <div className="flex w-full items-stretch rounded-lg shadow-sm">
                          <span className="inline-flex items-center px-3 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-lg text-xs select-none">
                            /
                          </span>
                          <input
                            className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white text-sm rounded-r-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-0"
                            placeholder="collections/all"
                            type="text"
                            value={slide.linkTarget}
                            onChange={(e) =>
                              updateSlide(slide.id, "linkTarget", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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

              {fixedImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400">
                        {image.position === "top"
                          ? "vertical_align_top"
                          : "vertical_align_bottom"}
                      </span>
                      <h3 className="text-slate-900 dark:text-white font-bold text-base">
                        {image.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Settings"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          settings
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-5">
                    {/* Image Preview */}
                    <div className="w-full">
                      <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold mb-2 block">
                        Preview Image
                      </label>
                      <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative group/image border border-gray-200 dark:border-gray-700">
                        <div
                          className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover/image:scale-105"
                          style={{ backgroundImage: `url(${image.imageUrl})` }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <span className="text-white text-xs font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              edit
                            </span>
                            Change
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold flex justify-between">
                          Image URL
                        </label>
                        <div className="flex w-full items-stretch rounded-lg shadow-sm">
                          <input
                            className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white text-sm rounded-l-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-0"
                            placeholder="https://"
                            type="text"
                            value={image.imageUrl}
                            onChange={(e) =>
                              updateFixedImage(image.id, "imageUrl", e.target.value)
                            }
                          />
                          <button className="inline-flex items-center px-3 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">
                              image
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold">
                          Link Target
                        </label>
                        <div className="flex w-full items-stretch rounded-lg shadow-sm">
                          <span className="inline-flex items-center px-3 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-lg text-xs select-none">
                            /
                          </span>
                          <input
                            className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white text-sm rounded-r-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-0"
                            placeholder="path/to/page"
                            type="text"
                            value={image.linkTarget}
                            onChange={(e) =>
                              updateFixedImage(image.id, "linkTarget", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Live Preview */}
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
              <div className="flex-1 bg-gray-100 dark:bg-[#0d131a] relative overflow-hidden flex flex-col">
                <div className="w-full h-full overflow-y-auto custom-scrollbar">
                  {/* Mock Navigation */}
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
                      {/* Main Slider Preview */}
                      <div className="col-span-8 relative rounded-lg overflow-hidden group h-full">
                        {slides[0]?.imageUrl ? (
                          <div
                            className="absolute inset-0 bg-center bg-cover transition-transform duration-700 ease-out"
                            style={{
                              backgroundImage: `url(${slides[0].imageUrl})`,
                            }}
                          >
                            <div className="absolute inset-0 bg-black/20" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-12">
                          <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-4">
                            New Arrivals
                          </span>
                          <h1 className="text-3xl font-bold mb-4 tracking-tight drop-shadow-lg">
                            Discover Collection
                          </h1>
                          <button className="bg-white text-slate-900 hover:bg-gray-100 px-6 py-3 rounded-full font-bold text-sm transition-colors shadow-xl shadow-black/20">
                            Explore Now
                          </button>
                        </div>
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                          {slides.map((slide, index) => (
                            <button
                              key={slide.id}
                              className={`w-8 h-1 rounded-full transition-all ${
                                index === 0
                                  ? "bg-white"
                                  : "bg-white/30 hover:bg-white/60"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Side Banners Preview */}
                      <div className="col-span-4 flex flex-col gap-4 h-full">
                        {fixedImages.map((image) => (
                          <div
                            key={image.id}
                            className="flex-1 rounded-lg overflow-hidden relative group cursor-pointer"
                          >
                            <div
                              className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                              style={{ backgroundImage: `url(${image.imageUrl})` }}
                            >
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <span className="inline-block bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
                                {image.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={addNewSlide}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
        </div>
      </div>
    </div>
  );
}





export type SlideStatus = "active" | "draft";

export interface Slide {
  id: number;
  title: string;
  status: SlideStatus;
  imageUrl: string;
  linkTarget: string;
}

export interface FixedImage {
  id: number;
  title: string;
  position: "top" | "bottom";
  imageUrl: string;
  linkTarget: string;
}