import { columns, data } from './_component/columns';
import { DataTable } from './_component/data-table';

export default function UsersPage() {
    return (
        <section className="container mx-auto md:my-6 my-5 md:p-0 p-2">
            <h2 className="md:text-2xl text-xl font-semibold">Manage Users</h2>
            {/* <DataTableDemo /> */}
            <DataTable data={data} columns={columns} />
        </section>
    );
}
