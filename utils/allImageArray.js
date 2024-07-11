export default function allImageArray(thumbnail, images = []) {
    if (!thumbnail) {
        return [];
    }

    if (!images) {
        return [];
    }

    const allImage = [...images, thumbnail].map((element) => ({
        id: crypto.randomUUID(),
        imgUrl: element,
    }));

    return allImage;
}
