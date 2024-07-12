import imageDeleteAction from '@/app/actions/imageDeleteAction/imageDeleteAction';

export default async function handelDeleteImage(
    imageUrl,
    setImageUrl,
    imageRef,
    router,
    basketPathName
) {
    const path = new URL(imageUrl).pathname;
    // Remove query parameters (if any)
    const pathWithoutQuery = path.split('?')[0];
    // Split by percent-encoded slash to get the file name
    const fileName = decodeURIComponent(pathWithoutQuery).split('%2F').pop();
    const fileArray = fileName.split('/');
    const imageName = fileArray[fileArray.length - 1];

    const isDeleted = await imageDeleteAction(basketPathName, imageName);
    if ('deleted' === isDeleted) {
        setImageUrl('');
        imageRef.current.value = '';
        router.refresh();
    }
}
