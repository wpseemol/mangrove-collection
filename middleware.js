import { cookies } from 'next/headers';

export default async function middleware() {
    const email = cookies().has('email');
    const password = cookies().has('pass');

    if (email && password) {
        console.log(
            'from middle Ware',
            cookies().get('email')?.value,
            cookies().get('pass')?.value
        );
    }
}
