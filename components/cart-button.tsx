'use client';

import { cartAction } from '@/action/cart-action';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks';
import { useSession } from 'next-auth/react';
import { ComponentProps, useEffect, useState } from 'react';
import ButtonLoading from './button-loading';

export default function CartButton({
    loadingComponent,
    productId,
    className,
    children,
    variant,
    size,
}: CartButtonType) {
    const [loading, setLoading] = useState<boolean>(false);
    const [isAlreadyInCart, setIsAlreadyInCart] = useState<boolean>(false);
    const { data, status } = useSession();

    const { setCart, cart } = useCart();

    async function handelCart(productId: string) {
        setLoading(true);
        try {
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
                await cartAction(productId);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }

        // console.log('user is login', isLogin);
        // console.log('login userId', loginUserId);
    }

    let loadingIconComponent: React.ReactNode | string = <ButtonLoading />;

    if (loadingComponent) {
        loadingIconComponent = loadingComponent;
    }

    useEffect(() => {
        if (cart.cartItems && productId) {
            const initial = cart.cartItems.includes(productId);

            setIsAlreadyInCart(initial);
        }
    }, []);

    return (
        <Button
            disabled={loading}
            onClick={() => productId && handelCart(productId)}
            variant={variant}
            size={size}
            className={className}>
            {isAlreadyInCart ? 'Added' : children}
            <>{loading && loadingIconComponent}</>
        </Button>
    );
}

type ButtonVariant = ComponentProps<typeof Button>['variant'];
type ButtonSize = ComponentProps<typeof Button>['size'];

type CartButtonType = {
    productId?: string;
    className?: string;
    children: string | React.ReactNode;
    loadingComponent?: string | React.ReactNode | null;
    variant?: ButtonVariant; // Using the extracted variant type
    size?: ButtonSize; // Using the extracted size type
};
