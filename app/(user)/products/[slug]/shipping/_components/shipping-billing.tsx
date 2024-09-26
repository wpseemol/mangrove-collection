import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ShippingBilling() {
    return (
        <Card className="mb-5">
            <CardHeader
                className="flex-row justify-between items-center bg-neutral-800/10 px-5 py-3 rounded-t 
            space-y-0 border-b">
                <h2 className="">Shipping & Billing</h2>
                <button className="uppercase font-medium">Add</button>
            </CardHeader>
            <CardContent className="px-5 py-3"></CardContent>
        </Card>
    );
}
