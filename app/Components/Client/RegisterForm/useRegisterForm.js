import { useState } from 'react';

export default function useRegisterForm() {
    const [formData, setFormData] = useState({
        fullName: {
            value: null,
            isError: false,
            submitStatus: false,
            massage: 'Please input your full name.',
        },
        email: {
            submitStatus: false,
            value: null,
            isError: false,
            massage: 'Please input your Email.',
        },
        password: {
            submitStatus: false,
            value: null,
            isError: false,
            massage: 'Please input password.',
        },
        phoneNumber: {
            submitStatus: false,
            value: null,
            isError: false,
            massage: 'Please input your Phone Number',
        },
    });

    const { fullName, email, password, phoneNumber } = formData;

    // submit btn disabled

    const isSubmitDisable =
        !fullName.isError &&
        !email.isError &&
        !password.isError &&
        !phoneNumber.isError;

    const handelRegister = function (event, where) {
        const name = event.target.name;
        const value = event.target.value;

        if (where === 'onChange') {
            setFormData((pre) => ({
                ...pre,
                [name]: {
                    ...pre[name],
                    value: value,
                    isError: false,
                    submitStatus: true,
                },
            }));

            // password character validation

            // Assuming this code is part of a function or event handler
            if (name === 'password') {
                const minLength = 6;
                const containsUpperCase = /[A-Z]/.test(value);
                const containsLowerCase = /[a-z]/.test(value);
                const containsSpecial =
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);

                if (value.length < minLength) {
                    setFormData((pre) => ({
                        ...pre,
                        password: {
                            ...pre?.password,
                            isError: true,
                            submitStatus: false,
                            massage:
                                'Password must be at least 6 characters long.',
                        },
                    }));
                    return;
                }

                // Calculate password strength score
                const strengthScore =
                    (containsSpecial ? 1 : 0) +
                    (containsUpperCase ? 1 : 0) +
                    (containsLowerCase ? 1 : 0);

                // Determine password strength level

                let strengthLevel;
                let status;
                if (strengthScore === 1) {
                    strengthLevel = 'Weak';
                    status = 'weak';
                } else if (strengthScore === 2) {
                    strengthLevel = 'Medium';
                    status = 'medium';
                } else if (strengthScore === 3) {
                    strengthLevel = 'Strong';
                    status = 'strong';
                } else {
                    strengthLevel = 'Try strong your';
                    status = true;
                }

                setFormData((pre) => ({
                    ...pre,
                    password: {
                        ...pre?.password,
                        isError: false,
                        submitStatus: true,
                        status: status,
                        massage: `${strengthLevel} password!`,
                    },
                }));
            }
        }

        if (where === 'onSubmit') {
            event.preventDefault(); // form behavior stop

            // full name validation cake
            if (!fullName.value) {
                setFormData((pre) => ({
                    ...pre,
                    fullName: {
                        ...pre?.fullName,
                        isError: true,
                        submitStatus: false,
                    },
                }));
            }
            // email validation cake
            if (!email.value) {
                setFormData((pre) => ({
                    ...pre,
                    email: {
                        ...pre?.email,
                        isError: true,
                        submitStatus: false,
                    },
                }));
            }
            // password validation cake
            if (!password.value) {
                setFormData((pre) => ({
                    ...pre,
                    password: {
                        ...pre?.password,
                        isError: true,
                        submitStatus: false,
                    },
                }));
            }

            // phoneNumber validation cake
            if (!phoneNumber.value) {
                setFormData((pre) => ({
                    ...pre,
                    phoneNumber: {
                        ...pre?.phoneNumber,
                        isError: true,
                        submitStatus: false,
                    },
                }));
            }

            const isSubmit =
                fullName.submitStatus &&
                email.submitStatus &&
                password.submitStatus &&
                phoneNumber.submitStatus;

            if (isSubmit) {
                const submitObject = {
                    fullName: fullName.value,
                    email: email.value,
                    password: password.value,
                    phoneNumber: phoneNumber.value,
                    userType: 'regular',
                };

                console.log('submit object:', submitObject);
            }
        }
    };

    return { formData, isSubmitDisable, handelRegister };
}
