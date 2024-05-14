import DashboardClientSite from '@/app/Components/Client/DashboardClientSite/DashboardClientSite';
import afterLogin from '@/app/actions/afterLogin/afterLogin';
import userType from '@/utils/userType';

export default async function DashboardPage() {
    const loginUser = await afterLogin();

    const { type } = userType(loginUser);

    let userTypeCake;
    if (type === 'admin') {
        userTypeCake = 'Admin';
    } else if (type === 'admin') {
        userTypeCake = 'Content Creator';
    }
    return (
        <main>
            <DashboardClientSite>
                <div>
                    <p className="text-center">
                        login user type {userTypeCake}{' '}
                    </p>
                </div>
            </DashboardClientSite>
        </main>
    );
}
