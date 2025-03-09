import { auth } from '@/auth';
import Image from 'next/image';
import LogoutButton from './_components/logout-button';

export default async function ProfilePage() {
    const session = await auth();
    return (
        <div className=" flex items-center justify-center">
            <div className=" w-96 text-center my-10">
                <Image
                    className="w-24 h-24 mx-auto rounded-full border-4 border-gray-300"
                    src={session?.user.image}
                    width={100}
                    height={100}
                    alt="User Avatar"
                />
                <h2 className="mt-4 text-2xl font-semibold text-gray-800">
                    {session?.user.name}
                </h2>
                <p className="text-gray-600 text-sm">{session?.user.email}</p>
                <div className="mt-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Follow
                    </button>
                    <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 ml-2">
                        Message
                    </button>
                </div>
                <div className="mt-6 flex justify-around border-t pt-4">
                    <div>
                        <p className="text-lg font-bold text-gray-700">120</p>
                        <p className="text-sm text-gray-500">Followers</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-700">80</p>
                        <p className="text-sm text-gray-500">Following</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-700">30</p>
                        <p className="text-sm text-gray-500">Posts</p>
                    </div>
                </div>
                <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-gray-500">
                        Joined: January 2024
                    </p>
                </div>

                <LogoutButton />
            </div>
        </div>
    );
}

{
    /* <Image
    className="w-24 h-24 mx-auto rounded-full border-4 border-gray-300"
    src={session?.user.image}
    width={100}
    height={100}
    alt="User Avatar"
/>; */
}
