import { useHeroBanner } from "@/hooks";
import { deleteUploadedImage } from "@/lib/actions/media";
import { BannersFormType } from "@/lib/schemas/zod/slide-schema";

interface SlideHeaderProps {
    index: number;
    form: BannersFormType;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BannerHeader({
    form,
    index,
    loading,
    setLoading,
}: SlideHeaderProps) {
    const { setSlides } = useHeroBanner();

    const selectBanner = form.getValues(`banners.${index}`);

    async function handleClearBannerData() {
        setLoading(true);
        if (!selectBanner.imageUrl) return;

        await deleteUploadedImage({
            url: selectBanner.imageUrl,
        });

        form.setValue(`banners.${index}`, {
            ...selectBanner,
            imageUrl: "",
            linkStatus: false,
            linkTarget: "#",
            title: "",
        });

        setSlides((prevSlides) =>
            prevSlides.map((prevSlide) =>
                prevSlide.id === selectBanner.id
                    ? {
                          ...prevSlide,
                          imageUrl: "",
                          linkStatus: false,
                          linkTarget: "#",
                          title: "",
                      }
                    : prevSlide
            )
        );
        setLoading(false);
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">
                    {selectBanner.type === "right-top"
                        ? "vertical_align_top"
                        : "vertical_align_bottom"}
                </span>
                <h3 className="text-slate-900 dark:text-white font-bold text-base">
                    Banner Image -{" "}
                    {selectBanner.type === "right-top"
                        ? "Right Top"
                        : "Right Bottom"}
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
                <button
                    onClick={handleClearBannerData}
                    disabled={loading || !selectBanner.imageUrl}
                    aria-label="Clear Banner Data"
                    title={loading ? "Loading..." : "Clear all banner data"}
                    className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:dark:hover:text-gray-500"
                >
                    {loading ? (
                        <span className="material-symbols-outlined text-[18px] animate-spin">
                            progress_activity
                        </span>
                    ) : (
                        <span className="material-symbols-outlined text-[18px]">
                            delete
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
