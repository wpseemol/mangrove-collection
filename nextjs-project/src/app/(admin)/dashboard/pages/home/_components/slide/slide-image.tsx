import { useHeroBanner } from "@/hooks";
import { imagesUploadCloudinary } from "@/lib/actions/media";
import { SliderFormType } from "@/lib/schemas/zod/slide-schema";

import React, { useRef, useState } from "react";
import { FileWithPath } from "react-dropzone";

interface SlideImageProps {
  index: number;
  form: SliderFormType;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SlideImage({
  index,
  form,
  setLoading,
}: SlideImageProps) {
  const [selectedFile, setSelectedFile] = useState<FileWithPath | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    form.getValues(`slides.${index}.imageUrl`) || ""
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const slide = form.watch(`slides.${index}`);

  const { setSlides } = useHeroBanner();

  // Handle image file selection
  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.clearErrors(`slides.${index}.imageUrl`);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Start upload process
      await handleUploadFile(file);
    }
  };

  // Upload file to Cloudinary with your existing function
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

      // Use your existing upload function with folder parameter
      const response = await imagesUploadCloudinary(formData, "slides");

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (
        response.success &&
        response.data?.secure_url &&
        response.data?.public_id
      ) {
        // Update form values

        form.setValue(`slides.${index}.imageUrl`, response.data.secure_url);
        form.clearErrors(`slides.${index}.imageUrl`);

        // Update global state
        setSlides((prevSlides) =>
          prevSlides.map((prevSlide) =>
            prevSlide.id === slide.id
              ? { ...slide, imageUrl: response.data.secure_url }
              : prevSlide
          )
        );

        // Update preview
        setImagePreview(response.data.secure_url);

        // Wait a bit before resetting progress
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
          setLoading(false);
        }, 500);
      } else {
        form.setError(`slides.${index}.imageUrl`, {
          type: "manual",
          message: "Upload failed. Please try again.",
        });
      }
    } catch (error) {
      form.setError(`slides.${index}.imageUrl`, {
        type: "manual",
        message: "Upload failed. Please try again.",
      });
      console.error("Upload error:", error);
      setIsUploading(false);
      setUploadProgress(0);
      setLoading(false);

      // Clear preview on error
      setImagePreview("");
      setSelectedFile(null);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };


  return (
    <div className="w-full p-4">
      <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold mb-2 block">
        Upload Image {isUploading ? "(Uploading...)" : "*"}
      </label>
      <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">
        Recommended dimensions: 1920x822 pixels. Max file size: 1MB.
      </p>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />

      {/* Image Preview or Upload Area */}
      {imagePreview ? (
        <div className="aspect-[21/9] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative group/image border border-gray-200 dark:border-gray-700">
          <div
            className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover/image:scale-105"
            style={{
              backgroundImage: `url(${imagePreview})`,
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={triggerFileInput}
              className="text-white text-xs font-medium flex items-center gap-1 bg-black/60 hover:bg-black/80 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading}
            >
              <span className="material-symbols-outlined text-sm">
                {isUploading ? "hourglass_empty" : "edit"}
              </span>
              {isUploading ? "Uploading..." : "Change Image"}
            </button>
          </div>

          {/* Upload Progress Bar */}
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
          className={`aspect-[21/9] w-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 border-2 border-dashed ${
            isUploading
              ? "border-gray-300 dark:border-gray-700 cursor-not-allowed"
              : "border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-500"
          } transition-colors cursor-pointer group/upload`}
        >
          {isUploading ? (
            <>
              <span className="material-symbols-outlined text-[32px] mb-1 animate-spin">
                progress_activity
              </span>
              <span className="text-xs font-medium">Uploading...</span>
              <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[32px] mb-1 group-hover/upload:scale-110 transition-transform">
                add_photo_alternate
              </span>
              <span className="text-xs font-medium">Click to upload image</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                JPG, PNG, GIF up to 5MB
              </span>
            </>
          )}
        </button>
      )}

      {/* Upload Error */}
      {form.formState.errors.slides && form.formState.errors.slides[index]?.imageUrl && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-xs">
            <span className="material-symbols-outlined text-xs align-middle mr-1">
              error
            </span>
            {form.formState.errors.slides[index]?.imageUrl?.message}
          </p>
        </div>
      )}

      {/* Selected file name */}
      {selectedFile && !isUploading && (
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400 truncate max-w-[70%]">
            {selectedFile.name}
          </span>
          <span className="text-gray-500 dark:text-gray-500">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      )}
    </div>
  );
}
