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
        fullName.isError &&
        email.isError &&
        password.isError &&
        phoneNumber.isError;

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

            // password length 8 character validation

            if (name === 'password') {
                if (value.length < 6) {
                    setFormData((pre) => ({
                        ...pre,
                        password: {
                            ...pre?.password,
                            isError: true,
                            submitStatus: false,
                            massage:
                                'Password must be at last 6 characters log.',
                        },
                    }));

                    return;
                }
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
                    },
                }));
            }

            const isSubmit =
                fullName.submitStatus &&
                email.submitStatus &&
                password.submitStatus &&
                phoneNumber.submitStatus;

            if (isSubmit) {
                console.log(formData);
            }
        }
    };

    return { formData, isSubmitDisable, handelRegister };
}
