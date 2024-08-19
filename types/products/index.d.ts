import mongoose from 'mongoose';
import { ProductBase } from '../mongoose-models';

interface FilterSearchParamType {
    category?: string;
    price?: string;
    size?: string;
}

interface PriceObjType {
    minPrice: number | null;
    maxPrice: number | null;
}

interface ProductDetailsWith_idType extends ProductBase {
    _id: mongoose.Schema.Types.ObjectId;
}
interface ProductDetailsType extends ProductBase {
    id: string;
}

export type {
    FilterSearchParamType,
    PriceObjType,
    ProductDetailsType,
    ProductDetailsWith_idType,
};
