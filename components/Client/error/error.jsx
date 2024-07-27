export default function Error({ error, reset }) {
    return (
        <>
            <main className="container mx-auto">
                <section className="flex justify-center items-center h-[calc(100vh-25rem)] w-fit">
                    <div>
                        <div className="flex">
                            <div className=" pr-4 text-primary ">
                                <h2 className="text-5xl font-bold ">Oops</h2>
                            </div>
                            <div className="border-l pl-4">
                                <h2 className="py-2 text-5xl font-bold text-primary">
                                    Error Massage
                                </h2>
                                <p className="text-xl font-medium capitalize">
                                    {' '}
                                    {error?.message}
                                </p>

                                <div className="absolute mt-6">
                                    <button
                                        onClick={() => reset()}
                                        className="py-3 px-5 bg-[#eb4a36] hover:bg-[#eb4a60] 
                                        rounded-lg font-medium duration-200 text-xl 
                                        border border-[#eb4a60] text-white">
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
