'use client';

import { loginUserUpdate } from '@/action/test';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TestPage() {
    const { data, update } = useSession();
    const router = useRouter();

    async function handelSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const name = formData.get('name') as string;

        const isUpdate = await loginUserUpdate({ name });

        // const isUpdate = await update({ name, role: 'admin' });
        // console.log('is update:', isUpdate);
        router.refresh();
    }

    return (
        <main className="container mx-auto min-h-[calc(100vh-25rem)] flex justify-center items-center">
            <div>
                <div className=" text-2xl w-1/3 mx-auto my-5">
                    <form onSubmit={handelSubmit}>
                        <label htmlFor="name">Name</label>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            className="border-neutral-800 mb-3"
                        />

                        <Button>submit</Button>
                    </form>
                </div>
                <div className="w-fit text-4xl">
                    login user:{' '}
                    <pre className="text-wrap">{JSON.stringify(data)}</pre>
                </div>
            </div>
        </main>
    );
}
