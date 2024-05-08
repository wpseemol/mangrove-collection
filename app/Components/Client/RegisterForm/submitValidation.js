export function submitValidation(formData, setFormData, setLoading) {
    const { fullName, email, password, phoneNumber } = formData;

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

        setLoading(false);
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

        setLoading(false);
    }
}

export function passwordValidationStrong(name, value, setFormData) {
    if (name === 'password') {
        const minLength = 6;
        const containsUpperCase = /[A-Z]/.test(value);
        const containsLowerCase = /[a-z]/.test(value);
        const containsSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
            value
        );

        if (value.length < minLength) {
            setFormData((pre) => ({
                ...pre,
                password: {
                    ...pre?.password,
                    isError: true,
                    submitStatus: false,
                    massage: 'Password must be at least 6 characters long.',
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
