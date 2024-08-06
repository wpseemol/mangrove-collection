import NextAuth from 'next-auth';
import { providers } from './providers';

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: 'jwt',
    },

    providers,
});
