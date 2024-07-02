import LoadingComponent from '../Components/LoadingComponent/LoadingComponent';

export default function RootLoading() {
    return (
        <main className="w-full h-[calc(100vh-22rem)]">
            <LoadingComponent type={'fullPage'} />
        </main>
    );
}
