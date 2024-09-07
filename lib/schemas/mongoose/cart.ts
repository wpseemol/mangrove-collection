import { CartBase } from '@/types/mongoose-models/cart';
import mongoose from 'mongoose';

interface ICart extends CartBase, mongoose.Document {}

const cartSchema = new mongoose.Schema<ICart>({
    userId: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    cartAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', cartSchema);

export { Cart };
