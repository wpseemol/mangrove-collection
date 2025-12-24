"use client";

import { FixedImage } from "@/store/features/homeEditorSlice";

interface FixedImageItemProps {
     image: FixedImage;
     onUpdate: (id: number, field: keyof FixedImage, value: string) => void;
}

export default function FixedImageItem({
     image,
     onUpdate,
}: FixedImageItemProps) {
     return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                    <div className="w-full">
                         <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold mb-2 block">
                              Preview Image
                         </label>
                         <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative group/image border border-gray-200 dark:border-gray-700">
                              <div
                                   className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover/image:scale-105"
                                   style={{
                                        backgroundImage: `url(${image.imageUrl})`,
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
                    </div>

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
                                             onUpdate(
                                                  image.id,
                                                  "imageUrl",
                                                  e.target.value
                                             )
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
                                             onUpdate(
                                                  image.id,
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
