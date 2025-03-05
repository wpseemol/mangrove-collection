/**
 * Array to mongodb `_id` replace `id`
 */
export function replaceMongoIds<T extends { _id: unknown }>(
    array: T[]
): (Omit<T, '_id'> & { id: unknown })[] {
    return array.map((item) => {
        const { _id, ...rest } = item;
        return {
            id: _id,
            ...rest,
        };
    });
}
