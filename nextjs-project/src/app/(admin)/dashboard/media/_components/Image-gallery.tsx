"use client";
// components/ImageGallery.tsx
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Grid, List, SortAsc, SortDesc, Trash2 } from "lucide-react";
import { useState } from "react";
import ImageCard from "./image-card";
import Image from "next/image";

interface ImageDataProps {
  public_id: string;
  secure_url: string;
  created_at: string;
  bytes: number;
  format: string;
  width: number;
  height: number;
  originalFilename?: string | undefined;
}

interface ImageGalleryProps {
  images: ImageDataProps[];
  onDeleteImage?: (publicId: string) => Promise<void> | void;
}

type ViewMode = "grid" | "list";
type SortBy = "date" | "name" | "size";

export default function ImageGallery({
  images,
  onDeleteImage,
}: ImageGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [allImages, setAllImages] = useState(images);

  // Handle image load
  const handleImageLoad = (publicId: string) => {
    setLoadedImages((prev) => new Set(prev).add(publicId));
  };

  const deleteImageFromState = (publicId: string) => {
    setAllImages((prevImages) =>
      prevImages.filter((img) => img.public_id !== publicId)
    );
  };

  // Sort images
  const sortedImages = [...allImages].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case "name":
        const nameA = a.originalFilename || a.public_id;
        const nameB = b.originalFilename || b.public_id;
        comparison = nameA.localeCompare(nameB);
        break;
      case "size":
        comparison = a.bytes - b.bytes;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const emptyStateVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Image Gallery
              </h1>
              <p className="text-gray-600 mt-2">
                {allImages.length} image{allImages.length !== 1 ? "s" : ""} in
                your collection
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="size">Size</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={
                    sortOrder === "asc" ? "Sort descending" : "Sort ascending"
                  }
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Gallery Content */}

        {sortedImages.length === 0 ? (
          <motion.div
            variants={emptyStateVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <ImageIcon className="w-24 h-24 text-gray-300" />
              <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-blue-50 to-transparent blur-xl opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mt-6 mb-2">
              No images yet
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Your gallery is empty. Upload some images to get started!
            </p>
          </motion.div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {sortedImages.map((image) => (
                    <ImageCard
                      key={image.public_id}
                      image={image}
                      onDelete={onDeleteImage}
                      deleteImageFromState={deleteImageFromState}
                      onLoad={handleImageLoad}
                      isLoaded={loadedImages.has(image.public_id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* List View */
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {sortedImages.map((image) => (
                    <motion.div
                      key={image.public_id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
                          <Image
                            src={image.secure_url}
                            alt={image.originalFilename || image.public_id}
                            fill
                            sizes="80px"
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {image.originalFilename ||
                              image.public_id.split("/").pop()}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span>
                              {image.width} × {image.height}
                            </span>
                            <span>{(image.bytes / 1024).toFixed(1)} KB</span>
                            <span>
                              {new Date(image.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDeleteImage?.(image.public_id)}
                          className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete Image"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Footer Info */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 pt-6 border-t border-gray-200"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Click on any image to view details
                </p>
                <p className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Deleted images cannot be recovered
                </p>
              </div>
            </motion.footer>
          </>
        )}
      </div>
    </div>
  );
}
