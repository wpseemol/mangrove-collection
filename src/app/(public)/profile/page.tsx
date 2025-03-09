import { auth } from '@/auth';
import LogoutButton from './_components/logout-button';

export default async function ProfilePage() {
    const session = await auth();
    return (
        <main className="container mx-auto">
            <div className="text-center mt-6">{JSON.stringify(session)}</div>
            <LogoutButton />
        </main>
    );
}
