'use client';

import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { ComponentProps } from 'react';

export default function CartButton({
    productId,
    className,
    children,
    variant,
    size,
}: CartButtonType) {
    const { data, status } = useSession();

    async function handelCart(productId: string) {
        const isLogin = !!data?.user;
        const loginUserId = data?.user.id;

        if (isLogin) {
            /**
             * User is logged in.
             * mongodb model login user cart item keep.
             */
        } else {
            /**
             * User is not logged in.
             * cart item keep local storage.
             */
        }

        console.log('user is login', isLogin);
        console.log('login userId', loginUserId);
    }

    return (
        <Button
            onClick={() => productId && handelCart(productId)}
            variant={variant}
            size={size}
            className={className}>
            {children}
        </Button>
    );
}

type ButtonVariant = ComponentProps<typeof Button>['variant'];
type ButtonSize = ComponentProps<typeof Button>['size'];

type CartButtonType = {
    productId?: string;
    className?: string;
    children: string | React.ReactNode;
    variant?: ButtonVariant; // Using the extracted variant type
    size?: ButtonSize; // Using the extracted size type
};
