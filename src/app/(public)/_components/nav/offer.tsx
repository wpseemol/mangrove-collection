import CustomLink from '@/components/custom-link';
import { FaDollarSign } from 'react-icons/fa6';

export function Offer() {
    return (
        <li className="text-white">
            {' '}
            <CustomLink
                className="hover:text-primary-foreground duration-150"
                href="/offers">
                <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1 group">
                    <div className="text-primary-foreground xl:text-3xl md:text-2xl text-xl">
                        <FaDollarSign />
                    </div>
                    <div>
                        <h2 className="sm:text-lg text-sm font-medium">
                            Offers
                        </h2>
                        <p className="text-sm hidden md:block text-muted dark:text-neutral-300/90 duration-150 group-hover:text-primary-foreground">
                            Latest Offers
                        </p>
                    </div>
                </div>
            </CustomLink>{' '}
        </li>
    );
}
