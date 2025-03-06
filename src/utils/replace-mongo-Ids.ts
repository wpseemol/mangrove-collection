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

export function replaceMongodbId<T extends { _id: unknown }>(
    obj: T | null
): omit<T, '_id'> & { id: unknown } {
    if (!obj) return null;

    const { _id, ...rest } = obj;
    return { id: _id, ...rest };
}
