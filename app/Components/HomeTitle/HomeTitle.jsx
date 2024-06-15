const HomeTitle = ({ children }) => {
    return (
        <>
            <h2 className="lg:text-4xl md:text-3xl sm:text-2xl text-xl font-bold text-center">
                {children}
            </h2>
        </>
    );
};

export default HomeTitle;
