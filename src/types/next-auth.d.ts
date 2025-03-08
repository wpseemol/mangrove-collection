import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image: string | null;
            role: 'user' | 'creator' | 'admin';
        };
    }

    interface User {
        id: string;
        name: string;
        email: string;
        image: string | null;
        role: 'user' | 'creator' | 'admin';
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        name: string;
        email: string;
        image: string | null;
        role: 'user' | 'creator' | 'admin';
    }
}
