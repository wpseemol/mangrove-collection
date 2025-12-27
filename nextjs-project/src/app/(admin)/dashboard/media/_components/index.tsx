// components/ImageData.tsx
'use client';

import ImageGallery from "./Image-gallery";



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

interface ImageDataComponentProps {
  imageData: ImageDataProps[];
  onDeleteImage?: (publicId: string) => Promise<void> | void;
}

export default function ImageData({ 
  imageData, 
  onDeleteImage 
}: ImageDataComponentProps) {
  return (
    <ImageGallery 
      images={imageData} 
      onDeleteImage={onDeleteImage} 
    />
  );
}