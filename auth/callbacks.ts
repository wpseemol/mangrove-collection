import { JWT } from '@auth/core/jwt';

import { Account, NextAuthConfig, Profile, Session, User } from 'next-auth';

export const authCallbacks: NextAuthConfig['callbacks'] = {
    async signIn({
        user,
        account,
    }: {
        user: User;
        account: Account | null;
    }): Promise<boolean> {
        // Your logic here
        if (account && user?.role) {
            account.role = user.role;
        }
        return true;
    },
    async session({
        session,
        token,
    }: {
        session: Session;
        token: JWT;
    }): Promise<Session> {
        // Add role and id to the session from the token
        if (token.role) {
            session.user.role = token.role;

            console.log('token role:', token.role);
        }
        if (token.sub) {
            session.user.id = token.sub;
        }

        // console.log(session);

        return session;
    },
    async jwt({
        token,
        user,
        session,
        trigger,
    }: {
        token: JWT;
        user?: User;
        session?: Profile;
        trigger?: 'update' | 'signIn' | 'signUp';
    }): Promise<JWT> {
        // Update token with role from user or session
        if (user?.role) {
            token.role = user.role;
        }
        if (session?.role) {
            token.role = session.role;
        }

        // Handle updates
        if (trigger === 'update') {
            token = {
                ...token,
                ...(session as Partial<JWT>),
            };
        }

        return token;
    },
};
