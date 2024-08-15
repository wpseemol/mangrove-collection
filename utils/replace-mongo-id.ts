import {
    ReplaceMongoIdAccepted,
    ReplaceMongoIdReturn,
} from '@/types/mongoose-models';

export default function replaceMongoId(
    arr: ReplaceMongoIdAccepted
): ReplaceMongoIdReturn {
    const modify = arr
        ?.map((obj) => {
            return { id: obj._id.toString(), ...obj };
        })
        .map(({ _id, ...rest }) => rest);

    return modify;
}
