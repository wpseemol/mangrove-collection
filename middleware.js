import NextAuth from 'next-auth';
import { authConfig } from './auth/auth.config';

const { auth: middleware } = NextAuth(authConfig);

export default middleware(async (request) => {
    console.log('middleware is login:', request.auth);

    return null;
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
