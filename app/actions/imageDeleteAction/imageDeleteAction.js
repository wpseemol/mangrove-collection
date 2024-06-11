'use server';

import { storage } from '@/firebase/firebase-config';
import { deleteObject, ref } from 'firebase/storage';

export default async function imageDeleteAction(path, fileName) {
    try {
        const imageRef = ref(storage, `/${path}/${fileName}`);
        const isDeleted = await deleteObject(imageRef);

        return 'deleted';
    } catch (error) {
        throw error;
    }
}
