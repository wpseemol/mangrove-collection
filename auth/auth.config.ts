// import { AuthConfigType } from '@/types/auth';
import { NextAuthConfig } from 'next-auth';
import { authCallbacks } from './callbacks';

export const authConfig: NextAuthConfig = {
    session: {
        strategy: 'jwt',
    },
    callbacks: authCallbacks,
    providers: [],
};
