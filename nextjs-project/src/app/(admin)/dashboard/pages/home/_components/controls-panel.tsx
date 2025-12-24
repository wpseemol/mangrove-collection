"use client";

import {
     addSlide,
     deleteSlide,
     duplicateSlide,
     updateFixedImage,
     updateSlide,
} from "@/store/features/homeEditorSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import FixedImageItem from "./fixed-image-item";
import SlideItem from "./slide-item";

export default function ControlsPanel() {
     const dispatch = useAppDispatch();
     const { slides, fixedImages } = useAppSelector(
          (state) => state.homeEditor
     );

     const handleAddSlide = () => {
          dispatch(addSlide());
     };

     const handleUpdateSlide = (
          id: number,
          field: string,
          value: string | number
     ) => {
          // Validate before dispatching if needed
          dispatch(updateSlide({ id, field: field as keyof Slide, value }));
     };

     const handleDeleteSlide = (id: number) => {
          dispatch(deleteSlide(id));
     };

     const handleDuplicateSlide = (id: number) => {
          dispatch(duplicateSlide(id));
     };

     const handleUpdateFixedImage = (
          id: number,
          field: string,
          value: string
     ) => {
          dispatch(updateFixedImage({ id, field: field as any, value }));
     };

     return (
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
                              onClick={handleAddSlide}
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
                         <SlideItem
                              key={slide.id}
                              slide={slide}
                              onUpdate={handleUpdateSlide}
                              onDelete={handleDeleteSlide}
                              onDuplicate={handleDuplicateSlide}
                         />
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
                         <FixedImageItem
                              key={image.id}
                              image={image}
                              onUpdate={handleUpdateFixedImage}
                         />
                    ))}
               </div>
          </div>
     );
}
