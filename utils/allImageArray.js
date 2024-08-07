export default function allImageArray(thumbnail, images = []) {
    if (!thumbnail) {
        return [];
    }

    if (!images) {
        return [];
    }

    const allImage = [
        ...images,
        { id: crypto.randomUUID(), firebaseUrl: thumbnail },
    ].map((element) => ({
        ...element,
        imgUrl: element?.firebaseUrl,
    }));

    return allImage;
}
