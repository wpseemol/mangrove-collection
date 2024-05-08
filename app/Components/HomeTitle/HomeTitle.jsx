const HomeTitle = ({ children }) => {
    return (
        <>
            <div>
                <h2 className="md:text-4xl text-3xl font-bold text-center">
                    {children}
                </h2>
            </div>
        </>
    );
};

export default HomeTitle;
