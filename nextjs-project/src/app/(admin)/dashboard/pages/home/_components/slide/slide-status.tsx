
import { SliderFormType } from "@/lib/schemas/zod/slide-schema";
import { useEffect, useState } from "react";
import { SlidesType } from "../hero-banner-provider";


interface SlideStatusProps {
  form: SliderFormType;
  loading: boolean;
  data:string
}

export default function SlideStatus({ form, loading, data }: SlideStatusProps) {
  const { formState } = form;
  const { isDirty, errors } = formState;
  const [isDisable, setDisable] = useState(true);

  useEffect(() => {  

      const dbData = JSON.parse(data) as SlidesType[];

      const dbDataVal = dbData.map(slide=>({title:slide.title,imageUrl: slide.imageUrl, linkStatus: slide.linkStatus, linkTarget: slide.linkTarget}))
      const formDataVal = form.getValues().slides.map((slide)=>({title:slide.title,imageUrl: slide.imageUrl, linkStatus: slide.linkStatus, linkTarget: slide.linkTarget}))

      setDisable(JSON.stringify(dbDataVal) === JSON.stringify(formDataVal));
    
  }, [form, formState]);

  const hasErrors = !!errors?.slides;
  const currentLoading = loading || form.formState.isSubmitting;

 

;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 px-4 pb-4">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {currentLoading ? (
          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm animate-spin">
              progress_activity
            </span>
            Saving...
          </span>
        ) : isDirty && hasErrors ? (
          <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              warning
            </span>
            Please fix errors
          </span>
        ) : isDirty ? (
          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              edit
            </span>
            Unsaved changes
          </span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              check
            </span>
            All changes saved
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={currentLoading || hasErrors || isDisable}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
      >
        {currentLoading ? (
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm animate-spin">
              progress_activity
            </span>
            Saving...
          </span>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}