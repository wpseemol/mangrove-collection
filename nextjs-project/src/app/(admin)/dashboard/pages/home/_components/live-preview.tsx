"use client";

import { setActiveView } from "@/store/features/homeEditorSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function LivePreview() {
     const dispatch = useAppDispatch();
     const { activeView, slides, fixedImages } = useAppSelector(
          (state) => state.homeEditor
     );

     return (
          <div className="lg:col-span-7 xl:col-span-8 sticky top-24 order-1 lg:order-2 hidden lg:block">
               <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
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
                                   onClick={() =>
                                        dispatch(setActiveView("desktop"))
                                   }
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
                                   onClick={() =>
                                        dispatch(setActiveView("mobile"))
                                   }
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

                    <div className="flex-1 bg-gray-100 dark:bg-[#0d131a] relative overflow-hidden flex flex-col">
                         <div className="w-full h-full overflow-y-auto custom-scrollbar">
                              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 h-16 w-full flex items-center justify-between px-8 relative z-20">
                                   <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                                   <div className="flex gap-6">
                                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                   </div>
                                   <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                              </div>

                              <div className="p-6">
                                   <div className="grid grid-cols-12 gap-4 h-[500px]">
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
                                                  {slides.map(
                                                       (slide, index) => (
                                                            <button
                                                                 key={slide.id}
                                                                 className={`w-8 h-1 rounded-full transition-all ${
                                                                      index ===
                                                                      0
                                                                           ? "bg-white"
                                                                           : "bg-white/30 hover:bg-white/60"
                                                                 }`}
                                                            />
                                                       )
                                                  )}
                                             </div>
                                        </div>

                                        <div className="col-span-4 flex flex-col gap-4 h-full">
                                             {fixedImages.map((image) => (
                                                  <div
                                                       key={image.id}
                                                       className="flex-1 rounded-lg overflow-hidden relative group cursor-pointer"
                                                  >
                                                       <div
                                                            className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
                                                            style={{
                                                                 backgroundImage: `url(${image.imageUrl})`,
                                                            }}
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
     );
}
