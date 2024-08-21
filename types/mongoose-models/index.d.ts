import mongoose from 'mongoose';

//category model types
interface CategoryBase {
    name: string;
    slug: string;
    imgUrl: string;
    author: mongoose.Schema.Types.ObjectId;
    createdAt?: Date;
}

interface CategoryWithMongo_Id
    extends Omit<CategoryBase, 'author' | 'createdAt'> {
    _id: mongoose.Schema.Types.ObjectId;
}
export interface AllCategoryType extends Omit<CategoryWithMongo_Id, '_id'> {
    id: string;
}

interface CategoryWith_IdCount
    extends Omit<CategoryBase, 'imgUrl' | 'author' | 'createdAt'> {
    _id: mongoose.Schema.Types.ObjectId;
    productCount: number;
}
export interface CategoryWithCountType
    extends Omit<CategoryBase, 'imgUrl' | 'author' | 'createdAt'> {
    id: string;
    productCount: number;
}

type CategoryType = (CategoryWithCountType | AllCategoryType)[] | null;

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
    category: mongoose.Schema.Types.ObjectId | CategoryWithMongo_Id;
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

interface ProductWithMongo_Id
    extends Pick<
        ProductBase,
        | '_id'
        | 'images'
        | 'currency'
        | 'price'
        | 'thumbnail'
        | 'unit'
        | 'offer'
        | 'name'
        | 'slug'
        | 'category'
        | 'shortDescription'
    > {
    _id: mongoose.Schema.Types.ObjectId;
}
export interface ProductType extends Omit<ProductWithMongo_Id, '_id'> {
    id: string;
}

// replace mongodb id function types
type ReplaceMongoIdAccepted = (
    | ProductWithMongo_Id
    | CategoryWithMongo_Id
    | CategoryWith_IdCount
)[];

type ReplaceMongoIdReturn = (
    | ProductType
    | AllCategoryType
    | CategoryWithCountType
)[];
// replace mongodb id types

export type {
    AllCategoryType,
    CategoryBase,
    CategoryType,
    CategoryWithCountType,
    CategoryWithMongo_Id,
    CategoryWith_IdCount,
    ImageType,
    PriceType,
    ProductBase,
    ProductType,
    ProductWithMongo_Id,
    ReplaceMongoIdAccepted,
    ReplaceMongoIdReturn,
    VariantsType,
};
