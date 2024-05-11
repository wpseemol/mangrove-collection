import loginAction from '@/app/actions/loginAction/loginAction';
import { useAuth } from '@/app/hooks';
import setCookie from '@/utils/setCookie';
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
                    const loginUse = await loginAction(submitObject);
                    if (loginUse) {
                        toast.success(
                            `Hai ${loading?.fullName} login is successful`,
                            {
                                icon: '👏',
                            }
                        );
                        setAuth(loginUse);
                        router.back();
                        setCookie('email', submitObject.email, 30);
                        setCookie('pass', submitObject.password, 30);
                        setLoading(false);
                    } else {
                        toast.error('Your email and password is not match');
                        setLoading(false);
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

    return { formData, isSubmitDisable, loading, handelLogin };
}
