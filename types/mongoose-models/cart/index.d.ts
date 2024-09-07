import mongoose from 'mongoose';

export interface CartBase {
    userId: mongoose.Schema.Types.ObjectId;
    productId: mongoose.Schema.Types.ObjectId;
    cartAt: Date;
}
