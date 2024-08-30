import { auth } from '@/auth/auth';
import Btn from './_components/btn';

export default async function AccountPage() {
    const section = await auth();

    return (
        <main className="mx-auto container py-5">
            <h2 className="text-foreground font-medium text-xl">
                login use info :
            </h2>
            <pre>{JSON.stringify(section)}</pre>
            <Btn />
        </main>
    );
}
