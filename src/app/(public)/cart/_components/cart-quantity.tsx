import { useCartProducts } from '@/hooks';
import debounce from '@/utils/debounce';
import { Row } from '@tanstack/react-table';
import { CartProductsType } from './cart-product-table';

export default function CartQuantity({ row }: { row: Row<CartProductsType> }) {
    const { setCartProducts } = useCartProducts();
    const quantity = row.original.quantity;

    const productId = row.original.id;

    /**
     * set debounce function
     */
    const debouncedUpdateQuantity = debounce(
        async (id: string, updateQuantity: number) => {
            try {
                const response = await fetch(`/api/v1/cart/patch`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId: id,
                        quantity: updateQuantity,
                    }),
                });
                console.log('update response:', response);
                console.log('data:', await response.json());
            } catch (error) {
                console.error('Purchus Patch error:', error);
            }
        },
        350
    );

    const decrease = () => {
        if (quantity > 1) {
            const updateQuantity = quantity - 1;
            setCartProducts((prevData) => {
                if (!prevData) return null;
                return prevData.map((item) =>
                    item.id === productId
                        ? { ...item, quantity: updateQuantity }
                        : item
                );
            });

            debouncedUpdateQuantity(productId, updateQuantity);
        }
    };

    const increase = () => {
        const updateQuantity = quantity + 1;
        setCartProducts((prevData) => {
            if (!prevData) return null;
            return prevData.map((item) =>
                item.id === productId
                    ? { ...item, quantity: updateQuantity }
                    : item
            );
        });

        debouncedUpdateQuantity(productId, updateQuantity);
    };

    return (
        <div className="font-medium w-fit flex items-center space-x-4 border-t border-b rounded-lg ml-auto">
            <button
                disabled={!(quantity > 1)}
                onClick={decrease}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                <svg
                    className="w-4 h-4 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24">
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14"
                    />
                </svg>
            </button>
            <span>{quantity}</span>

            <button
                onClick={increase}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                <svg
                    className="w-4 h-4 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24">
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14m-7 7V5"
                    />
                </svg>
            </button>
        </div>
    );
}
