import { auth } from '@/auth/auth';
import { FaRegUser } from 'react-icons/fa6';
import NavLink from '../NavLink/NavLink';

export default async function Account({ loginUser }) {
    const section = await auth();

    const firstName = section?.user?.name.split(' ')[0];

    let linkUrl;
    if (section?.user?.role === 'admin') {
        linkUrl = '/dashboard';
    } else if (section?.user?.role === 'contentCreator') {
        linkUrl = '/dashboard';
    } else {
        linkUrl = '/account';
    }

    return (
        <li className="text-white">
            <NavLink href={section?.user ? linkUrl : '/login'}>
                <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1">
                    <div className="text-primaryColor lg:text-3xl text-xl">
                        <FaRegUser />
                    </div>
                    <div>
                        <h2 className="lg:2xl md:text-xl text-sm font-semibold">
                            Account
                        </h2>
                        {section?.user ? (
                            <p className="text-sm hidden md:block">
                                {firstName}
                            </p>
                        ) : (
                            <p className="text-sm hidden md:block">
                                register or Login
                            </p>
                        )}
                    </div>
                </div>
            </NavLink>
        </li>
    );
}
