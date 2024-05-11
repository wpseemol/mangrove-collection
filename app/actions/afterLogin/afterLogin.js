import { cookies } from 'next/headers';
import loginAction from '../loginAction/loginAction';

export default async function afterLogin() {
    const email = cookies().has('email');
    const password = cookies().has('pass');

    if (email && password) {
        const loginUser = await loginAction({
            email: cookies().get('email')?.value,
            password: cookies().get('pass')?.value,
        });

        return loginUser;
    } else {
        return null;
    }
}
