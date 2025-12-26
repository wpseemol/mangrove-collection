"use client";

import {
     deleteSlide,
     duplicateSlide,
     updateFixedImage,
     updateSlide,
} from "@/store/features/homeEditorSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import FixedImageItem from "./fixed-image-item";
import SlidesForm from "./slide";

export default function ControlsPanel() {
     const dispatch = useAppDispatch();
     const { slides, fixedImages } = useAppSelector(
          (state) => state.homeEditor
     );

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
