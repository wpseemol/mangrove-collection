'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ADMIN, CREATOR, USER } from '@/lib/constant-value';
import { ManageUserType } from '@/types/users';
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';
import { Row } from '@tanstack/react-table';
import * as React from 'react';

type Checked = DropdownMenuCheckboxItemProps['checked'];

export default function RoleDropdown({ row }: { row: Row<ManageUserType> }) {
    const roleValue: string = row.getValue('role');
    const [userRole, setUserRole] = React.useState(roleValue);

    const roleArray = [ADMIN, CREATOR, USER];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="focus-visible:ring-0 focus-visible:ring-white/0 capitalize">
                    {userRole}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Select User Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roleArray.map((role) => (
                    <DropdownMenuCheckboxItem
                        key={role}
                        checked={userRole === role}
                        onCheckedChange={() => setUserRole(role)}
                        className="capitalize">
                        {role}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
