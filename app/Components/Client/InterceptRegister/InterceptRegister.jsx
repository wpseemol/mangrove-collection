'use client';
import { usePathname } from 'next/navigation';

export default function InterceptRegister({ children, RegisterFrom }) {
    const pathName = usePathname();
    if (pathName === '/register') {
        return RegisterFrom;
    }

    if (pathName === '/login') {
        return children;
    }
}
