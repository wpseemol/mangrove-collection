import 'next-auth/jwt';
import { RoleType } from './mongoose-models';

declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        /** OpenID ID Token */
        role?: RoleType | string;
    }
}

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's postal address. */
            role?: RoleType | string;
            id: string;
        } & DefaultSession['user'];
    }

    /**
     * The shape of the user object returned in the OAuth providers' `profile` callback,
     * or the second parameter of the `session` callback, when using a database.
     */
    interface User {
        role?: RoleType | string;
    }
    /**
     * Usually contains information about the provider being used
     * and also extends `TokenSet`, which is different tokens returned by OAuth Providers.
     */
    interface Account {
        role?: RoleType | string;
    }
    /** The OAuth profile returned from your provider */
    interface Profile {
        role?: RoleType | string;
    }
}
