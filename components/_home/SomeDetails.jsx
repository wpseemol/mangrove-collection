import Link from 'next/link';

export default function SomeDetails() {
    return (
        <section className="container mx-auto my-10 px-4 md:px-0" id="about">
            <div className="mb-5">
                <h2 className="text-3xl">
                    <samp className="text-primaryColor">
                        Top Gadget Shop in Bangladesh
                    </samp>
                </h2>
            </div>
            <div>
                <p className="text-base">
                    We are now going through a period when technology brings the
                    revolution. From dawn to dusk every moment in our life is
                    connected to technology. Various kinds of smart gadgets
                    become inseparable parts of our daily life. Consistent with
                    the demand there is a huge gadget-selling market globally
                    including Bangladesh. In Bangladesh, Apple Gadgets is a
                    top-tier gadget-selling shop. They provide consumers a huge
                    compilation of gadgets:{' '}
                    <Link className="underline" href="/Phones&Tablets">
                        Phones & Tablets
                    </Link>{' '}
                    ,{' '}
                    <Link className="underline" href="/Phones&Tablets">
                        Laptops & Desktops
                    </Link>{' '}
                    , Accessories, Smart Home Appliances etc. Apple Gadgets
                    satisfies its huge customer base both online and offline.
                    Currently, serve customers with four outlets around Dhaka
                    city at four different locations. Best customer service
                    makes Apple Gadgets a trustworthy retail gadgets shop in
                    Dhaka, Bangladesh.
                </p>
            </div>
            <div className="my-5">
                <h2 className="text-3xl">
                    <samp className="text-primaryColor">
                        Best Phones & Tablets Online Shop in Bangladesh
                    </samp>
                </h2>
            </div>
            <div>
                <p className="text-base">
                    From early morning alarm to watching a movie at late night
                    laying on your bed. Literally, we do half of our daily tasks
                    with our smartphones. Phones are now a 24/7 component in our
                    life. Alike phones the demand for tablets is also uplifting
                    rapidly. But, the problem is to find a reliable shop to buy
                    phones and tablets. In terms of buying phones and tablets,
                    Apple Gadgets is a name of trust here in Bangladesh. They
                    furnish their outlets with a large number of smartphones
                    from top-notch brands. Such as iPhone, Samsung, Google,
                    Xiaomi, OnePlus, Oppo, Vivo, Motorola, Infinix, Huawei,
                    Honor, Nokia, and many more. Whether you want a smartphone,
                    feature phone, or tablet for your official work, get it from
                    Apple Gadgets through online or offline.
                </p>
            </div>
        </section>
    );
}
