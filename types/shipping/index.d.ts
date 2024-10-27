export interface ShippingContextType {
    shipping: Shipping[] | null;
    setShipping: Dispatch<SetStateAction<Shipping[] | null>>;
}

export type Shipping = {
    productId: string;
    count: number;
};
