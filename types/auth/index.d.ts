import { Provider } from '@auth/core/providers';

/**
 * The `AuthConfigType` interface defines the structure for the authentication configuration.
 * - `providers`: An array of authentication providers.
 * - `session`: Configuration for managing user sessions.
 */
interface AuthConfigType {
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

export type { AuthConfigType };
