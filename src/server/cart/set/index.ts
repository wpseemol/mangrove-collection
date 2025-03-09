'use server';

const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
export async function cartSetProduct(cartItem: CartItem) {
    try {
        const response = await fetch(`${baseUrl}api/v1/cart/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem),
        });

        // console.log('cart set product:', response);
        const responseData = await response.json();
        console.log('cart set product:', responseData);
    } catch (error) {
        console.log('add cart error:', error);
    }
}

interface CartItem {
    productId: string;
    quantity: number;
}
