export default function userType(userObj) {
    if (userObj) {
        if (userObj?.fullName && userObj?.email && userObj?.userType) {
            return { status: true, type: userObj?.userType };
        } else {
            return null;
        }
    } else {
        return null;
    }
}
