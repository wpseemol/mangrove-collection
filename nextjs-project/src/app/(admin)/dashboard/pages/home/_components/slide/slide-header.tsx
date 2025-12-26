import { useHeroBanner } from "@/hooks";
import { deleteUploadedImage } from "@/lib/actions/media";
import { SliderFormType } from "@/lib/schemas/zod/slide-schema";

// components/HomeEditor/SlideItem/slide-header.tsx
interface SlideHeaderProps {
  index: number;
  form: SliderFormType;
  loading: boolean;
  isDelete: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function SlideHeader({
  form,
  index,
  loading,
  isDelete,
  onDuplicate,
  onDelete,
}: SlideHeaderProps) {
  const { setSlides } = useHeroBanner();

  const selectSlide = form.getValues(`slides.${index}`);
  async function imageDeleted() {
    setSlides((prevSlides) =>
      prevSlides.filter((prevSlide) => prevSlide.id !== selectSlide.id)
    );

    if (!selectSlide.imageUrl) return;

    const result = await deleteUploadedImage({
      url: selectSlide.imageUrl,
    });

    console.log("delete image result:", result);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300">
          drag_indicator
        </span>
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold text-base">
            {form.getValues(`slides.${index}.title`) || "Untitled Slide"}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {loading && (
              <span className="text-xs text-blue-600 dark:text-blue-400">
                Uploading...
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onDuplicate}
          className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Duplicate"
          disabled={loading}
        >
          <span className="material-symbols-outlined text-[18px]">
            content_copy
          </span>
        </button>
        <button
          onClick={() => {
            onDelete();
            imageDeleted();
          }}
          className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete"
          disabled={loading || isDelete}
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}
