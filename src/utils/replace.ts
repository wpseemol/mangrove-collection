import { Types } from 'mongoose';

/**
 * This function takes an array of objects with a MongoDB ObjectId and replaces the _id field with id.
 * @param array - Array of objects containing MongoDB ObjectId
 * @returns Array of objects with _id replaced by id
 */

export function replaceMongoIds<T extends { _id: unknown }>(
    array: T[]
): (Omit<T, '_id'> & { id: string })[] {
    return array.map((item) => {
        const { _id, ...rest } = item;
        return {
            id: (_id as Types.ObjectId).toString(),
            ...rest,
        };
    });
}