'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { RoleType } from '@/types/mongoose-models';
import { ColumnDef } from '@tanstack/react-table';
import UserAvatar from './user-avatar';

export const columns: ColumnDef<UserType>[] = [
    {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }) => {
            const pictures: string | undefined | null = row.getValue('image');
            const userNames: string = row.getValue('name');

            return <UserAvatar imgUrl={pictures} fullName={userNames} />;
        },
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Name"
                enableHiding={false}
            />
        ),
        enableHiding: false,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
    },
    {
        accessorKey: 'role',
        header: 'Role',
    },
];

export const data: UserType[] = [
    {
        id: 'slkdjoe',
        name: 'Seemol chakroborti',
        email: 'wpseemol@gmail.com',
        role: 'admin',
        image: 'https://firebasestorage.googleapis.com/v0/b/mangrove-collection.appspot.com/o/product%2F09221a25-3687-4cbc-9883-8a7f02ea4b9e-pexels-pixabay-279906.jpg?alt=media&token=e33edbe2-2bbc-49eb-982d-b3cf618c3487',
    },
    {
        id: 'f3h7g6h5',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'user',
        image: 'https://firebasestorage.googleapis.com/v0/b/mangrove-collection.appspot.com/o/product%2F02966afc-dd66-403b-9a54-c032584a10cb-images.jpeg?alt=media&token=77681dfa-6186-4993-a463-36748dfe0586',
    },
    {
        id: 'k8j9l0k7',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'creator',
        image: null,
    },
    {
        id: 'm4n5o6p8',
        name: 'Emily Zhang',
        email: 'emily.zhang@example.com',
        role: 'admin',
    },
    {
        id: 'q1r2s3t4',
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        role: 'user',
    },
    {
        id: 'u7v8w9x0',
        name: 'Linda Garcia',
        email: 'linda.garcia@example.com',
        role: 'creator',
    },
    {
        id: 'a1b2c3d4',
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        role: 'user',
    },
    {
        id: 'e5f6g7h8',
        name: 'Bob Williams',
        email: 'bob.williams@example.com',
        role: 'creator',
    },
    {
        id: 'i9j0k1l2',
        name: 'Charlie Davis',
        email: 'charlie.davis@example.com',
        role: 'admin',
    },
    {
        id: 'm3n4o5p6',
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        role: 'user',
    },
    {
        id: 'q7r8s9t0',
        name: 'Eve Martinez',
        email: 'eve.martinez@example.com',
        role: 'creator',
    },
    {
        id: 'u1v2w3x4',
        name: 'Frank White',
        email: 'frank.white@example.com',
        role: 'admin',
    },
    {
        id: 'y5z6a7b8',
        name: 'Grace Lee',
        email: 'grace.lee@example.com',
        role: 'user',
    },
    {
        id: 'c9d0e1f2',
        name: 'Henry Kim',
        email: 'henry.kim@example.com',
        role: 'creator',
    },
    {
        id: 'g3h4i5j6',
        name: 'Isabel Brown',
        email: 'isabel.brown@example.com',
        role: 'admin',
    },
    {
        id: 'k7l8m9n0',
        name: 'Jack Miller',
        email: 'jack.miller@example.com',
        role: 'user',
    },
    {
        id: 'o1p2q3r4',
        name: 'Karen Wilson',
        email: 'karen.wilson@example.com',
        role: 'creator',
    },
    {
        id: 's5t6u7v8',
        name: 'Leo Thomas',
        email: 'leo.thomas@example.com',
        role: 'admin',
    },
    {
        id: 'w9x0y1z2',
        name: 'Mia Taylor',
        email: 'mia.taylor@example.com',
        role: 'user',
    },
    {
        id: 'a3b4c5d6',
        name: 'Nathan Clark',
        email: 'nathan.clark@example.com',
        role: 'creator',
    },
    {
        id: 'e7f8g9h0',
        name: 'Olivia Rodriguez',
        email: 'olivia.rodriguez@example.com',
        role: 'admin',
    },
    {
        id: 'i1j2k3l4',
        name: 'Paul Harris',
        email: 'paul.harris@example.com',
        role: 'user',
    },
    {
        id: 'm5n6o7p8',
        name: 'Quinn Lewis',
        email: 'quinn.lewis@example.com',
        role: 'creator',
    },
    {
        id: 'q9r0s1t2',
        name: 'Rachel Young',
        email: 'rachel.young@example.com',
        role: 'admin',
    },
    {
        id: 'u3v4w5x6',
        name: 'Sam Hall',
        email: 'sam.hall@example.com',
        role: 'user',
    },
    {
        id: 'y7z8a9b0',
        name: 'Tina Scott',
        email: 'tina.scott@example.com',
        role: 'creator',
    },
    {
        id: 'c1d2e3f4',
        name: 'Uma Wright',
        email: 'uma.wright@example.com',
        role: 'admin',
    },
    {
        id: 'g5h6i7j8',
        name: 'Victor Turner',
        email: 'victor.turner@example.com',
        role: 'user',
    },
    {
        id: 'k9l0m1n2',
        name: 'Wendy Baker',
        email: 'wendy.baker@example.com',
        role: 'creator',
    },
    {
        id: 'o3p4q5r6',
        name: 'Xander Green',
        email: 'xander.green@example.com',
        role: 'admin',
    },
    {
        id: 's7t8u9v0',
        name: 'Yara Adams',
        email: 'yara.adams@example.com',
        role: 'user',
    },
    {
        id: 'w1x2y3z4',
        name: 'Zachary Nelson',
        email: 'zachary.nelson@example.com',
        role: 'creator',
    },
];

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type UserType = {
    id: string;
    name: string;
    email: string;
    role: RoleType;
    image?: string | null;
};
