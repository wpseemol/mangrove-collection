'use client';

import imageDeleteAction from '@/app/actions/imageDeleteAction/imageDeleteAction';

export default async function handelMultiImageToDeleted(
    deleteImgUrl,
    setImageUrl,
    router,
    imageRef,
    basketPathName,
    imageLength
) {
    const path = new URL(deleteImgUrl).pathname;
    // Remove query parameters (if any)
    const pathWithoutQuery = path.split('?')[0];
    // Split by percent-encoded slash to get the file name
    const fileName = decodeURIComponent(pathWithoutQuery).split('%2F').pop();
    const fileArray = fileName.split('/');
    const imageName = fileArray[fileArray.length - 1];

    const isDeleted = await imageDeleteAction(basketPathName, imageName);
    if ('deleted' === isDeleted) {
        setImageUrl((pre) => {
            const afterRemove = pre?.filter((img) => img !== deleteImgUrl);
            if (afterRemove.length < 1) {
                imageRef.current.value = null;
            }
            return afterRemove;
        });

        router.refresh();
    }
}
