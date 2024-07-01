export default function replaceMongodbIdFromObject(mongoObj) {
    if (!mongoObj) {
        return null;
    }

    const { _id, ...rest } = mongoObj;

    const finalObj = {
        ...rest,
        id: _id?.toString(),
    };

    return finalObj;
}
