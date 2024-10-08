'use client';

import { LoadingIcon } from '@/components/button-loading';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { ADMIN, CREATOR, USER } from '@/lib/constant-value';
import { BaseUserType } from '@/types/mongoose-models';
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';
import { Row } from '@tanstack/react-table';
import { useSession } from 'next-auth/react';
import * as React from 'react';

type Checked = DropdownMenuCheckboxItemProps['checked'];

export default function RoleDropdown({ row }: { row: Row<BaseUserType> }) {
    const roleValue: string = row.getValue('role');
    const userId: string = row.original.id;
    const [userRole, setUserRole] = React.useState(roleValue);
    const [loading, setLoading] = React.useState<boolean>(false);
    const { data: session, status } = useSession();

    const roleArray = [ADMIN, CREATOR, USER];
    const isLoginUser =
        userId !== session?.user.id && status === 'authenticated';

    async function handelRoleChange(userId: string, role: string) {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role }),
            });

            if (!response.ok) {
                const error = await response.json();
                // console.log('role-dropdown:', error);
                throw new Error(error.message || 'Failed to update user role.');
            }

            const updatedUser = await response.json();
            // console.log('role-dropdown:', updatedUser);

            toast({
                variant: 'success',
                description: JSON.stringify(updatedUser.message),
            });
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    variant: 'destructive',
                    description: error.message,
                });
            } else {
                // Handle unexpected error types
                toast({
                    variant: 'destructive',
                    description: 'An unexpected error occurred.',
                });
            }
        } finally {
            setLoading(false);
        }
    }

    return loading || status === 'loading' ? (
        <Button
            disabled={loading}
            variant="ghost"
            className="focus-visible:ring-0 focus-visible:ring-white/0 capitalize">
            {loading ? (
                <LoadingIcon className="dark:text-white text-black" />
            ) : (
                userRole
            )}
        </Button>
    ) : (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="focus-visible:ring-0 focus-visible:ring-white/0 capitalize">
                    {userRole}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="capitalize">
                    {isLoginUser
                        ? 'Select User Role'
                        : "You Can't Change Own role"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roleArray.map((role) => (
                    <DropdownMenuCheckboxItem
                        key={role}
                        checked={userRole === role}
                        onCheckedChange={() => {
                            if (isLoginUser) {
                                setUserRole(role);
                                handelRoleChange(userId, role);
                            }
                        }}
                        className={`${
                            isLoginUser ? '' : 'cursor-not-allowed'
                        } capitalize`}>
                        {role}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
