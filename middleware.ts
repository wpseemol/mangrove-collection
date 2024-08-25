import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth/auth.config';
import { ADMIN, CREATOR, USER } from './lib/constant-value';
import {
    adminRoutes,
    apiAuthPrefix,
    creatorRoutes,
    DEFAULT_LOGIN_REDIRECT,
    DEFAULT_REDIRECT,
    loginAuth,
    PUBLIC_ROUTE,
    userRoute,
} from './routes';

const { auth: middleware } = NextAuth(authConfig);

export default middleware(async (request) => {
    const { nextUrl } = request;

    const isLoggedIn = !!request?.auth;
    const isAdmin = request?.auth?.user?.role === ADMIN;
    const isCreator = request?.auth?.user?.role === CREATOR;
    const isUser = request?.auth?.user?.role === USER;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoutes = PUBLIC_ROUTE.includes(nextUrl.pathname);
    const isAuthRoutes = loginAuth.includes(nextUrl.pathname);
    const isAdminRoutes = adminRoutes.includes(nextUrl.pathname);
    const isCreatorRoutes = creatorRoutes.includes(nextUrl.pathname);
    const isUserRoutes = userRoute.includes(nextUrl.pathname);

    // console.log('middle ware path name:', nextUrl);

    if (isApiAuthRoute) return NextResponse.next();

    if (isAuthRoutes) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
        }
        return NextResponse.next();
    }

    if (isUserRoutes && isUser) {
        if (isUser) return NextResponse.next();
        return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    if (isAdminRoutes && isAdmin) {
        if (isAdmin) return NextResponse.next();
        return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    if (isCreatorRoutes && isCreator) {
        if (isCreator) return NextResponse.next();
        return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    if (!isLoggedIn && !isPublicRoutes) {
        return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
