import { DataTableDemo } from './_component/user-table';

export default function UserPage() {
    return (
        <section className="container mx-auto md:my-6 my-5">
            <h2 className="md:text-2xl text-xl font-semibold">Manage Users</h2>
            <DataTableDemo />
        </section>
    );
}
