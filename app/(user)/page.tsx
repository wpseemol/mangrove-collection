import { ModeToggle } from '@/components/mode-toggle';

export const metadata = {
    title: 'Mangrove Collection | Home',
    description: 'Mangrove Collection home page.',
};

export default function Home() {
    return (
        <>
            <header className="bg-background border-b shadow p-5 ">
                <nav className="container mx-auto">
                    <ModeToggle />{' '}
                </nav>
            </header>
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <p>this is home page</p>
            </main>
        </>
    );
}
