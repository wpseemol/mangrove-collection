'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import User from '@/mongodb/models/user';
import userObjModify from '@/utils/userObjModify';

export default async function loginAction(loginObj) {
    await connectMongo();

    try {
        const loginUser = await User.findOne(loginObj).lean();

        const modUserObj = userObjModify(loginUser);
        return modUserObj;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
