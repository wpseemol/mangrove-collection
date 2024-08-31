import {
    AllCategoryType,
    BaseUserType,
    CategoryWith_IdCount,
    CategoryWithCountType,
    CategoryWithMongo_Id,
    ProductType,
    ProductWithMongo_Id,
    UserWith_id,
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

/**
 * The `ReplaceMongoIdAccepted` type represents an array of objects that can be of type
 * `ProductWithMongo_Id`, `CategoryWithMongo_Id`, or `CategoryWith_IdCount`.
 */
export type ReplaceMongoIdAccepted = (
    | ProductWithMongo_Id
    | CategoryWithMongo_Id
    | CategoryWith_IdCount
    | UserWith_id
)[];

/**
 * The `ReplaceMongoIdReturn` type represents an array of objects that can be of type
 * `ProductType`, `AllCategoryType`, or `CategoryWithCountType`.
 */
type ReplaceMongoIdReturn = (
    | ProductType
    | AllCategoryType
    | CategoryWithCountType
    | BaseUserType
)[];
