import Credentials from 'next-auth/providers/credentials';

const credentialsProvider = Credentials({
    name: 'Credentials',
    type: 'credentials',

    credentials: {
        email: { label: 'email' },
        password: { label: 'Password', type: 'password' },
    },
    async authorize(request) {
        console.log('form Credentails:', request);

        return {};
    },
});

export { credentialsProvider };
