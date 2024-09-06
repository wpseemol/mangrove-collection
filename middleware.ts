import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth/auth.config';
import { ADMIN, CREATOR, USER } from './lib/constant-value';
import {
    adminRoutes,
    apiAuthPrefix,
    creatorRoutes,
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

    // console.log('middle ware path name:', request?.auth)

    const backUrl = isAdmin || isCreator ? '/dashboard' : '/';

    if (isAuthRoutes) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
        }
        return NextResponse.next();
    }

    if (isCreatorRoutes && isCreator) {
        if (isCreator) return NextResponse.next();
        return NextResponse.redirect(new URL(backUrl, nextUrl));
    }

    if (isUserRoutes) {
        if (isUser) return NextResponse.next();
        return NextResponse.redirect(new URL(backUrl, nextUrl));
    }

    if (isAdminRoutes) {
        if (isAdmin) return NextResponse.next();
        return NextResponse.redirect(new URL(backUrl, nextUrl));
    }

    return NextResponse.next();
});
