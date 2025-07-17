import { Button } from '@/components/ui/button';
import HomeTitle from './home-title';

export default function Contact() {
    return (
        <section className="md:pb-10 pb-5" id="contact">
            <div
                className="bg-fixed overflow-auto bg-no-repeat text-white bg-green-400"
                style={{
                    backgroundImage: `url(/assets/contact-bg.jpg)`,
                }}>
                <div className="container mx-auto md:py-10 py-8">
                    <div className="mx-auto mb-5">
                        <HomeTitle>
                            <samp className="uppercase">Contact Us</samp>
                        </HomeTitle>

                        <p className="text-neutral-200 text-center">
                            If you have any{' '}
                            <span className="text-primary-foreground">
                                Question
                            </span>{' '}
                            you can contact with us.
                        </p>
                    </div>
                    <div className="w-fit mx-auto md:text-base text-base">
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <div className="w-full px-2 md:px-0">
                                <label htmlFor="fName">First Name *</label>{' '}
                                <br />
                                <input
                                    className="text-white bg-green-950 rounded px-3 py-2 w-full"
                                    type="text"
                                    name="fName"
                                    id="fName"
                                    required
                                />{' '}
                            </div>
                            <div className="w-full px-2 md:px-0">
                                <label htmlFor="lName">Last Name *</label>{' '}
                                <br />
                                <input
                                    className="text-white bg-green-950 rounded px-3 py-2 w-full"
                                    type="text"
                                    name="lName"
                                    id="lName"
                                    required
                                />{' '}
                            </div>
                            <div className="w-full px-2 md:px-0">
                                <label htmlFor="email">Email *</label> <br />
                                <input
                                    className="text-white bg-green-950 rounded px-3 py-2 w-full"
                                    type="text"
                                    name="email"
                                    id="email"
                                    required
                                />{' '}
                            </div>
                        </div>
                        <br />

                        <div className="flex flex-col sm:flex-row items-center gap-3 px-2 md:px-0">
                            <div className="sm:w-1/2">
                                <label htmlFor="pdCod">Product Code </label>{' '}
                                <br />
                                <input
                                    className="text-white md:font-normal rounded bg-green-950 px-3 py-2 w-full"
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
                                    className="text-white md:font-normal rounded px-3 py-2 w-full bg-green-950"
                                    type="text"
                                    name="massage"
                                    id="massage"
                                    placeholder="Type your Massages here."
                                    required
                                />{' '}
                            </div>
                        </div>
                        <div className="w-fit md:ml-auto md:mx-0 mx-auto mt-4 px-2 md:px-0">
                            <Button
                                variant="default"
                                size="lg"
                                className="text-neutral-100 bg-primary-foreground">
                                {' '}
                                Send Massage
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
