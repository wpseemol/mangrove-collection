import { NextResponse } from 'next/server';

export function setCookieUserUniqueIdentity({
    isLoggedIn,
}: UniqueIdentityType) {
    const response = NextResponse.next();

    const isSet = response.cookies.set('_unique_identity', crypto.randomUUID());
    console.log('is set:', isSet);
}

type UniqueIdentityType = {
    isLoggedIn: boolean;
};
