'use client';

import logoutAction from '@/action/logout';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { ComponentProps, useState } from 'react';
import ButtonLoading from './button-loading';

export default function LogoutButton({
    className,
    children,
    variant,
    size,
    loadingComponent = null,
}: CartButtonType) {
    const [loading, setLoading] = useState<boolean>(false);

    async function handelLogout() {
        setLoading(true);
        try {
            await logoutAction();
            await signOut({ redirect: false });
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }

    let loadingIconComponent: React.ReactNode | string = <ButtonLoading />;

    if (loadingComponent) {
        loadingIconComponent = loadingComponent;
    }
    return (
        <Button
            onClick={handelLogout}
            variant={variant}
            size={size}
            className={className}>
            {children}
            <>{loading && loadingIconComponent}</>
        </Button>
    );
}

type ButtonVariant = ComponentProps<typeof Button>['variant'];
type ButtonSize = ComponentProps<typeof Button>['size'];

type CartButtonType = {
    className?: string;
    children: string | React.ReactNode;
    loadingComponent?: string | React.ReactNode | null;
    variant?: ButtonVariant; // Using the extracted variant type
    size?: ButtonSize; // Using the extracted size type
};
