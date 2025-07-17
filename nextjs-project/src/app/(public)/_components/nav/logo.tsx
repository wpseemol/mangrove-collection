import CustomLink from '@/components/custom-link';
import Image from 'next/image';

export function Logo() {
    return (
        <li className="text-white group">
            <CustomLink href="/">
                <div className="flex gap-2 justify-center items-center">
                    <figure className=" w-10 h-10 mx-auto rounded-bl-3xl overflow-hidden animate-jump relative">
                        <Image
                            src="/assets/logo/mangrove-collection.png"
                            alt="Site logo"
                            className="w-full object-cover group-hover:scale-125 duration-300"
                            width={44}
                            height={44}
                        />
                    </figure>
                    <h2 className="font-bold text-primary-foreground text-sm md:text-base animate-fade-right">
                        Mangrove <br />
                        Collection
                    </h2>
                </div>
            </CustomLink>
        </li>
    );
}
