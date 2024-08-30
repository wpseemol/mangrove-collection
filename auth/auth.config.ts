import { AuthConfigType } from '@/types/auth';
import { authCallbacks } from './callbacks';

export const authConfig: AuthConfigType = {
    session: {
        strategy: 'jwt',
    },
    callbacks: authCallbacks,
    providers: [],
};
