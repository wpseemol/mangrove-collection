import mongoose from 'mongoose';

interface CategoryBase {
    name: string;
    slug: string;
    imgUrl: string;
    author: mongoose.Schema.Types.ObjectId;
    createdAt?: Date;
}

export type { CategoryBase };
