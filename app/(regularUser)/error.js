'use client';

import Error from '@/components/Client/error/error';

export default function RootError({ error, reset }) {
    return (
        <>
            <Error error={error} reset={reset} />
        </>
    );
}
