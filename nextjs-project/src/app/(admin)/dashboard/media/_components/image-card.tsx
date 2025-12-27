// components/ImageCard.tsx
import Image from "next/image";
import { motion } from "framer-motion";
import { Trash2, X, Check, Loader2, Info } from "lucide-react";
import { useState } from "react";
import { deleteUploadedImage } from "@/lib/actions/media";


interface ImageCardProps {
  image: {
    public_id: string;
    secure_url: string;
    created_at: string;
    bytes: number;
    format: string;
    width: number;
    height: number;
    originalFilename?: string | undefined;
  };
  onDelete?: (publicId: string) => Promise<void> | void;
  onLoad?: (publicId: string) => void;
  isLoaded?: boolean;
  deleteImageFromState: (publicId: string) => void;
}

export default function ImageCard({ image, onDelete, onLoad, isLoaded, deleteImageFromState }: ImageCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmation(true);
  };


  

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
        await deleteUploadedImage({ public_id: image.public_id });
      await onDelete?.(image.public_id);
        deleteImageFromState(image.public_id);
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmation(false);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilename = () => {
    return image.originalFilename || image.public_id.split('/').pop() || 'image';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100 cursor-pointer"
      onClick={() => setShowInfo(!showInfo)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Loading Skeleton */}
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </motion.div>
        )}
        
        {/* Image */}
        <Image
          src={image.secure_url}
          alt={getFilename()}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${showInfo ? 'brightness-50' : ''}`}
          loading="lazy"
          quality={75}
          onLoad={() => onLoad?.(image.public_id)}
        />

        {/* Top Actions Bar */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10">
          {/* Image Info Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm"
          >
            <span className="text-xs font-medium text-gray-700 uppercase">
              {image.format}
            </span>
          </motion.div>

          {/* Delete Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}

            
          >
            {showConfirmation ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 bg-white rounded-full shadow-lg p-1"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                  title="Confirm Delete"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDeleteClick}
                className="p-3 bg-white/90 backdrop-blur-sm text-red-500 rounded-full shadow-lg hover:bg-white hover:text-red-600 transition-all group/delete"
                title="Delete Image"
              >
                <Trash2 className="w-5 h-5" />
                <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover/delete:opacity-100 transition-opacity whitespace-nowrap">
                  Delete Image
                </span>
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Bottom Info Overlay */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: showInfo ? 0 : 100 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 text-white backdrop-blur-sm"
        >
          <div className="space-y-2">
            <h3 className="font-semibold truncate">{getFilename()}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-300">Size</p>
                <p className="font-medium">{formatBytes(image.bytes)}</p>
              </div>
              <div>
                <p className="text-gray-300">Dimensions</p>
                <p className="font-medium">{image.width} × {image.height}</p>
              </div>
              <div>
                <p className="text-gray-300">Format</p>
                <p className="font-medium uppercase">{image.format}</p>
              </div>
              <div>
                <p className="text-gray-300">Uploaded</p>
                <p className="font-medium">{formatDate(image.created_at)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Info Bar (Visible when not expanded) */}
        {!showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="truncate pr-2">
                <p className="text-sm font-medium truncate">{getFilename()}</p>
                <p className="text-xs opacity-80">{formatBytes(image.bytes)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(true);
                }}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                title="Show Details"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}