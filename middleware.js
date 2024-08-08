import NextAuth from 'next-auth';
import { authConfig } from './auth/auth.config';
import {
    apiAuthPrefix,
    DEFAULT_LOGIN_REDIRECT,
    loginAuth,
    PUBLIC_ROUTE,
} from './routes';

const { auth: middleware } = NextAuth(authConfig);

export default middleware(async (request) => {
    const { nextUrl } = request;

    // console.log('middleware isLogin:', await auth());

    const isLoggedIn = !!request?.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = PUBLIC_ROUTE.includes(nextUrl.pathname);
    const isAuthRoutes = loginAuth.includes(nextUrl.pathname);

    if (isApiAuthRoute) return null;

    if (isAuthRoutes) {
        if (isLoggedIn)
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));

        return null;
    }

    if (!isLoggedIn && !isPublicRoutes)
        return Response.redirect(new URL('/login', nextUrl));

    return null;
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
