'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useCart } from '@/hooks';
import { setLocalStorage } from '@/utils/localstorage';
import { useSession } from 'next-auth/react';
import { ComponentProps, useState } from 'react';
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
    const { data, status } = useSession();

    const { setCart, cart } = useCart();

    const isAlreadyInCart = cart.cartItems?.includes(productId as string);

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

                const cartItemsArray = setLocalStorage(productId);
                setCart((prev) => ({
                    ...prev,
                    cartCount: cartItemsArray.length,
                }));
                if (cartItemsArray.includes(productId)) {
                    /**
                     * Product cart already Exist.
                     */
                    toast({
                        variant: 'destructive',
                        description: 'Product is already cart list.',
                    });
                } else {
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
