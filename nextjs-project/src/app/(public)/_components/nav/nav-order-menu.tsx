import CustomLink from '@/components/custom-link';
import { TbShoppingCartCog } from 'react-icons/tb';

export default function NavOrderMenu() {
    return (
        <li className="text-white group">
            {' '}
            <CustomLink
                className="hover:text-primary-foreground duration-150"
                href="/my-order">
                <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1 group">
                    <div className="text-primary-foreground xl:text-3xl md:text-2xl text-xl group-hover:scale-125 duration-200">
                        <TbShoppingCartCog />
                    </div>
                    <div>
                        <h2 className="sm:text-lg text-sm font-medium">
                            Order
                        </h2>
                        <p className="text-sm hidden md:block text-muted dark:text-neutral-300/90 duration-150 group-hover:text-primary-foreground">
                            My Order
                        </p>
                    </div>
                </div>
            </CustomLink>{' '}
        </li>
    );
}
