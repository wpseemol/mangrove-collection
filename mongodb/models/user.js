import { USER } from '@/constant-value';
import mongoose from 'mongoose';

const UsersSchema = new mongoose.Schema({
    fullName: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    phone: {
        type: String,
        require: true,
    },
    role: {
        type: String,
        require: true,
        default: USER,
    },
});

const User = mongoose.models.User ?? mongoose.model('User', UsersSchema);

export default User;
