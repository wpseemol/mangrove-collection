export interface ShippingContextType {
    shipping: shipping;
    setShipping: Dispatch<SetStateAction<Shipping[] | null>>;
}

export type Shipping = {
    productId: string;
    count: number;
};
