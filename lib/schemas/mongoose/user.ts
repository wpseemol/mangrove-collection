import { UserBase } from '@/types/mongoose-models';
import mongoose from 'mongoose';

interface IUser extends UserBase, mongoose.Document {}

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        default: () => crypto.randomUUID(),
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        default: null,
    },
    phone: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        required: true,
        enum: ['user', 'creator', 'admin'], // Use enum for restricted values
        default: 'user',
    },
    registerAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export { User };
