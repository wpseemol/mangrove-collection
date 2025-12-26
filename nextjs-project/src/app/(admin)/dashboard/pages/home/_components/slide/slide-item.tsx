"use client";

import { imagesUploadCloudinary } from "@/lib/actions/media";
import { Slide } from "@/store/features/homeEditorSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define Zod schema for validation
const slideFormSchema = z.object({
     title: z
          .string()
          .min(1, "Title is required")
          .max(50, "Title must be 50 characters or less"),
     imageUrl: z.string().optional(),
     publicId: z.string().optional(),
     linkTarget: z.string().default("#"),
     linkStatus: z.boolean().default(false),
});

type SlideFormData = z.infer<typeof slideFormSchema>;

// Type for uploaded file with path
type FileWithPath = File & { path?: string };

interface SlideItemProps {
     slide: Slide;
     onUpdate: (
          id: number,
          field: keyof Slide,
          value: string | number | boolean
     ) => void;
     onDelete: (id: number) => void;
     onDuplicate: (id: number) => void;
     imagesUploadCloudinary: (
          formData: FormData,
          folder?: string
     ) => Promise<{
          success: boolean;
          data?: {
               secure_url: string;
               public_id: string;
          };
          error?: string;
     }>;
}

export default function SlideItem({
     slide,
     onUpdate,
     onDelete,
     onDuplicate,
}: SlideItemProps) {
     const [linkStatus, setLinkStatus] = useState<boolean>(false);
     const [selectedFile, setSelectedFile] = useState<FileWithPath | null>(
          null
     );
     const [imagePreview, setImagePreview] = useState<string>(
          slide.imageUrl || ""
     );
     const [uploadProgress, setUploadProgress] = useState<number>(0);
     const [isUploading, setIsUploading] = useState<boolean>(false);
     const [uploadError, setUploadError] = useState<string>("");
     const fileInputRef = useRef<HTMLInputElement>(null);

     const {
          register,
          handleSubmit,
          formState: { errors, isDirty, isValid },
          watch,
          reset,
          setValue,
          getValues,
     } = useForm<SlideFormData>({
          resolver: zodResolver(slideFormSchema),
          defaultValues: {
               title: slide.title || "",
               imageUrl: slide.imageUrl || "",
               publicId: slide.publicId || "",
               linkTarget: slide.linkTarget || "#",
               linkStatus:
                    slide.linkTarget && slide.linkTarget !== "#" ? true : false,
          },
          mode: "onChange",
     });

     // Initialize linkStatus from slide data
     useEffect(() => {
          const hasLink = slide.linkTarget && slide.linkTarget !== "#";
          setLinkStatus(hasLink);
          setValue("linkStatus", hasLink, { shouldValidate: true });
     }, [slide.linkTarget, setValue]);

     // Watch form values
     const watchedValues = watch();

     // Handle image file selection
     const handleImageSelect = async (
          event: React.ChangeEvent<HTMLInputElement>
     ) => {
          const file = event.target.files?.[0];
          if (file) {
               setSelectedFile(file);
               setUploadError("");

               // Create preview URL
               const previewUrl = URL.createObjectURL(file);
               setImagePreview(previewUrl);

               // Start upload process
               await handleUploadFile(file);
          }
     };

     // Upload file to Cloudinary with your existing function
     const handleUploadFile = async (file: File) => {
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
               const response = await imagesUploadCloudinary(
                    formData,
                    "slides"
               );

               clearInterval(progressInterval);
               setUploadProgress(100);

               if (
                    response.success &&
                    response.data?.secure_url &&
                    response.data?.public_id
               ) {
                    // Update form values
                    setValue("imageUrl", response.data.secure_url, {
                         shouldDirty: true,
                    });
                    setValue("publicId", response.data.public_id, {
                         shouldDirty: true,
                    });

                    // Update parent component
                    onUpdate(slide.id, "imageUrl", response.data.secure_url);
                    onUpdate(slide.id, "publicId", response.data.public_id);

                    // Update preview
                    setImagePreview(response.data.secure_url);

                    // Wait a bit before resetting progress
                    setTimeout(() => {
                         setUploadProgress(0);
                         setIsUploading(false);
                    }, 500);
               } else {
                    throw new Error(response.error || "Upload failed");
               }
          } catch (error) {
               console.error("Upload error:", error);
               setUploadError(
                    error instanceof Error ? error.message : "Upload failed"
               );
               setIsUploading(false);
               setUploadProgress(0);

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

     // Update parent when form changes (debounced)
     useEffect(() => {
          if (isDirty && isValid) {
               const timeoutId = setTimeout(() => {
                    Object.entries(watchedValues).forEach(([field, value]) => {
                         if (field === "linkStatus") {
                              // Handle link status special logic
                              const newLinkStatus = value as boolean;
                              setLinkStatus(newLinkStatus);

                              // If turning off link, set linkTarget to "#"
                              if (!newLinkStatus) {
                                   setValue("linkTarget", "#", {
                                        shouldDirty: true,
                                   });
                                   onUpdate(slide.id, "linkTarget", "#");
                              }
                         } else if (field === "linkTarget") {
                              // Update linkStatus based on linkTarget value
                              const hasLink =
                                   value !== "#" && value.trim() !== "";
                              if (hasLink !== linkStatus) {
                                   setLinkStatus(hasLink);
                                   setValue("linkStatus", hasLink, {
                                        shouldDirty: true,
                                   });
                                   onUpdate(slide.id, "linkStatus", hasLink);
                              }
                         }

                         // Update parent
                         if (field !== "publicId") {
                              // publicId is handled separately
                              onUpdate(slide.id, field as keyof Slide, value);
                         }
                    });
               }, 500);

               return () => clearTimeout(timeoutId);
          }
     }, [
          watchedValues,
          isDirty,
          isValid,
          slide.id,
          onUpdate,
          linkStatus,
          setValue,
     ]);

     // Reset form when slide prop changes
     useEffect(() => {
          reset({
               title: slide.title || "",
               imageUrl: slide.imageUrl || "",
               publicId: slide.publicId || "",
               linkTarget: slide.linkTarget || "#",
               linkStatus:
                    slide.linkTarget && slide.linkTarget !== "#" ? true : false,
          });
          setImagePreview(slide.imageUrl || "");
          setLinkStatus(
               slide.linkTarget && slide.linkTarget !== "#" ? true : false
          );
     }, [slide, reset]);

     const onSubmit = (data: SlideFormData) => {
          console.log("Form submitted:", data);
     };

     // Determine slide status based on image
     const hasImage = imagePreview && imagePreview.trim().length > 0;
     const slideStatus = hasImage ? "active" : "draft";

     // Handle link status toggle
     const handleLinkStatusToggle = () => {
          const newLinkStatus = !linkStatus;
          setLinkStatus(newLinkStatus);
          setValue("linkStatus", newLinkStatus, { shouldDirty: true });

          // If turning off link, set linkTarget to "#"
          if (!newLinkStatus) {
               setValue("linkTarget", "#", { shouldDirty: true });
               onUpdate(slide.id, "linkTarget", "#");
          }
     };

     return (
          <div
               className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group transition-opacity ${
                    slideStatus === "draft"
                         ? "opacity-70 hover:opacity-100"
                         : ""
               }`}
          >
               <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex items-center gap-3">
                         <span className="material-symbols-outlined text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300">
                              drag_indicator
                         </span>
                         <div>
                              <h3 className="text-slate-900 dark:text-white font-bold text-base">
                                   {slide.title || "Untitled Slide"}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                   <span
                                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                                             slideStatus === "active"
                                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                        }`}
                                   >
                                        {slideStatus === "active"
                                             ? "Active"
                                             : "Draft"}
                                   </span>
                                   <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Position: {slide.position}
                                   </span>
                                   {isUploading && (
                                        <span className="text-xs text-blue-600 dark:text-blue-400">
                                             Uploading...
                                        </span>
                                   )}
                              </div>
                         </div>
                    </div>
                    <div className="flex items-center gap-1">
                         <button
                              onClick={() => onDuplicate(slide.id)}
                              className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              title="Duplicate"
                              disabled={isUploading}
                         >
                              <span className="material-symbols-outlined text-[18px]">
                                   content_copy
                              </span>
                         </button>
                         <button
                              onClick={() => onDelete(slide.id)}
                              className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                              disabled={isUploading}
                         >
                              <span className="material-symbols-outlined text-[18px]">
                                   delete
                              </span>
                         </button>
                    </div>
               </div>

               <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-4 flex flex-col gap-5"
               >
                    {/* Title Field */}
                    <div className="flex flex-col gap-1.5">
                         <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold">
                              Slide Title *
                         </label>
                         <input
                              {...register("title")}
                              className={`bg-white dark:bg-gray-800 border ${
                                   errors.title
                                        ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                              } text-slate-900 dark:text-white text-sm rounded-lg block p-2.5 w-full`}
                              placeholder="Enter slide title"
                              type="text"
                              disabled={isUploading}
                         />
                         {errors.title && (
                              <p className="text-red-500 text-xs">
                                   {errors.title.message}
                              </p>
                         )}
                    </div>

                    {/* Image Upload Section */}
                    <div className="w-full">
                         <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold mb-2 block">
                              Upload Image{" "}
                              {isUploading ? "(Uploading...)" : "*"}
                         </label>

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
                                                  {isUploading
                                                       ? "hourglass_empty"
                                                       : "edit"}
                                             </span>
                                             {isUploading
                                                  ? "Uploading..."
                                                  : "Change Image"}
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
                                             <span className="text-xs font-medium">
                                                  Uploading...
                                             </span>
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
                                             <span className="text-xs font-medium">
                                                  Click to upload image
                                             </span>
                                             <span className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                                                  JPG, PNG, GIF up to 5MB
                                             </span>
                                        </>
                                   )}
                              </button>
                         )}

                         {/* Upload Error */}
                         {uploadError && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                   <p className="text-red-600 dark:text-red-400 text-xs">
                                        <span className="material-symbols-outlined text-xs align-middle mr-1">
                                             error
                                        </span>
                                        {uploadError}
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
                                        {(
                                             selectedFile.size /
                                             1024 /
                                             1024
                                        ).toFixed(2)}{" "}
                                        MB
                                   </span>
                              </div>
                         )}
                    </div>

                    {/* Link Section with Toggle */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
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
                                   onClick={handleLinkStatusToggle}
                                   disabled={isUploading}
                                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                                        linkStatus
                                             ? "bg-blue-600 dark:bg-blue-500"
                                             : "bg-gray-300 dark:bg-gray-700"
                                   }`}
                              >
                                   <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                             linkStatus
                                                  ? "translate-x-6"
                                                  : "translate-x-1"
                                        }`}
                                   />
                                   <input
                                        type="checkbox"
                                        {...register("linkStatus")}
                                        className="sr-only"
                                   />
                              </button>
                         </div>

                         {/* Link Target Field (conditionally enabled) */}
                         <div className="flex flex-col gap-1.5">
                              <label className="text-slate-900 dark:text-gray-200 text-xs font-semibold">
                                   Link Target {linkStatus && "*"}
                              </label>
                              <div className="flex w-full items-stretch rounded-lg shadow-sm">
                                   <span className="inline-flex items-center px-3 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-lg text-xs select-none">
                                        /
                                   </span>
                                   <input
                                        {...register("linkTarget")}
                                        disabled={!linkStatus || isUploading}
                                        className={`flex-1 bg-white dark:bg-gray-800 border ${
                                             errors.linkTarget
                                                  ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                                                  : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                        } ${
                                             !linkStatus || isUploading
                                                  ? "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                                  : "text-slate-900 dark:text-white"
                                        } text-sm rounded-r-lg block p-2.5 min-w-0`}
                                        placeholder={
                                             linkStatus
                                                  ? "collections/summer-sale"
                                                  : "Enable link to add target"
                                        }
                                        type="text"
                                   />
                              </div>
                              {errors.linkTarget && (
                                   <p className="text-red-500 text-xs">
                                        {errors.linkTarget.message}
                                   </p>
                              )}
                              {linkStatus && (
                                   <div className="space-y-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                             Relative path only (e.g.,
                                             "collections/summer-sale")
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                             Default value is "#" if left empty
                                        </p>
                                   </div>
                              )}
                         </div>
                    </div>

                    {/* Form Status */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                         <div className="text-xs text-gray-500 dark:text-gray-400">
                              {isUploading ? (
                                   <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm animate-spin">
                                             progress_activity
                                        </span>
                                        Uploading image...
                                   </span>
                              ) : isDirty && isValid ? (
                                   <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">
                                             check_circle
                                        </span>
                                        Changes saved
                                   </span>
                              ) : isDirty ? (
                                   <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">
                                             warning
                                        </span>
                                        Please fix errors
                                   </span>
                              ) : (
                                   "No unsaved changes"
                              )}
                         </div>
                         <button
                              type="submit"
                              disabled={!isDirty || !isValid || isUploading}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                         >
                              {isUploading ? (
                                   <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm animate-spin">
                                             progress_activity
                                        </span>
                                        Uploading...
                                   </span>
                              ) : (
                                   "Save Changes"
                              )}
                         </button>
                    </div>
               </form>
          </div>
     );
}
