import CustomLink from '@/components/custom-link';
import Image from 'next/image';

export function Logo() {
    return (
        <li className="text-white ">
            <CustomLink href="/">
                <div className={``}>
                    <figure className="md:w-12 md:h-12 w-10 h-10 mx-auto rounded-full overflow-hidden border-2 border-ring animate-jump relative">
                        <Image
                            src="/assets/logo/mangrove-collection.png"
                            alt="Site logo"
                            className="w-full object-cover hover:scale-125 duration-300"
                            width={44}
                            height={44}
                        />
                    </figure>
                    <h2 className="font-bold text-primary-foreground text-sm md:text-base animate-fade-right">
                        Mangrove Collection
                    </h2>
                </div>
            </CustomLink>
        </li>
    );
}
