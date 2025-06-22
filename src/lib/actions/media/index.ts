"use server";

import cloudinary from "@/cloudinary";
import { extractPublicIdFromUrl } from "@/utils/publick-id-from-url";
import { Readable } from "stream";

export async function thumbnailUpload(formData: FormData) {
     try {
          const file = formData.get("product-images") as File | null;

          if (!file) {
               return {
                    success: false,
                    message: "one picture file is required.",
               };
          }

          // Prepare filename (remove extension)
          const originalFilename = file.name.replace(/\.[^/.]+$/, "");

          // Convert file to Buffer for streaming
          const buffer = Buffer.from(await file.arrayBuffer());

          // upload to cloudinary using streams.
          // 5. Upload to Cloudinary using streams
          const result = await new Promise((resolve, reject) => {
               // Create upload stream with Cloudinary options
               const uploadStream = cloudinary.uploader.upload_stream(
                    {
                         folder: "product-images", // Target folder in Cloudinary
                         public_id: `product_images_${Date.now()}_${originalFilename}`, // Unique filename
                         resource_type: "auto", // Auto-detect file type
                         quality_analysis: true,
                    },
                    (error, result) => {
                         if (error) {
                              console.error("Cloudinary upload error:", error);
                              reject(error);
                         } else {
                              resolve({
                                   ...result,
                                   originalFilename: file.name, // Include original filename
                              });
                         }
                    }
               );

               // Pipe the file buffer to Cloudinary
               Readable.from(buffer).pipe(uploadStream);
          });

          return {
               success: true,
               message: "Thumbnail uploaded successfully.",
               data: result,
          };
     } catch (error) {
          console.log("thumbnail upload error:", error);
          return {
               success: false,
               message: "Something went wrong.",
          };
     }
}

/**
 * Deletes an uploaded image from Cloudinary using either its `public_id` or its URL.
 *
 * @param props - The parameters for deleting the image.
 * @param props.public_id - (Optional) The Cloudinary public ID of the image to delete.
 * @param props.url - (Optional) The URL of the image to delete. If `public_id` is not provided, the function will attempt to extract the public ID from this URL.
 * @returns An object indicating whether the deletion was successful and a message describing the result.
 */
export async function deleteUploadedImage({
     public_id,
     url,
}: {
     public_id?: string | null;
     url?: string | null;
}) {
     try {
          let targetPublicId: string | null = null;

          if (public_id) {
               targetPublicId = public_id;
          } else if (url) {
               const publicId = extractPublicIdFromUrl(url);
               if (!publicId)
                    return {
                         success: false,
                         message: "url to pubic id con't convert",
                    };

               targetPublicId = publicId;
          }
          // Case 3: Neither public_id nor URL provided → Error
          else {
               return {
                    success: false,
                    message: "Either public_id or URL is required.",
               };
          }

          // Delete from Cloudinary
          const result = await cloudinary.uploader.destroy(targetPublicId);

          return {
               success: result.result === "ok",
               message:
                    result.result === "ok"
                         ? "Image deleted successfully."
                         : "Failed to delete (invalid public_id or permissions).",
          };
     } catch (error) {
          console.error("Cloudinary delete error:", error);
          return {
               success: false,
               message: "Server error during deletion.",
          };
     }
}
