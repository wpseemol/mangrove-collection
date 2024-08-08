import { authCallbacks } from './callbacks';

export const authConfig = {
    session: {
        strategy: 'jwt',
    },
    callbacks: authCallbacks,

    providers: [],
};
