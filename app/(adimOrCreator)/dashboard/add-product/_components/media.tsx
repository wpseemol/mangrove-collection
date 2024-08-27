'use client';

import { AddProductFormType } from '@/types/add-product';
import { useState } from 'react';
import Thumbnail from './media/thumbnail';

export default function Media({ form }: { form: AddProductFormType }) {
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    return (
        <>
            <div className="mb-4">
                <Thumbnail form={form} />
            </div>
            <div className="mb-4">{/* <Images form={form} /> */}</div>
        </>
    );
}
