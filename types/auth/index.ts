import { Provider } from '@auth/core/providers';

interface AuthConfigType {
    providers: Provider[];
    session: SessionType;
}

type SessionType =
    | {
          strategy?: 'jwt' | 'database';
          maxAge?: number;
          updateAge?: number;
          generateSessionToken?: () => string;
      }
    | undefined;

export type { AuthConfigType };
