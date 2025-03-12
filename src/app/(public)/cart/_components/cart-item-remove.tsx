import { useCartProducts } from '@/hooks';
import { Row } from '@tanstack/react-table';
import { FaTrash } from 'react-icons/fa6';
import { CartProductsType } from './cart-product-table';

export default function CartItemRemove({
    row,
}: {
    row: Row<CartProductsType>;
}) {
    const { setCartProducts } = useCartProducts();

    const productId = row.original.id;
    function handelRemove() {
        setCartProducts((prevData) =>
            prevData.filter((item) => item.id !== productId)
        );

        console.log('click deletet');
    }

    return (
        <div className="text-right font-medium pr-12">
            <button onClick={handelRemove} className="">
                <FaTrash className="text-red-600/80 group-hover:scale-125 duration-200" />
            </button>
        </div>
    );
}
