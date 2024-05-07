'use client';

import Link from 'next/link';
import { useState } from 'react';
import PasswordShowHidden from '../PasswordShowHidden/PasswordShowHidden';

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        fullName: null,
        email: null,
        password: null,
        phoneNumber: null,
    });

    const handelRegister = function (event) {
        event.preventDefault(); // form behavior stop

        const formTarget = event.target;

        const fullName = formTarget.fullName.value;
        const email = formTarget.email.value;
        const password = formTarget.password.value;
        const phoneNumber = formTarget.phoneNumber.value;

        const formName = event.target.name.value;
        setFormData((previous) => ({ ...previous }));

        console.log('form name:', { fullName, email, password, phoneNumber });
    };

    return (
        <form noValidate="" onSubmit={handelRegister} className="space-y-12">
            <div className="space-y-4">
                <div className="md:w-[22rem]">
                    <label htmlFor="fullName" className="block mb-2 text-sm">
                        Full Name*
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        placeholder="Full Name"
                        className="w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-50 dark:text-gray-800"
                    />
                </div>

                <div className="md:w-[22rem]">
                    <label htmlFor="email" className="block mb-2 text-sm">
                        Email address*
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
                    <label htmlFor="phoneNumber" className="block mb-2 text-sm">
                        Phone*
                    </label>
                    <input
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="+880 17111111222"
                        className="w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-50 dark:text-gray-800"
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
                    {/* this is password */}
                    <PasswordShowHidden />
                </div>
            </div>
            <div className="space-y-2">
                <div>
                    <button
                        type="submit"
                        className="w-full px-8 py-3 font-semibold rounded-md bg-primaryColor text-gray-50">
                        Sign Up
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
    );
}
