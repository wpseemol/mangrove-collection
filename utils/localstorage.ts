export default function setLocalStorage(cartItemId: string) {
    const key = 'cart-items';

    const cartItems = localStorage.getItem(key);

    let cartProductArray: string[] = [];
    if (cartItems) {
        cartProductArray = JSON.parse(cartItems);
        const isAlreadyExist = cartProductArray.includes(cartItemId);

        console.log('is already exist:', isAlreadyExist);

        !isAlreadyExist && cartProductArray.push(cartItemId);
    } else {
        cartProductArray.push(cartItemId);
    }
    localStorage.setItem(key, JSON.stringify(cartProductArray));

    console.log('set local storage:', cartItems);
}
