import Image from 'next/image';

export default function FooterSiteLogo() {
    return (
        <div
            className="flex lg:flex-col xl:flex-row justify-center gap-4 lg:gap-1 xl:gap-4 
        lg:mb-4 xl:mb-0 items-center pb-2 border-b xl:pb-0 xl:border-none">
            <div>
                <figure className="md:w-12 md:h-12 w-10 h-10 mx-auto rounded-full overflow-hidden border-2 border-primaryColor ">
                    <Image
                        src="/assets/logo/mangrove-collection.png"
                        alt="Site logo"
                        className="w-full object-cover hover:scale-125 duration-300"
                        width={44}
                        height={44}
                    />
                </figure>
            </div>
            <div>
                <h2 className="flex-none font-bold text-primaryColor text-sm md:text-base">
                    Mangrove Collection
                </h2>
            </div>
        </div>
    );
}
