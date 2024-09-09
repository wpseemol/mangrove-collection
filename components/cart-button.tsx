'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useCart } from '@/hooks';
import { setLocalStorage } from '@/utils/localstorage';
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
    const { cart, setCart } = useCart();

    async function handelCart(productId: string) {
        setLoading(true);
        try {
            if (!!data?.user) {
                /**
                 * if user is login
                 */
            }

            if (!data?.user) {
                /**
                 * user is not login
                 */

                const isSet = setLocalStorage(productId);

                if (isSet) {
                    setCart((prev) => ({
                        ...prev,
                        cartItems: isSet,
                        cartCount: isSet.length,
                    }));
                    // setIsAlreadyInCart(true);
                } else {
                    toast({
                        variant: 'destructive',
                        description: 'Product is already in cart.',
                    });
                }
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
    }, [cart.cartItems]);

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
