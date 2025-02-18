import { Types } from 'mongoose';

interface Price {
    variantId: string;
    price: number;
    select: boolean;
}

interface Image {
    id: string;
    imgUrl: string;
}

interface Variant {
    id: string;
    type: string;
    title: string;
}

export interface ProductType {
    name: string;
    category: Types.ObjectId;
    slug: string;
    unit: string;
    size?: string;
    price: Price[];
    currency: string;
    offer?: number;
    shortDescription?: string;
    thumbnail: string;
    description: string;
    images: Image[];
    variants: Variant[];
    author: Types.ObjectId;
    createdAt?: Date;
    rating?: Types.ObjectId;
    comment?: Types.ObjectId;
    popularity?: number;
    tags?: string[];
}
