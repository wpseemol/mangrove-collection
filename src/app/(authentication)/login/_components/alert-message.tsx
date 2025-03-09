'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function AlertMessage({ message }: { message: string }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(message);

    const router = useRouter();

    useEffect(() => {
        if (errorMessage) {
            setTimeout(() => {
                setErrorMessage(null);
                router.push('/login');
            }, 6000);
        }
    }, [errorMessage, setErrorMessage, router]);

    return (
        <>
            <div
                style={{
                    height: errorMessage ? 'auto' : 0,
                    paddingBlock: errorMessage ? 16 : 0,
                }}
                className="relative flex items-end gap-2 px-4 mb-8 rounded-lg bg-red-300 text-red-500 text-sm font-semibold bg-opacity-10 transition-all overflow-hidden"
                role="alert">
                <FiAlertTriangle className="!stroke-yellow-600 w-5 h-5" />
                {errorMessage}
            </div>
        </>
    );
}
