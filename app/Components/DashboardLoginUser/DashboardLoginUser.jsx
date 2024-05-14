import afterLogin from '@/app/actions/afterLogin/afterLogin';
import userType from '@/utils/userType';

export default async function DashboardLoginUser() {
    const loginUser = await afterLogin();

    const { type } = userType(loginUser);
    let userTypeCake;
    if (type === 'admin') {
        userTypeCake = 'Admin';
    } else if (type === 'admin') {
        userTypeCake = 'Content Creator';
    }

    return (
        <section>
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 border bg-primaryColor/30
                 rounded-full flex items-center justify-center">
                    <span className="text-xl">{loginUser?.fullName[0]}</span>
                </div>
                <div>
                    <h2 className="text-sm">{loginUser?.fullName}</h2>
                    <p className="text-xs">{userTypeCake}</p>
                </div>
            </div>
        </section>
    );
}
