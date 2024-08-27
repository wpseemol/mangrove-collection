'use client';

import { AddProductFormType } from '@/types/add-product';
import Images from './media/images';
import Thumbnail from './media/thumbnail';

export default function Media({ form }: { form: AddProductFormType }) {
    return (
        <>
            <div className="mb-4">
                <Thumbnail form={form} />
            </div>
            <div className="mb-4">
                <Images form={form} />
            </div>
        </>
    );
}
