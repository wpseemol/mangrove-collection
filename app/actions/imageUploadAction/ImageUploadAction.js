'use server';

// import { storage } from '@/firebase/firebase-config';
// import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export default async function imageUploadAction(fileData) {
    const file = fileData.getAll('imageFile');

    // fileData.forEach((element) => {
    //     const allFile = element.get('imageFile');
    //     console.log(allFile);
    // });

    console.log(file);

    // try {
    //     const imageRef = ref(storage, `/products/${file.name}`);

    //     await uploadBytes(imageRef, file);
    //     const imgUrl = await getDownloadURL(ref(storage, imageRef));
    //     return imgUrl;
    // } catch (error) {
    //     throw error;
    // }
}
