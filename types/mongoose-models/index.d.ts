import mongoose from 'mongoose';

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
export interface CategoryType extends Omit<CategoryWithMongo_Id, '_id'> {
    id: string;
}

export type { CategoryBase, CategoryType, CategoryWithMongo_Id };
