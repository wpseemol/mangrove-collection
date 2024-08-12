import mongoose from 'mongoose';

//category model types
interface CategoryBase {
    name: string;
    slug: string;
    imgUrl: string;
    author: mongoose.Schema.Types.ObjectId;
    createdAt?: Date;
}

interface CategoryWithMongo_Id extends CategoryBase {
    _id: mongoose.Schema.Types.ObjectId;
}
export interface CategoryType extends CategoryBase {
    id: string;
}
//category model types

// product model type

interface PriceType {
    variantId: string;
    price: number;
    select: boolean;
}
interface ImageType {
    id: string;
    imgUrl: string;
}
interface VariantsType {
    id: string;
    type: string;
    title: string;
}

interface ProductBase {
    name: string;
    category: mongoose.Schema.Types.ObjectId;
    slug: string;
    unit: string;
    size?: string;
    price: PriceType[];
    currency: string;
    offer?: number;
    shortDescription?: string;
    thumbnail: string;
    description: string;
    images?: ImageType[];
    variants?: VariantsType[];
    author: mongoose.Schema.Types.ObjectId;
    createdAt?: Date;
    rating?: mongoose.Schema.Types.ObjectId;
    comment?: mongoose.Schema.Types.ObjectId;
    popularity?: number;
    tags?: string[];
}

interface ProductWithMongo_Id extends ProductBase {
    _id: mongoose.Schema.Types.ObjectId;
}
export interface ProductType extends ProductBase {
    id: string;
}

export type {
    CategoryBase,
    CategoryType,
    CategoryWithMongo_Id,
    ProductBase,
    ProductType,
    ProductWithMongo_Id,
};
