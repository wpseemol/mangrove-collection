'use server';

// import { getServerSession } from 'next-auth/next';

export async function loginUserUpdate({ name }: { name: string | null }) {
    // const session = await getSession(auth);

    // const session = await getServerSession(authConfig);

    // console.log('test action', session);

    return { message: 'successful!' };
}
