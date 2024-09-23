const key = 'cart-items';

export function setLocalStorage(productSlug: string): string[] | null {
    const cartItems = localStorage.getItem(key);

    let cartProductArray: string[] = [];
    if (cartItems) {
        cartProductArray = JSON.parse(cartItems);
        const isAlreadyExist = cartProductArray.includes(productSlug);
        if (!isAlreadyExist) cartProductArray.push(productSlug);
        if (isAlreadyExist) return null;
    } else {
        cartProductArray.push(productSlug);
    }
    localStorage.setItem(key, JSON.stringify(cartProductArray));

    return cartProductArray;
}

export function getLocalStorageValue(): string[] | null {
    const cartItems = localStorage.getItem(key);

    if (cartItems) {
        const cartItemArray: string[] = JSON.parse(cartItems);

        if (cartItemArray.length > 0) return cartItemArray;

        return null;
    }

    return null;
}

export function localStorageItemDelete(
    productSlug: string
): LocalStorageItemDelete {
    const cartItems = localStorage.getItem(key);

    let cartProductArray: string[] = [];
    if (cartItems) {
        cartProductArray = JSON.parse(cartItems);
        cartProductArray = cartProductArray.filter(
            (item) => item !== productSlug
        );
    } else {
        return null;
    }

    localStorage.setItem(key, JSON.stringify(cartProductArray));

    return {
        message: 'Successful cart item deleted',
        cartCountLength:
            cartProductArray.length > 0 ? cartProductArray.length : null,
        cartItemsArray: cartProductArray.length > 0 ? cartProductArray : null,
        deletedProductSlug: productSlug,
    };
}

export function localStorageMultiDelete(
    deleteSlugs: string[]
): LocalStorageMultiDelete {
    const cartItems = localStorage.getItem(key);

    if (cartItems) {
        const cartProductArray: string[] = JSON.parse(cartItems);

        const afterDeleted: string[] = cartProductArray.filter(
            (item) => !deleteSlugs.includes(item)
        );

        localStorage.setItem(key, JSON.stringify(afterDeleted));

        return {
            message: `Delete ${deleteSlugs.length} items deleted.`,
            deleteCount: deleteSlugs.length,
            deleteItem: deleteSlugs,
            afterDeleteItem: afterDeleted.length > 0 ? afterDeleted : null,
            afterDeleteItemCount:
                afterDeleted.length > 0 ? afterDeleted.length : null,
        };
    }
    return null;
}

type LocalStorageItemDelete = {
    message: string;
    cartCountLength: number | null;
    cartItemsArray: string[] | null;
    deletedProductSlug: string;
} | null;

type LocalStorageMultiDelete = {
    message: string;
    deleteItem: string[];
    afterDeleteItem: string[] | null;
    afterDeleteItemCount: null | number;
    deleteCount: number;
} | null;
