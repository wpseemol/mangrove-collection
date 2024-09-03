'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
        const role = formData.get('role') as string;

        const isUpdate = await update({ name, role });
        console.log('is update:', isUpdate);

        router.refresh();
    }

    return (
        <main className="container mx-auto min-h-[calc(100vh-25rem)] flex justify-center items-center">
            <div>
                <Card className=" text-2xl w-1/3 mx-auto p-5">
                    <form onSubmit={handelSubmit}>
                        <label htmlFor="name">Name</label>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            className="border-neutral-800 mb-3"
                        />

                        <label htmlFor="role">Role</label>
                        <br />
                        <select
                            name="role"
                            id="role"
                            className="rounded-sm p-[6px] border w-full border-neutral-800 mb-3">
                            <option value="">Select a role</option>
                            <option value="admin">Admin</option>
                            <option value="creator">Creator</option>
                            <option value="user">User</option>
                        </select>

                        <br />

                        <Button>submit</Button>
                    </form>
                </Card>
                <div className="w-fit text-4xl">
                    login user:{' '}
                    <pre className="text-wrap">{JSON.stringify(data)}</pre>
                </div>
            </div>
        </main>
    );
}
