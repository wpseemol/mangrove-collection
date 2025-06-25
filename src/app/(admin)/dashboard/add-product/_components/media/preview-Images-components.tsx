import {
     deleteUploadedImage,
     imagesUploadCloudinary,
} from "@/lib/actions/media";
import { motion } from "framer-motion";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { PreviewStateType } from "./images";

interface PreviewImagesComponentsType {
     previewImageDetails: PreviewStateType;
     setPreviewImages: Dispatch<SetStateAction<PreviewStateType[] | null>>;
     setIsFileUpload: Dispatch<SetStateAction<boolean>>;
}
export default function PreviewImagesComponents({
     setIsFileUpload,
     previewImageDetails,
     setPreviewImages,
}: PreviewImagesComponentsType) {
     const [progress, setProgress] = useState<number>(0);
     const [loading, setLoading] = useState<boolean>(false);

     async function handelCancelImage(id: string, public_id: string) {
          setIsFileUpload(true);
          setLoading(true);
          await deleteUploadedImage({
               public_id,
          });
          setPreviewImages((prev) => {
               if (!prev) return null;
               const afterCancel = prev.filter((item) => item.id !== id);
               return afterCancel.length === 0 ? null : afterCancel;
          });
          setLoading(false);
          setIsFileUpload(false);
     }

     /**
      * upload images function here.
      */
     const isUploadingRef = useRef(false);

     useEffect(() => {
          let progressInterval: NodeJS.Timeout | null = null;
          setProgress(0);

          if (previewImageDetails?.file && !isUploadingRef.current) {
               isUploadingRef.current = true;

               const uploadImage = async (acceptedFile: File) => {
                    setIsFileUpload(true);
                    const formData = new FormData();
                    formData.append("product-images", acceptedFile);

                    // Start progress simulation
                    progressInterval = setInterval(() => {
                         setProgress((prev) => {
                              const newProgress = Math.min(prev + 1, 99);
                              return newProgress;
                         });
                    }, 30);

                    try {
                         const response = await imagesUploadCloudinary(
                              formData
                         );

                         // Clear interval and set final progress
                         if (progressInterval) clearInterval(progressInterval);
                         setProgress(100);

                         // Update preview images
                         setPreviewImages((prev) => {
                              if (!prev || !previewImageDetails) return prev;
                              return prev.map((item) =>
                                   item.id === previewImageDetails.id
                                        ? {
                                               ...item,
                                               file: null,
                                               url:
                                                    response.data?.secure_url ??
                                                    "",
                                               public_id:
                                                    response.data?.public_id ??
                                                    "",
                                          }
                                        : item
                              );
                         });
                    } catch (error) {
                         console.error("Upload failed:", error);
                    } finally {
                         // Cleanup
                         if (progressInterval) clearInterval(progressInterval);
                         isUploadingRef.current = false;
                         setIsFileUpload(false);
                    }
               };

               uploadImage(previewImageDetails.file).catch(console.error);
          }

          return () => {
               if (progressInterval) clearInterval(progressInterval);
          };
     }, [previewImageDetails, setPreviewImages, setIsFileUpload]);
     /**
      * upload images function here.
      */

     return (
          <>
               <motion.div
                    className="relative group transition-transform duration-200 hover:scale-105"
                    initial={{
                         opacity: 0,
                         scale: 0.8,
                    }}
                    animate={{
                         opacity: 1,
                         scale: 1,
                    }}
                    exit={{
                         opacity: 0,
                         scale: 0.5,
                         y: 50,
                         filter: "blur(8px)",
                    }}
                    layout
               >
                    <figure className="w-24 h-24 rounded-lg overflow-hidden shadow-md border border-neutral-200 transition-shadow duration-200 group-hover:shadow-lg group-hover:border-primary-400">
                         <Image
                              src={previewImageDetails.preview}
                              alt={previewImageDetails.fileName}
                              width={100}
                              height={100}
                              onLoad={() => {
                                   URL.revokeObjectURL(
                                        previewImageDetails.preview
                                   );
                              }}
                              className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-110"
                         />
                    </figure>
                    <button
                         type="button"
                         className="absolute top-1 right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                         onClick={() =>
                              previewImageDetails.public_id &&
                              handelCancelImage(
                                   previewImageDetails.id,
                                   previewImageDetails.public_id
                              )
                         }
                    >
                         <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-5 h-5 text-red-500 bg-white rounded-full p-1 shadow transition-colors duration-200 hover:bg-red-500 hover:text-white"
                         >
                              <path
                                   fillRule="evenodd"
                                   d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.53-10.47a.75.75 0 00-1.06-1.06L10 8.94 7.53 6.47a.75.75 0 10-1.06 1.06L8.94 10l-2.47 2.47a.75.75 0 101.06 1.06L10 11.06l2.47 2.47a.75.75 0 101.06-1.06L11.06 10l2.47-2.47z"
                                   clipRule="evenodd"
                              />
                         </svg>
                    </button>

                    {progress > 0 && progress < 100 && (
                         <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center backdrop-blur-sm cursor-wait">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                                   <div
                                        className="h-full bg-primary-500 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                   />
                              </div>
                              <p className="text-xs text-gray-700">
                                   {progress}%
                              </p>
                         </div>
                    )}

                    {loading && (
                         <div className="absolute top-0 left-0 w-full h-full backdrop-blur-sm cursor-wait">
                              <div className="flex flex-col items-center justify-center h-full w-full">
                                   <svg
                                        className="animate-spin h-6 w-6 text-gray-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                   >
                                        <circle
                                             className="opacity-25"
                                             cx="12"
                                             cy="12"
                                             r="10"
                                             stroke="currentColor"
                                             strokeWidth="4"
                                        />
                                        <path
                                             className="opacity-75"
                                             fill="currentColor"
                                             d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                   </svg>
                                   <span className="text-sm text-gray-600 mt-1">
                                        Canceling...
                                   </span>
                              </div>
                         </div>
                    )}
               </motion.div>
          </>
     );
}
