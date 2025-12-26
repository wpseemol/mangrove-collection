
import {  SliderFormType } from "@/lib/schemas/zod/slide-schema";
import { Controller } from "react-hook-form";

// components/HomeEditor/SlideItem/link-section.tsx
interface LinkSectionProps {
     index: number;
     form: SliderFormType;
    
}

export default function LinkSection({
     index,
     form,
     
}: LinkSectionProps) {

     return (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
               <Controller
                    name={`slides.${index}.linkStatus`}
                    control={form.control}
                    render={({ field }) => (
                         <div className="space-y-3">
                              {/* Toggle Section */}
                              <div className="flex items-center justify-between mb-3">
                                   <div>
                                        <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold">
                                             Add Link
                                        </label>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                             Enable to add a link for this slide
                                        </p>
                                   </div>
                                   {/* Toggle Switch */}
                                   <button
                                        type="button"
                                        onClick={() =>
                                             field.onChange(!field.value)
                                        }
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                             field.value
                                                  ? "bg-blue-600 dark:bg-blue-500"
                                                  : "bg-gray-300 dark:bg-gray-700"
                                        }`}
                                   >
                                        <span
                                             className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                  field.value
                                                       ? "translate-x-6"
                                                       : "translate-x-1"
                                             }`}
                                        />
                                        <input
                                             type="checkbox"
                                             checked={field.value}
                                             onChange={() =>
                                                  field.onChange(!field.value)
                                             }
                                             className="sr-only"
                                        />
                                   </button>
                              </div>

                              {/* Link Target Field (conditionally rendered) */}
                              {field.value && (
                                   <div className="animate-fadeIn">
                                        <div className="flex flex-col gap-1.5">
                                             <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold">
                                                  Link Target *
                                             </label>
                                             <div className="flex w-full items-stretch rounded-lg shadow-sm">
                                                  <span className="inline-flex items-center px-3 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-lg text-xs select-none">
                                                       /
                                                  </span>
                                                  <Controller
                                                       name={`slides.${index}.linkTarget`}
                                                       control={form.control}
                                                       render={({
                                                            field: linkField,
                                                       }) => (
                                                            <input
                                                                 {...linkField}
                                                                 className={`flex-1 bg-white dark:bg-gray-800 border ${
                                                                      form.formState.errors.slides &&
                                                                      form.formState.errors.slides[index]?.linkTarget
                                                                           ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                                                                           : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                                                 } text-slate-900 dark:text-white text-sm rounded-r-lg block p-2.5 min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                                                 placeholder="collections/summer-sale"
                                                                 type="text"
                                                            />
                                                       )}
                                                  />
                                             </div>
                                             
                                             {form.formState.errors.slides && (
                                   <p className="text-red-500 text-xs">
                                        {form.formState.errors.slides[index]?.linkTarget?.message}
                                   </p>
                              )}


                                             <div className="space-y-1 mt-2">
                                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                                       Relative path only (e.g.,
                                                       "collections/summer-sale")
                                                  </p>
                                                  <p className="text-xs text-blue-600 dark:text-blue-400">
                                                       Default value is "#" if
                                                       left empty
                                                  </p>
                                             </div>
                                        </div>
                                   </div>
                              )}
                         </div>
                    )}
               />
          </div>
     );
}
