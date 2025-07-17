/**
 * all constant keep here
 *
 */
/**
 * purchase secret
 */
export const SECRET_KEY_PURCHASES = "DKFLKELKksjdfje2443jljdfssldkjf";

/**
 * purchases key.
 */
export const COOKIE_KEY_PURCHASES = "__purchase";

/**
 * address book secret
 */
export const SECRET_KEY_ADDRESS_BOOK = "DKFLKELKksjjfsdfasedujjw";
/**
 * address book key
 */
export const COOKIE_KEY_ADDRESS_BOOK = "__address_book";

/**
 * Admin const value ADMIN = "admin".
 */
export const ADMIN = "admin";
/**
 * Creator const value CREATOR = "creator".
 */
export const CREATOR = "creator";
/**
 * User Constant value USER = "user".
 */
export const USER = "user";

/**
 * Product units array. unit array nao [{ id: 'kg', title: 'KG' }, { id: 'pc', title: 'PC' }].,
 */
export const PRODUCT_UNITS = [
     { id: "kg", title: "KG" },
     { id: "pc", title: "PC" },
];

/**
 * Pc variants array it's. { id: 1, type: 'Size', value: 'size' }[],
 */
export const PC_VARIANTS = [
     { id: 1, type: "Color", value: "color" },
     { id: 2, type: "Size", value: "size" },
     { id: 3, type: "Material", value: "material" },
     { id: 4, type: "Style", value: "style" },
     { id: 5, type: "Title", value: "title" },
];

/**
 * Kg variants array variants. { id: 1, type: 'Size', value: 'size' }[].
 */
export const KG_VARIANTS = [{ id: 1, type: "Size", value: "size" }];

/**
 * Price unit array.
 */
export const PRICE_CURRENCY = [
     { id: "taka", title: "&#2547; টাকা" },
     { id: "dollar", title: "&#36; Dollar" },
];

/**
 * This constant defines the key used to store the unique user identifier
 * in cookies. It helps in tracking the user's session or other user-specific
 * data across the application.
 *
 * @constant {string} COOKIE_USER_ID - The key used for storing the unique user ID in cookies.
 */
export const COOKIE_USER_ID = "_unique_id";
