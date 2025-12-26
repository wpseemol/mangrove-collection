import {
     SlideFormData,
     SliderFormData,
     sliderFormSchema,
   
} from "@/lib/schemas/zod/slide-schema";
import { generateUniqueIds } from "@/utils/unique-id-generate";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import LinkSection from "./link-section";
import SlideHeader from "./slide-header";


export default function SlidesForm() {
     const [loading, setLoading] = React.useState(false);

     console.log("just for testing",setLoading)

    const form = useForm<SliderFormData>({
          resolver: zodResolver(sliderFormSchema),
          defaultValues: {
               slides: [
                    {
                         id: generateUniqueIds({ pattern: "***" }) as string,
                         title: "",
                         imageUrl: "https://picsum.photos/200/300",
                         linkTarget: "#",
                         linkStatus: false,
                    },
               ],
          },
     });

     const { fields, append, remove } = useFieldArray({
          control: form.control,
          name: "slides",
     });

     // handle duplicate slide

     const handleDuplicateSlide = (field: SlideFormData) => {
          append(field);
     };

     const handleDeleteSlide = (index: number) => {
          remove(index);
     };

     const onSubmit = (data: SliderFormData) => {
          console.log("submit data:",data);
     };

     

     return (
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
                         onClick={() =>
                              append({
                                   id: generateUniqueIds({ pattern: "***" }) as string,
                                   title: "",
                                   imageUrl: "",
                                   linkTarget: "#",
                                   linkStatus: false,
                              })
                         }
                         className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                    >
                         <span className="material-symbols-outlined text-[20px]">
                              add
                         </span>
                         Add Slide
                    </button>
               </div>

               {/* Slides List */}
               {/* {slides.map((slide) => (
                         <SlideItem
                              key={slide.id}
                              slide={slide}
                              onUpdate={handleUpdateSlide}
                              onDelete={handleDeleteSlide}
                              onDuplicate={handleDuplicateSlide}
                         />
                    ))} */}
                              <form onSubmit={form.handleSubmit(onSubmit)}>
                    {fields.map((field, index) => (
                         <div
                              key={field.id}
                              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group transition-opacity"
                         >
                              {/* slider header */}
                              <SlideHeader
                                   title={field.title}
                                   loading={loading}
                                   isDelete={
                                        fields.length <= 1
                                        // Prevent deleting the last slide
                                   }
                                   onDuplicate={() =>
                                        handleDuplicateSlide({
                                             id: generateUniqueIds({
                                                  pattern: "***",
                                             }) as string,
                                             title: field.title,
                                             imageUrl: field.imageUrl,
                                             linkStatus: field.linkStatus,
                                             linkTarget: field.linkTarget,
                                        })
                                   }
                                   onDelete={() => handleDeleteSlide(index)}
                              />

                              {/* slider body */}

                              <LinkSection
                                   index={index}
                                   form={form}
                                   
                              />
                         </div>
                    ))}

                    <button type="submit">test submit</button>
               </form>
          </div>
     );
}





