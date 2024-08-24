import { AuthConfigType } from '@/types/auth';

export const authConfig: AuthConfigType = {
    providers: [],
    session: {
        strategy: 'jwt',
    },
};
