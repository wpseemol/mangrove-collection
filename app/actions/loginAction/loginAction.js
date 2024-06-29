'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import User from '@/mongodb/models/user';
import userObjModify from '@/utils/userObjModify';
import { revalidatePath } from 'next/cache';

export default async function loginAction(loginObj) {
    await connectMongo();

    try {
        const loginUser = await User.findOne(loginObj).lean();

        const modUserObj = userObjModify(loginUser);

        revalidatePath('/');

        return modUserObj;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
