import afterLogin from '@/app/actions/afterLogin/afterLogin';

export default async function DashboardPage() {
    const loginUser = await afterLogin();

    const type = userType(loginUser);

    let userType;
    if (type === 'admin') {
        userType = 'Admin';
    } else if (type === 'admin') {
        userType = 'Content Creator';
    }
    return (
        <main>
            <div>
                <p>login user type {userType} </p>
                <p> dashboard</p>
            </div>
        </main>
    );
}
