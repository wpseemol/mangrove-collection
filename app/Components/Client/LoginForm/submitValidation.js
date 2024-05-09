export default function submitValidation(formData, setFormData, setLoading) {
    const { email, password } = formData;
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

        setLoading(false);
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

        setLoading(false);
    }
}
