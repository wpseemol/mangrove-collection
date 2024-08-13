import { Card, CardContent } from '@/components/ui/card';
import { ProductType } from '@/types/mongoose-models';
export default function ProductCard({ details }: { details: ProductType }) {
    return (
        <>
            <Card className="sm:w-[221px] h-[321px] w-[260px]  justify-self-center">
                <CardContent>
                    <h2>{details.name}</h2>
                </CardContent>
            </Card>
        </>
    );
}
