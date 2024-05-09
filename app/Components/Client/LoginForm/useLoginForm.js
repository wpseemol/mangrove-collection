import { useAuth } from '@/app/hooks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import submitValidation from './submitValidation';

export default function useLoginForm() {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
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
    });

    const router = useRouter();

    const [auth, setAuth] = useAuth();

    const { email, password } = formData;

    const isSubmitDisable = !email.isError && !password.isError;

    const submitObject = {
        email: email.value,
        password: password.value,
    };

    const handelLogin = async function (event, where) {
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
        }

        if (where === 'onSubmit') {
            event.preventDefault(); // form behavior stop
            setLoading(true);
            // submit form valediction and error set
            submitValidation(formData, setFormData, setLoading);

            const isSubmit = email.submitStatus && password.submitStatus;

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
                    toast.success('Hai your registration is successful', {
                        icon: '👏',
                    });
                    console.log(submitObject);
                    setAuth(submitObject);
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

    return { formData, isSubmitDisable, loading, handelLogin };
}
