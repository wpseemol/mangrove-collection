'use client';

import { UserType } from '@/types/auth';
import { CategoryType } from '@/types/mongoose-models';

export default function AddProduct({
    allCategory,
    user,
}: {
    allCategory: CategoryType;
    user: UserType;
}) {
    return (
        <div>
            <p>this is add product component</p>
        </div>
    );
}
