import AlertMessage from './_components/alert-message';
import LoginSection from './_components/login-section';

export default function LoginPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    return (
        <main className="flex flex-col items-center justify-center sm:p-8 py-8 min-h-screen">
            {' '}
            {searchParams.code && <AlertMessage message={searchParams.code} />}
            <LoginSection />
        </main>
    );
}

interface SearchParams {
    code?: string;
    error?: string;
}
