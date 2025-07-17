/**
 * Extracts the Cloudinary public_id from a URL.
 * Handles versioned URLs, folders, and URI-encoded characters.
 *
 * @param url - Cloudinary image URL (e.g., "https://res.cloudinary.com/demo/image/upload/v1234567/folder/file.jpg")
 * @returns public_id (e.g., "folder/file") or null if invalid URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
     if (!url.includes("cloudinary.com")) return null;

     try {
          // Split URL after "/upload/"
          const uploadPart = url.split("/upload/")[1];
          if (!uploadPart) return null;

          // Remove version prefix (e.g., "v1234567/") and file extension
          const segments = uploadPart.split("/").slice(1); // ["folder", "file.jpg"]
          if (segments.length === 0) return null;

          // Join segments and decode URI components (handles %20, etc.)
          const decodedPath = decodeURIComponent(segments.join("/"));

          // Remove file extension (e.g., ".jpg")
          return decodedPath.replace(/\.[^/.]+$/, "");
     } catch (error) {
          console.error("Error parsing Cloudinary URL:", error);
          return null;
     }
}
