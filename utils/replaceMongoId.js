export default function replaceMongoId(arr) {
    const modify = arr
        ?.map((obj) => {
            return { id: obj._id.toString(), ...obj };
        })
        .map(({ _id, ...rest }) => rest);

    return modify;
}
