import { useHeroBanner } from "@/hooks";
import { SliderFormType } from "@/lib/schemas/zod/slide-schema";
import { useEffect } from "react";

import { Controller } from "react-hook-form";

interface SlideTitleProps {
  index: number;
  form: SliderFormType;
  loading: boolean;
  onChange?: () => void;
}

export default function SlideTitle({ index, form, loading, onChange }: SlideTitleProps) {
  const slideTitle = form.watch(`slides.${index}`);

  const { setSlides } = useHeroBanner();

  useEffect(() => {
    
    setSlides((prevSlides) =>
      prevSlides.map((slide) =>
        slide.id === slideTitle.id
          ? { ...slide, title: slideTitle.title }
          : slide
      )
    );

    onChange?.();

  }, [slideTitle.title, index]);

  return (
    <div className="flex flex-col gap-1.5 px-4 pt-4">
      <Controller
        name={`slides.${index}.title`}
        control={form.control}
        render={({ field, fieldState: { error } }) => (
          <>
            <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold">
              Slide Title *
            </label>
            <input
              {...field}
              className={`bg-white dark:bg-gray-800 border ${
                error
                  ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
              } text-slate-900 dark:text-white text-sm rounded-lg block p-2.5 w-full`}
              placeholder="Enter slide title"
              type="text"
              disabled={loading}
            />
            {error && <p className="text-red-500 text-xs">{error.message}</p>}
          </>
        )}
      />
    </div>
  );
}
