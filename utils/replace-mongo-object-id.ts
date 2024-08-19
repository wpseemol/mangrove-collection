import {
    ProductDetailsType,
    ProductDetailsWith_idType,
} from '@/types/products';

type ObjType = ProductDetailsWith_idType;

type ReturnType = ProductDetailsType;

export default function replaceMongoObjectId(obj: ObjType): ReturnType {
    const finalObj = {
        id: obj._id.toString(),
        ...obj,
    };
    const { _id, ...rest } = finalObj;

    return rest;
}
