export const authCallbacks = {
    async signIn({ user, account }) {
        // console.log('from authCallback singin user:', user);
        // console.log('from authCallback singin account:', account);

        if (user && user?.role) account.role = user?.role;
        return true;
    },
    async session({ session, token }) {
        if (token && token?.role) session.user.role = token.role;

        // console.log('from authCallback session session:', session.user);
        // console.log('from authCallback session token:', token);

        return session;
    },
    async jwt({ token, user, account }) {
        if (account && account?.role) {
            token.role = account.role;
            user.role = account.role;
        }
        // console.log('from authCallback user:', user);
        // console.log('from authCallback account:', account);
        //console.log('from authCallback token:', token);

        return token;
    },
};
