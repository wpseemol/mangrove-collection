"use client";

import BannerImages from "./banner";
import SlidesForm from "./slide";

export default function ControlsPanel() {
  return (
    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8 order-2 lg:order-1">
      {/* Main Slider Section */}

      <SlidesForm />

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

        {/* Fixed Images List right top */}
        <BannerImages />
      </div>
    </div>
  );
}
