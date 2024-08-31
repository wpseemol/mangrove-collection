import getUsers from '@/action/users';
import { columns } from './_component/columns';
import { DataTable } from './_component/data-table';

export default async function UsersPage() {
    const allUser = await getUsers();

    console.log(allUser);

    return (
        <section className="container mx-auto md:my-6 my-5 md:p-0 p-2">
            <h2 className="md:text-2xl text-xl font-semibold">Manage Users</h2>

            <DataTable data={allUser.users} columns={columns} />
        </section>
    );
}
