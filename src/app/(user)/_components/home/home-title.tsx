const HomeTitle = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <h2 className=" md:text-3xl sm:text-2xl text-xl font-medium text-center">
                {children}
            </h2>
        </>
    );
};

export default HomeTitle;
