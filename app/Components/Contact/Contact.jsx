import HomeTitle from '../HomeTitle/HomeTitle';

const Contact = () => {
    return (
        <section id="contact">
            <div
                className="bg-fixed  overflow-auto bg-no-repeat text-white "
                style={{
                    backgroundImage: `url(https://i.ibb.co/nkk3Qg1/contact-bg.jpg)`,
                }}>
                <div className="container mx-auto py-16">
                    <div className="mx-auto">
                        <HomeTitle>
                            <samp className="uppercase">Contact Us</samp>
                        </HomeTitle>

                        <p className="text-lg font-semibold text-center my-4">
                            If you have any{' '}
                            <span className="text-primaryColor">Question</span>{' '}
                            you can contact with us.
                        </p>
                    </div>
                    <div className="w-fit mx-auto text-xl">
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <div className="w-full px-2 md:px-0">
                                <label htmlFor="fName">First Name *</label>{' '}
                                <br />
                                <input
                                    className="text-[#666697] px-3 py-2 w-full"
                                    type="text"
                                    name="fName"
                                    id="fName"
                                />{' '}
                            </div>
                            <div className="w-full px-2 md:px-0">
                                <label htmlFor="lName">Last Name *</label>{' '}
                                <br />
                                <input
                                    className="text-[#666697] px-3 py-2 w-full"
                                    type="text"
                                    name="lName"
                                    id="lName"
                                />{' '}
                            </div>
                            <div className="w-full px-2 md:px-0">
                                <label htmlFor="email">Email *</label> <br />
                                <input
                                    className="text-[#666697] px-3 py-2 w-full"
                                    type="text"
                                    name="email"
                                    id="email"
                                />{' '}
                            </div>
                        </div>
                        <br />

                        <div className="flex flex-col sm:flex-row items-center gap-3 px-2 md:px-0">
                            <div className="sm:w-1/2">
                                <label htmlFor="pdCod">Product Code *</label>{' '}
                                <br />
                                <input
                                    className="text-[#666697] px-3 py-2 w-full"
                                    type="text"
                                    name="pdCod"
                                    id="pdCod"
                                    placeholder="Select a Product Code"
                                />{' '}
                            </div>

                            <div className="sm:w-1/2">
                                <label htmlFor="massage">Your Massage *</label>{' '}
                                <br />
                                <input
                                    className="text-[#666697] px-3 py-2 w-full"
                                    type="text"
                                    name="massage"
                                    id="massage"
                                    placeholder="Type your Massages here."
                                />{' '}
                            </div>
                        </div>
                        <div className="w-fit md:ml-auto md:mx-0 mx-auto mt-4 px-2 md:px-0">
                            <button className="seconderBtn px-4 py-2 bg-primaryColor text-white hover:bg-primaryColor/70">
                                {' '}
                                Send Massage
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
