'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { BaseUserType } from '@/types/mongoose-models';
import { ColumnDef } from '@tanstack/react-table';
import RoleDropdown from './role-dropdown';
import UserAvatar from './user-avatar';

export const columns: ColumnDef<BaseUserType>[] = [
    {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }) => {
            const pictures: string | undefined | null = row.getValue('image');
            const userNames: string = row.getValue('fullName');

            return <UserAvatar imgUrl={pictures} fullName={userNames} />;
        },
    },
    {
        accessorKey: 'fullName',
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
        cell: ({ row }) => {
            return <RoleDropdown row={row} />;
        },
    },
];
