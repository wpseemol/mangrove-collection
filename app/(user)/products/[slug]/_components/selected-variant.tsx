import { VariantsType } from '@/types/mongoose-models';

interface SelectedVariantType {
    type: string;
    variants?: VariantsType[];
}

export default function SelectedVariant({
    type,
    variants,
}: SelectedVariantType) {
    return <div></div>;
}
