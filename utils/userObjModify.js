export default function userObjModify(userObj) {
    if (userObj) {
        const { password, _id, ...newObj } = userObj;

        return {
            ...newObj,
            id: userObj?._id?.toString(),
        };
    }
}
