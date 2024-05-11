const HomeTitle = ({ children }) => {
    return (
        <>
            <div>
                <h2 className="lg:text-4xl md:text-3xl sm:text-2xl text-xl font-bold text-center">
                    {children}
                </h2>
            </div>
        </>
    );
};

export default HomeTitle;
