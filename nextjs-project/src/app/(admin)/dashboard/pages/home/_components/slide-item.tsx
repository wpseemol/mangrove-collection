"use client";

import { Slide } from "@/store/features/homeEditorSlice";

interface SlideItemProps {
     slide: Slide;
     onUpdate: (id: number, field: keyof Slide, value: string) => void;
     onDelete: (id: number) => void;
     onDuplicate: (id: number) => void;
}

export default function SlideItem({
     slide,
     onUpdate,
     onDelete,
     onDuplicate,
}: SlideItemProps) {
     return (
          <div
               className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group transition-opacity ${
                    slide.status === "draft"
                         ? "opacity-70 hover:opacity-100"
                         : ""
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
                              onClick={() => onDuplicate(slide.id)}
                              className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              title="Duplicate"
                         >
                              <span className="material-symbols-outlined text-[18px]">
                                   content_copy
                              </span>
                         </button>
                         <button
                              onClick={() => onDelete(slide.id)}
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
                    <div className="w-full">
                         <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold mb-2 block">
                              Preview Image
                         </label>
                         {slide.imageUrl ? (
                              <div className="aspect-[21/9] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative group/image border border-gray-200 dark:border-gray-700">
                                   <div
                                        className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover/image:scale-105"
                                        style={{
                                             backgroundImage: `url(${slide.imageUrl})`,
                                        }}
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
                                             onUpdate(
                                                  slide.id,
                                                  "imageUrl",
                                                  e.target.value
                                             )
                                        }
                                   />
                                   <button className="inline-flex items-center px-3 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">
                                             open_in_new
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
                                        placeholder="collections/all"
                                        type="text"
                                        value={slide.linkTarget}
                                        onChange={(e) =>
                                             onUpdate(
                                                  slide.id,
                                                  "linkTarget",
                                                  e.target.value
                                             )
                                        }
                                   />
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
