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
            <main className="flex flex-col items-center justify-between p-24">
                {/* .................... */}
                <h2>this is home page</h2>
                {/* .................... */}
            </main>
        </>
    );
}
