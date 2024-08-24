import mongoose from 'mongoose';

// Category model types

/**
 * The `CategoryBase` interface defines the base structure for a category.
 * - `name`: The name of the category.
 * - `slug`: A URL-friendly identifier for the category.
 * - `imgUrl`: The URL of the category's image.
 * - `author`: MongoDB ObjectId of the author who created the category.
 * - `createdAt`: Optional timestamp indicating when the category was created.
 */
export interface CategoryBase {
    name: string; // The name of the category.
    slug: string; // URL-friendly identifier for the category.
    imgUrl: string; // URL of the category image.
    author: mongoose.Schema.Types.ObjectId; // MongoDB ObjectId of the author.
    createdAt?: Date; // Optional creation date.
}

/**
 * The `CategoryWithMongo_Id` interface extends `CategoryBase` by replacing `author` and `createdAt`
 * with a MongoDB `_id` field.
 * - `_id`: MongoDB ObjectId for the category.
 */
export interface CategoryWithMongo_Id
    extends Omit<CategoryBase, 'author' | 'createdAt'> {
    _id: mongoose.Schema.Types.ObjectId; // Unique identifier for the category in MongoDB.
}

/**
 * The `AllCategoryType` interface represents a category with a string `id` instead of MongoDB's `_id`.
 * - `id`: String identifier for the category.
 */
export interface AllCategoryType extends Omit<CategoryWithMongo_Id, '_id'> {
    id: string; // String identifier for the category.
}

/**
 * The `CategoryWith_IdCount` interface extends `CategoryBase`, omitting `imgUrl`, `author`, and
 * `createdAt`, and adding `productCount` to represent the number of products in the category.
 * - `_id`: MongoDB ObjectId for the category.
 * - `productCount`: The count of products within the category.
 */
export interface CategoryWith_IdCount
    extends Omit<CategoryBase, 'imgUrl' | 'author' | 'createdAt'> {
    _id: mongoose.Schema.Types.ObjectId; // MongoDB ObjectId for the category.
    productCount: number; // Number of products in the category.
}

/**
 * The `CategoryWithCountType` interface represents a category with a string `id` and includes a
 * `productCount` instead of `imgUrl`, `author`, and `createdAt`.
 * - `id`: String identifier for the category.
 * - `productCount`: The count of products in the category.
 */
export interface CategoryWithCountType
    extends Omit<CategoryBase, 'imgUrl' | 'author' | 'createdAt'> {
    id: string; // String identifier for the category.
    productCount: number; // Number of products in the category.
}

/**
 * The `CategoryType` type represents an array of categories, which can include either
 * `CategoryWithCountType` or `AllCategoryType` objects, or be `null`.
 */
export type CategoryType = (CategoryWithCountType | AllCategoryType)[] | null;

// Product model types

/**
 * The `PriceType` interface defines the structure for product pricing.
 * - `variantId`: The identifier for the specific variant.
 * - `price`: The price of the variant.
 * - `select`: Boolean indicating if this variant is selected.
 */
export interface PriceType {
    variantId: string; // Identifier for the variant.
    price: number; // Price for the variant.
    select: boolean; // Indicates if the variant is selected.
}

/**
 * The `ImageType` interface represents an image associated with a product.
 * - `id`: The unique identifier for the image.
 * - `imgUrl`: The URL of the image.
 */
export interface ImageType {
    id: string; // Identifier for the image.
    imgUrl: string; // URL of the image.
}

/**
 * The `VariantsType` interface represents a variant of a product.
 * - `id`: The unique identifier for the variant.
 * - `type`: The type of the variant (e.g., color, size).
 * - `title`: The title or name of the variant.
 */
export interface VariantsType {
    id: string; // Identifier for the variant.
    type: string; // Type of the variant.
    title: string; // Title of the variant.
}

