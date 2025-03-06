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
    obj: T | T[] | null
):
    | (Omit<T, '_id'> & { id: unknown })
    | (Omit<T, '_id'> & { id: unknown })[]
    | null {
    if (!obj) return null;

    if (Array.isArray(obj)) {
        return obj.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
    }

    const { _id, ...rest } = obj;
    return { id: _id, ...rest };
}
