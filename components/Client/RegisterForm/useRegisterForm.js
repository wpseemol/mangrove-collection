import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { passwordValidationStrong, submitValidation } from './submitValidation';

export default function useRegisterForm() {
    const [loading, setLoading] = useState(false);

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

    const router = useRouter();

    const { fullName, email, password, phoneNumber } = formData;

    // submit object
    const submitObject = {
        fullName: fullName.value,
        email: email.value,
        password: password.value,
        phoneNumber: phoneNumber.value,
        userType: 'regular',
    };

    // submit btn disabled
    const isSubmitDisable =
        !fullName.isError &&
        !email.isError &&
        !password.isError &&
        !phoneNumber.isError;

    const handelRegister = async function (event, where) {
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
            passwordValidationStrong(name, value, setFormData);
        }

        if (where === 'onSubmit') {
            event.preventDefault(); // form behavior stop
            setLoading(true);
            // submit form valediction and error set
            submitValidation(formData, setFormData, setLoading);

            const isSubmit =
                fullName.submitStatus &&
                email.submitStatus &&
                password.submitStatus &&
                phoneNumber.submitStatus;

            if (isSubmit) {
                setFormData((pre) => ({
                    ...pre,
                    password: {
                        ...pre?.password,
                        submitStatus: false,
                    },
                    email: {
                        ...pre?.email,
                        submitStatus: false,
                    },
                }));

                setLoading(true);

                try {
                    const registerSuccessful = await fetch(`/api/v1/user`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(submitObject),
                    });

                    if (registerSuccessful?.ok) {
                        setLoading(false);

                        toast.success('Hai your registration is successful', {
                            icon: '👏',
                        });

                        router.push('/login');

                        setFormData((pre) => ({
                            ...pre,
                            password: {
                                ...pre?.password,
                                submitStatus: true,
                            },
                            email: {
                                ...pre?.email,
                                submitStatus: true,
                            },
                        }));
                    }
                } catch (error) {
                    setLoading(false);
                    setFormData((pre) => ({
                        ...pre,
                        password: {
                            ...pre?.password,
                            submitStatus: true,
                        },
                        email: {
                            ...pre?.email,
                            submitStatus: true,
                        },
                    }));
                    console.error(error);
                    throw error;
                }
            }
        }
    };

    return { formData, isSubmitDisable, handelRegister, loading };
}
