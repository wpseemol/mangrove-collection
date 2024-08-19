import {
    ProductDetailsType,
    ProductDetailsWith_idType,
} from '@/types/products';

type ObjType = ProductDetailsWith_idType;

type ReturnType = ProductDetailsType;

export default function replaceMongoObjectId(obj: ObjType): ReturnType {
    const { _id, ...rest } = obj;

    const finalObj = {
        ...rest,
        id: _id.toString(),
    };

    return finalObj;
}
