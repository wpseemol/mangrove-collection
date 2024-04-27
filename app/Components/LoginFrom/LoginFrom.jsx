import Link from 'next/link';
import PasswordShowHidden from '../Client/PasswordShowHidden/PasswordShowHidden';

export default function LoginFrom(where) {
    if (where === 'intercept') {
        console.log('inside intercept from');
    }
    return (
        <div className="flex flex-col max-w-md p-6 rounded-md sm:p-10 bg-white text-gray-800 shadow-lg">
            <div className="mb-8 text-center">
                <h1 className="my-3 text-4xl font-bold">Sign in</h1>
                <p className="text-sm text-gray-600">
                    Sign in to access your account
                </p>
            </div>
            <form noValidate="" action="" className="space-y-12">
                <div className="space-y-4">
                    <div className="md:w-[22rem]">
                        <label htmlFor="email" className="block mb-2 text-sm">
                            Email address
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="leroy@jenkins.com"
                            className="w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-50 dark:text-gray-800"
                        />
                    </div>
                    <div className="md:w-[22rem]">
                        <div className="flex justify-between mb-2">
                            <label htmlFor="password" className="text-sm">
                                Password
                            </label>
                            <Link
                                rel="noopener noreferrer"
                                href="#"
                                className="text-xs hover:underline text-gray-600">
                                Forgot password?
                            </Link>
                        </div>
                        <PasswordShowHidden />
                    </div>
                </div>
                <div className="space-y-2">
                    <div>
                        <button
                            type="button"
                            className="w-full px-8 py-3 font-semibold rounded-md bg-primaryColor text-gray-50">
                            Sign in
                        </button>
                    </div>
                    <p className="px-6 text-sm text-center dark:text-gray-600">
                        {`Don't have an account yet?`}
                        <Link
                            rel="noopener noreferrer"
                            href="/register"
                            className="hover:underline text-primaryColor">
                            Sign up
                        </Link>
                        .
                    </p>
                </div>
            </form>
        </div>
    );
}
