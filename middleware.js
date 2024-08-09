import { authConfig } from '@/auth/auth.config';
import { ADMIN, CREATOR } from '@/constant-value';
import {
    adminRoutes,
    apiAuthPrefix,
    creatorRoutes,
    DEFAULT_LOGIN_REDIRECT,
    loginAuth,
    PUBLIC_ROUTE,
} from '@/routes';
import NextAuth from 'next-auth';

const { auth: middleware } = NextAuth(authConfig);

export default middleware(async (request) => {
    const { nextUrl } = request;

    const isLoggedIn = !!request?.auth;
    const isAdmin = request?.auth?.user?.role === ADMIN;
    const isCreator = request?.auth?.user?.role === CREATOR;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoutes = PUBLIC_ROUTE.includes(nextUrl.pathname);
    const isAuthRoutes = loginAuth.includes(nextUrl.pathname);
    const isAdminRoutes = adminRoutes.includes(nextUrl.pathname);
    const isCreatorRoutes = creatorRoutes.includes(nextUrl.pathname);

    console.log('middle ware path name:', nextUrl.pathname);

    if (isApiAuthRoute) return null;

    if (isAuthRoutes) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return null;
    }

    if (isAdminRoutes) {
        if (isAdmin) return null;
        return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    if (isCreatorRoutes) {
        if (isCreator) return null;
        return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    if (!isLoggedIn && !isPublicRoutes) {
        return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    return null;
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
