interface FilterSearchParamType {
    category?: string;
    price?: string;
    size?: string;
}

interface PriceObjType {
    minPrice: number | null;
    maxPrice: number | null;
}

export type { FilterSearchParamType, PriceObjType };