/**
 * The `ProductBase` interface defines the base structure for a product.
 * - `name`: The name of the product.
 * - `category`: The category the product belongs to, which can be a MongoDB ObjectId or a `CategoryWithMongo_Id` object.
 * - `slug`: A URL-friendly identifier for the product.
 * - `unit`: The unit of measure for the product.
 * - `size`: Optional size of the product.
 * - `price`: Array of pricing information for different variants.
 * - `currency`: Currency used for pricing.
 * - `offer`: Optional discount or special offer on the product.
 * - `shortDescription`: Optional short description of the product.
 * - `thumbnail`: URL of the product's thumbnail image.
 * - `description`: Detailed description of the product.
 * - `images`: Optional array of images associated with the product.
 * - `variants`: Optional array of variants for the product.
 * - `author`: MongoDB ObjectId of the author.
 * - `createdAt`: Optional timestamp for when the product was created.
 * - `rating`: Optional MongoDB ObjectId referencing the product's rating.
 * - `comment`: Optional MongoDB ObjectId referencing comments on the product.
 * - `popularity`: Optional popularity score of the product.
 * - `tags`: Optional array of tags associated with the product.
 */
export interface ProductBase {
    name: string; // Name of the product.
    category: mongoose.Schema.Types.ObjectId | CategoryWithMongo_Id; // Category ObjectId or Category object.
    slug: string; // URL-friendly identifier for the product.
    unit: string; // Unit of measurement for the product.
    size?: string; // Optional size of the product.
    price: PriceType[]; // Array of pricing information for variants.
    currency: string; // Currency used for pricing.
    offer?: number; // Optional discount or special offer.
    shortDescription?: string; // Optional short description of the product.
    thumbnail: string; // URL of the product's thumbnail image.
    description: string; // Detailed description of the product.
    images?: ImageType[]; // Optional array of product images.
    variants?: VariantsType[]; // Optional array of product variants.
    author: mongoose.Schema.Types.ObjectId; // MongoDB ObjectId of the author.
    createdAt?: Date; // Optional creation date.
    rating?: mongoose.Schema.Types.ObjectId; // Optional MongoDB ObjectId for product rating.
    comment?: mongoose.Schema.Types.ObjectId; // Optional MongoDB ObjectId for product comments.
    popularity?: number; // Optional popularity score of the product.
    tags?: string[]; // Optional array of tags associated with the product.
}

/**
 * The `ProductWithMongo_Id` interface extends `ProductBase`, including only specific fields
 * and adding a MongoDB `_id`.
 * - `_id`: MongoDB ObjectId for the product.
 */
export interface ProductWithMongo_Id
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
    _id: mongoose.Schema.Types.ObjectId; // MongoDB ObjectId for the product.
}

/**
 * The `ProductType` interface represents a product with a string `id` instead of MongoDB's `_id`.
 * - `id`: String identifier for the product.
 */
export interface ProductType extends Omit<ProductWithMongo_Id, '_id'> {
    id: string; // String identifier for the product.
}

// Replace MongoDB ID function types

/**
 * The `ReplaceMongoIdAccepted` type represents an array of objects that can be of type
 * `ProductWithMongo_Id`, `CategoryWithMongo_Id`, or `CategoryWith_IdCount`.
 */
export type ReplaceMongoIdAccepted = (
    | ProductWithMongo_Id
    | CategoryWithMongo_Id
    | CategoryWith_IdCount
)[];

/**
 * The `ReplaceMongoIdReturn` type represents an array of objects that can be of type
 * `ProductType`, `AllCategoryType`, or `CategoryWithCountType`.
 */
type ReplaceMongoIdReturn = (
    | ProductType
    | AllCategoryType
    | CategoryWithCountType
)[];

/**
 *  Define the possible roles a user can have
 */
export type RoleType = 'user' | 'creator' | 'admin';

/**
 * The `UserBase` interface defines the base structure for a user.
 * - `username`: Unique identifier for the user.
 * - `fullName`: Full name of the user, which can be `null` if not provided.
 * - `email`:  Email address of the user, which can be `null` if not provided.
 * - `image`:  URL or path to the user's profile image, which can be `null` if not provided.
 * - `phone`: Phone number of the user.
 * - `role`: Specifies the role of the user within the system. Must be one of 'user', 'creator', or 'admin'.
 * - `registerAt`: user register time here
 */
export interface UserBase {
    username: string;
    fullName: string | null;
    email: string;
    image: string | null;
    phone: string;
    /**
     * Role of the user within the system, constrained to 'user', 'creator', or 'admin'
     */
    role: RoleType;
    /**
     * User register time here.
     */
    registerAt: Date;
}
