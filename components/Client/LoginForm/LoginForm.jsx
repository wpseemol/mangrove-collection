'use client';

import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { FcSynchronize } from 'react-icons/fc';
import PasswordShowHidden from '../PasswordShowHidden/PasswordShowHidden';
import useLoginForm from './useLoginForm';

export default function LoginForm() {
    const { formData, isSubmitDisable, loading, handelLogin } = useLoginForm();
    return (
        <>
            <form
                noValidate=""
                onSubmit={(e) => handelLogin(e, 'onSubmit')}
                className="space-y-12">
                <div className="space-y-4">
                    <div className="md:w-[22rem]">
                        <label htmlFor="email" className="block mb-2 text-sm">
                            Email address
                        </label>
                        {formData?.email?.isError ? (
                            <p className="text-red-400">
                                {formData?.email?.massage}
                            </p>
                        ) : (
                            ''
                        )}

                        <input
                            onChange={(e) => handelLogin(e, 'onChange')}
                            type="email"
                            name="email"
                            id="email"
                            placeholder="leroy@jenkins.com"
                            className={`w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-50 dark:text-gray-800 ${
                                formData?.email?.isError ? 'border-red-400' : ''
                            }`}
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
                        {formData?.password?.isError ? (
                            <p className="text-red-400">
                                {formData?.password?.massage}
                            </p>
                        ) : (
                            ''
                        )}

                        {/* this is password */}
                        <PasswordShowHidden
                            handelLogin={handelLogin}
                            where="login"
                            className={`w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-50 dark:text-gray-800 ${
                                formData?.password?.isError
                                    ? 'border-red-400'
                                    : ''
                            }`}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <div>
                        <button
                            type="submit"
                            disabled={!isSubmitDisable}
                            className={`w-full px-8 py-3 font-semibold rounded-md bg-primaryColor 
                        text-gray-50 disabled:bg-primaryColor/45 ${
                            !isSubmitDisable ? 'cursor-not-allowed' : ''
                        }`}>
                            {loading ? (
                                <p className="flex justify-center items-center gap-3 cursor-wait">
                                    <span>Loading </span>
                                    <FcSynchronize className="animate-spin text-2xl" />{' '}
                                </p>
                            ) : (
                                <span>Sign in</span>
                            )}
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

            <Toaster />
        </>
    );
}
