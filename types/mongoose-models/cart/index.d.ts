import mongoose from 'mongoose';

/**
 * Interface representing the base structure of a cart item.
 * It includes essential fields to track which user has added
 * which product to their cart, along with the timestamp of when
 * the product was added.
 *
 * @interface CartBase
 * @property {mongoose.Schema.Types.ObjectId} userId - The ID of the user who added the item to the cart.
 * @property {mongoose.Schema.Types.ObjectId} productId - The ID of the product added to the cart.
 * @property {Date} cartAt - The date and time when the product was added to the cart.
 */
export interface CartBase {
    userId: mongoose.Schema.Types.ObjectId;
    productId: mongoose.Schema.Types.ObjectId;
    cartAt: Date;
}

/**
 * Interface that extends CartBase by adding the MongoDB _id field.
 * This is used when dealing with documents that include the unique
 * identifier assigned by MongoDB.
 *
 * @interface CartWith_id
 * @extends CartBase
 * @property {mongoose.Schema.Types.ObjectId} _id - The unique identifier for the cart document in MongoDB.
 */
export interface CartWith_id extends CartBase {
    _id: mongoose.Schema.Types.ObjectId;
}

/**
 * Interface representing a cart item where the _id field is replaced with a string id.
 * This can be useful for frontend operations or when converting data to a more
 * client-friendly format.
 *
 * @interface CartType
 * @extends Omit<CartWith_id, '_id'>
 * @property {string} id - The unique identifier for the cart item, represented as a string.
 */
export interface CartType extends Omit<CartWith_id, '_id'> {
    id: string;
}
