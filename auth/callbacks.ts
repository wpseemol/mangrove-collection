import { Account, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export const authCallbacks = {
    async signIn({
        user,
        account,
    }: {
        user: User;
        account: Account | null;
    }): Promise<boolean> {
        console.log('from authCallback singin user:', user);
        console.log('from authCallback singin account:', account);
        if (account && user) {
            if (user && user?.role) account.role = user.role;
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
        if (token && token?.role) session.user.role = token.role;
        if (token && token?.sub) session.user.id = token.sub;

        // console.log('from authCallback session session:', session.user);
        // console.log('from authCallback session token:', token);

        return session;
    },
    async jwt({
        token,
        user,
        account,
    }: {
        token: JWT;
        user?: User;
        account?: Account | null;
    }): Promise<JWT> {
        if (account && account?.role) {
            token.role = account.role;
            if (user) {
                user.role = account.role;
            }
        }
        // console.log('from authCallback user:', user);
        // console.log('from authCallback account:', account);
        //console.log('from authCallback token:', token);

        return token;
    },
};
