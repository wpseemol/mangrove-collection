import LoadingComponent from '@/app/Components/LoadingComponent/LoadingComponent';

export default function RootLoading() {
    return (
        <main className="bg-loadingBgColor">
            <LoadingComponent type="full-screen" />
        </main>
    );
}
