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
    phoneNumber: {
        type: String,
        require: true,
    },
    userType: {
        type: String,
        require: true,
    },
});

const User = mongoose.models.users ?? mongoose.model('users', UsersSchema);

export default User;
