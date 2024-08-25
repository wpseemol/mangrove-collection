import { Provider } from '@auth/core/providers';

/**
 * The `AuthConfigType` interface defines the structure for the authentication configuration.
 * - `providers`: An array of authentication providers.
 * - `session`: Configuration for managing user sessions.
 */

export interface AuthConfigType extends NextAuthOptions {
    /**
     *  Callbacks are asynchronous functions you can use to control what happens when an auth-related action is performed. Callbacks allow you to implement access controls without a database or to integrate with external databases or APIs.
     */
    callbacks: {
        signIn?: (params: {
            user: User;
            account: Account | null;
        }) => Promise<boolean>;
        session?: (params: {
            session: Session;
            token: JWT;
        }) => Promise<Session>;
        jwt?: (params: {
            token: JWT;
            user?: User;
            account?: Account | null;
        }) => Promise<JWT>;
    };
    providers: Provider[]; // An array of authentication providers used by NextAuth.
    session: SessionType; // Configuration for session management.
}

/**
 * Configure your session like if you want to use JWT or a database, how long until an idle session expires, or to throttle write operations in case you are using a database.
 *
 * - `strategy`: Specifies the session strategy, either 'jwt' or 'database'.
 * - `maxAge`: Maximum age of the session in seconds.
 * - `updateAge`: Interval in seconds to update the session.
 * - `generateSessionToken`: Function to generate a custom session token.
 */
type SessionType =
    | {
          strategy?: 'jwt' | 'database'; // Optional session strategy, either 'jwt' or 'database'.
          maxAge?: number; // Optional maximum age of the session in seconds.
          updateAge?: number; // Optional interval for session updates in seconds.
          generateSessionToken?: () => string; // Optional function to generate a custom session token.
      }
    | undefined; // Session can also be undefined, indicating no session configuration is provided.

import 'next-auth';
import { RoleType } from '../mongoose-models';

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `Provider` React Context
     */
    interface Session {
        user: {
            /** The user's postal address. */
            name: string;
            role: RoleType | string;
            id: string;
            image: string | null;
        };
    }

    /**
     * The shape of the user object returned in the OAuth providers' `profile` callback,
     * or the second parameter of the `session` callback, when using a database.
     */
    interface User {
        id?: string;
        username?: string;
        name: string;
        phone?: string;
        role?: RoleType;
    }
    /**
     * Usually contains information about the provider being used
     * and also extends `TokenSet`, which is different tokens returned by OAuth Providers.
     */
    interface Account {
        providerAccountId: string;
        type: string;
        provider: string;
        role?: RoleType;
    }
}

declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        /** OpenID ID Token */
        role?: RoleType;
    }
}
