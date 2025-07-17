import { Types } from "mongoose";

/**
 * This function takes an array of objects with a MongoDB ObjectId and replaces the _id field with id.
 * @param arrayobj - Array of objects containing MongoDB ObjectId
 *
 * @returns Array of objects with _id replaced by id
 */

export function replaceMongoIds<T extends { _id: unknown }>(
     obj: T | T[] | null
):
     | (Omit<T, "_id"> & { id: unknown })
     | (Omit<T, "_id"> & { id: unknown })[]
     | null {
     if (!obj) return null;

     if (Array.isArray(obj)) {
          return obj.map(({ _id, ...rest }) => ({
               id: (_id as Types.ObjectId).toString(),
               ...rest,
          }));
     }

     const { _id, ...rest } = obj;
     return { id: (_id as Types.ObjectId).toString(), ...rest };
}
