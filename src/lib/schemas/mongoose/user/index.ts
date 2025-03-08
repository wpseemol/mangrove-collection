import { UserSchemaType } from '@/types/mongoose/user';
import mongoose from 'mongoose';

interface IUser extends UserSchemaType, mongoose.Document {}

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
    password: {
        type: String,
        required: true,
        default: null,
    },
    image: {
        type: String,
        default: null,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        default: null,
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
