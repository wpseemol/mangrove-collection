'use client';

import Link from 'next/link';
import { FcSynchronize } from 'react-icons/fc';
import NotificationComponent from '../NotificationComponent/NotificationComponent';
import PasswordShowHidden from '../PasswordShowHidden/PasswordShowHidden';
import useRegisterForm from './useRegisterForm';

export default function RegisterForm() {
    const { formData, isSubmitDisable, loading, handelRegister } =
        useRegisterForm();

    return (
        <>
            <form
                noValidate=""
                onSubmit={(e) => handelRegister(e, 'onSubmit')}
                className="space-y-12">
                <div className="space-y-4">
                    <div className="md:w-[22rem]">
                        <label
                            htmlFor="fullName"
                            className="block mb-2 text-sm">
                            Full Name*
                        </label>
                        {/* error massage show here */}
                        {formData?.fullName?.isError && (
                            <p className="text-red-400">
                                {formData?.fullName?.massage}
                            </p>
                        )}

                        <input
                            onChange={(e) => handelRegister(e, 'onChange')}
                            type="text"
                            name="fullName"
                            id="fullName"
                            placeholder="Full Name"
                            className={`w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-50 dark:text-gray-800 ${
                                formData?.fullName?.isError
                                    ? 'border-red-400'
                                    : ''
                            }`}
                        />
                    </div>

                    <div className="md:w-[22rem]">
                        <label htmlFor="email" className="block mb-2 text-sm">
                            Email address*
                        </label>

                        {formData?.email?.isError ? (
                            <p className="text-red-400">
                                {formData?.email?.massage}
                            </p>
                        ) : (
                            ''
                        )}

                        <input
                            onChange={(e) => handelRegister(e, 'onChange')}
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
                        <label
                            htmlFor="phoneNumber"
                            className="block mb-2 text-sm">
                            Phone*
                        </label>

                        {formData?.phoneNumber?.isError ? (
                            <p className="text-red-400">
                                {formData?.phoneNumber?.massage}
                            </p>
                        ) : (
                            ''
                        )}

                        <input
                            onChange={(e) => handelRegister(e, 'onChange')}
                            type="text"
                            name="phoneNumber"
                            id="phoneNumber"
                            placeholder="+880 17111111222"
                            className={`w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-50 dark:text-gray-800 ${
                                formData?.phoneNumber?.isError
                                    ? 'border-red-400'
                                    : ''
                            }`}
                        />
                    </div>

                    <div className="md:w-[22rem]">
                        <div className="flex justify-between mb-2">
                            <label htmlFor="password" className="text-sm">
                                Password*
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
                            !!formData?.password?.status && (
                                <p
                                    className={`
                                ${
                                    formData?.password?.status === 'weak'
                                        ? ' text-orange-400 '
                                        : ''
                                }
                                ${
                                    formData?.password?.status === 'medium'
                                        ? ' text-yellow-400 '
                                        : ''
                                }
                                ${
                                    formData?.password?.status === 'strong'
                                        ? ' text-green-400 '
                                        : ''
                                }
                                ${
                                    formData?.password?.status
                                        ? ' text-[#1573fd] '
                                        : ''
                                }
                                `}>
                                    {formData?.password?.massage}
                                </p>
                            )
                        )}

                        {/* this is password */}
                        <PasswordShowHidden
                            handelRegister={handelRegister}
                            where="register"
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
                                <span>Sign Up</span>
                            )}
                        </button>
                    </div>
                    <p className="px-6 text-sm text-center dark:text-gray-600">
                        {`Already have an account?`}
                        <Link
                            rel="noopener noreferrer"
                            href="/login"
                            className="hover:underline text-primaryColor">
                            Login
                        </Link>
                        .
                    </p>
                </div>
            </form>
            <NotificationComponent />
        </>
    );
}
