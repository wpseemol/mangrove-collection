const key = 'cart-items';

export function setLocalStorage(cartItemId: string): string[] {
    const cartItems = localStorage.getItem(key);

    let cartProductArray: string[] = [];
    if (cartItems) {
        cartProductArray = JSON.parse(cartItems);
        const isAlreadyExist = cartProductArray.includes(cartItemId);
        !isAlreadyExist && cartProductArray.push(cartItemId);
    } else {
        cartProductArray.push(cartItemId);
    }
    localStorage.setItem(key, JSON.stringify(cartProductArray));
    return cartProductArray;
}

export function getLocalStorageValue(): string[] | null {
    const cartItems = localStorage.getItem(key);
    if (cartItems) return JSON.parse(cartItems);

    return null;
}
