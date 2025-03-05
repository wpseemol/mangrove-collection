import { Input } from '@/components/ui/input';
import { FaMagnifyingGlass } from 'react-icons/fa6';

export function Search() {
    return (
        <li>
            <div className=" 2xl:w-[25rem] xl:w-[22rem] md:w-[13rem] sm:w-[22rem] w-[16rem] md:mt-0 mt-6  relative">
                <Input
                    type="text"
                    name="search"
                    id="search"
                    className="w-full placeholder:text-muted-foreground py-2 pl-3 focus:text-secondary-foreground rounded font-medium outline-none text-base"
                    placeholder="Search"
                />
                <div className="absolute top-2 z-10 right-3 text-muted-foreground hover:text-primary-foreground md:text-2xl text-xl hidden sm:block">
                    <FaMagnifyingGlass />
                </div>
            </div>
        </li>
    );
}
