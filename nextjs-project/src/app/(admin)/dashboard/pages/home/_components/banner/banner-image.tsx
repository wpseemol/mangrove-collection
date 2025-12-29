import { useHeroBanner } from "@/hooks";
import {
    deleteUploadedImage,
    imagesUploadCloudinary,
} from "@/lib/actions/media";
import { BannersFormType } from "@/lib/schemas/zod/slide-schema";
import React, { useEffect, useRef, useState } from "react";
import { FileWithPath } from "react-dropzone";

interface SlideImageProps {
    index: number;
    form: BannersFormType;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
];
const RECOMMENDED_DIMENSIONS = "1200x800 pixels";

export default function BannerImage({
    index,
    form,
    setLoading,
}: SlideImageProps) {
    const [selectedFile, setSelectedFile] = useState<FileWithPath | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(
        form.getValues(`banners.${index}.imageUrl`) || ""
    );
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const slide = form.watch(`banners.${index}`);
    const { setSlides } = useHeroBanner();

    useEffect(() => {
        setImagePreview(slide.imageUrl || "");
    }, [slide.imageUrl]);

    const validateFile = (file: File): string | null => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return `File size (${formatFileSize(file.size)}) exceeds 1MB limit`;
        }

        // Check file type
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            return `Invalid file type. Allowed: ${ACCEPTED_IMAGE_TYPES.map(
                (t) => t.split("/")[1]
            ).join(", ")}`;
        }

        return null;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " bytes";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(2) + " MB";
    };

    const handleImageSelect = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
            form.setError(`banners.${index}.imageUrl`, {
                type: "manual",
                message: validationError,
            });
            event.target.value = ""; // Clear input
            return;
        }

        setSelectedFile(file);
        form.clearErrors(`banners.${index}.imageUrl`);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        // Start upload process
        await handleUploadFile(file);
    };

    const handleUploadFile = async (file: File) => {
        setLoading(true);
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("image", file);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await imagesUploadCloudinary(formData, "slides");
            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.success && response.data?.secure_url) {
                // Update form
                form.setValue(
                    `banners.${index}.imageUrl`,
                    response.data.secure_url
                );
                form.clearErrors(`banners.${index}.imageUrl`);

                // Update global state
                setSlides((prevSlides) =>
                    prevSlides.map((prevSlide) =>
                        prevSlide.id === slide.id
                            ? {
                                  ...prevSlide,
                                  imageUrl: response.data.secure_url,
                              }
                            : prevSlide
                    )
                );

                // Update preview with uploaded image
                setImagePreview(response.data.secure_url);

                // Revoke object URL to prevent memory leaks
                if (selectedFile) {
                    URL.revokeObjectURL(imagePreview);
                }

                setTimeout(() => {
                    setUploadProgress(0);
                    setIsUploading(false);
                    setLoading(false);
                }, 500);
            } else {
                form.setError(`banners.${index}.imageUrl`, {
                    type: "manual",
                    message:
                        response.message || "Upload failed. Please try again.",
                });
            }
        } catch (error) {
            console.error("Upload error:", error);
            form.setError(`banners.${index}.imageUrl`, {
                type: "manual",
                message: "Upload failed. Please try again.",
            });
        } finally {
            if (!isUploading) {
                setIsUploading(false);
                setUploadProgress(0);
                setLoading(false);
            }

            // Cleanup
            if (selectedFile && imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }

            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const triggerFileInput = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleRemoveImage = async () => {
        const currentImageUrl = form.getValues(`banners.${index}.imageUrl`);

        if (currentImageUrl) {
            try {
                setLoading(true);
                const result = await deleteUploadedImage({
                    url: currentImageUrl,
                });
                console.log("Delete result:", result);
            } catch (error) {
                console.error("Delete error:", error);
            } finally {
                setLoading(false);
            }
        }

        // Clear local state
        setImagePreview("");
        setSelectedFile(null);
        form.setValue(`banners.${index}.imageUrl`, "");
        form.clearErrors(`banners.${index}.imageUrl`);

        // Update global state
        setSlides((prevSlides) =>
            prevSlides.map((prevSlide) =>
                prevSlide.id === slide.id
                    ? { ...prevSlide, imageUrl: "" }
                    : prevSlide
            )
        );

        // Cleanup file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        // Revoke object URL if it's a blob URL
        if (imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }
    };

    return (
        <div className="w-full p-4">
            <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold mb-2 block">
                Upload Image {isUploading && "(Uploading...)"}
            </label>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">
                Recommended: {RECOMMENDED_DIMENSIONS}. Max: 1MB.
            </p>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                className="hidden"
                disabled={isUploading}
            />

            {imagePreview ? (
                <div className="relative group/image">
                    <div className="aspect-[21/9] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div
                            className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover/image:scale-105"
                            style={{
                                backgroundImage: `url(${imagePreview})`,
                            }}
                        />
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={triggerFileInput}
                            disabled={isUploading}
                            className="text-white text-xs font-medium flex items-center gap-1 bg-black/60 hover:bg-black/80 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sm">
                                {isUploading ? "hourglass_empty" : "edit"}
                            </span>
                            {isUploading ? "Uploading..." : "Change"}
                        </button>
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={isUploading}
                            className="text-white text-xs font-medium flex items-center gap-1 bg-red-600/80 hover:bg-red-700/90 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sm">
                                delete
                            </span>
                            Remove
                        </button>
                    </div>

                    {isUploading && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${uploadProgress}%`,
                                    }}
                                />
                            </div>
                            <p className="text-white text-xs text-center mt-1">
                                {uploadProgress}% uploaded
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    className={`aspect-[21/9] w-full bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center border-2 border-dashed transition-colors ${
                        isUploading
                            ? "border-gray-300 dark:border-gray-700 cursor-not-allowed"
                            : "border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:text-blue-500"
                    }`}
                >
                    {isUploading ? (
                        <>
                            <span className="material-symbols-outlined text-[32px] mb-1 animate-spin">
                                progress_activity
                            </span>
                            <span className="text-xs font-medium">
                                Uploading...
                            </span>
                            <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                        width: `${uploadProgress}%`,
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[32px] mb-1">
                                add_photo_alternate
                            </span>
                            <span className="text-xs font-medium">
                                Click to upload image
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                                JPEG, PNG, WebP, GIF • Max 1MB
                            </span>
                        </>
                    )}
                </button>
            )}

            {form.formState.errors.banners?.[index]?.imageUrl && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">
                            error
                        </span>
                        {
                            form.formState.errors.banners[index]?.imageUrl
                                ?.message
                        }
                    </p>
                </div>
            )}

            {selectedFile && !isUploading && (
                <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400 truncate max-w-[70%]">
                        {selectedFile.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500">
                        {formatFileSize(selectedFile.size)}
                    </span>
                </div>
            )}
        </div>
    );
}
