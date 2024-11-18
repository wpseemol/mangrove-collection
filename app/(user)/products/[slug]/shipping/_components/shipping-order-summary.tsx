import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ShippingOrderSummary() {
    return (
        <Card className="p-3">
            <CardHeader className="p-0 space-y-0 mb-3 font-medium">
                Promotion
            </CardHeader>
            {/* voucher code apply */}
            <CardContent className="p-0 space-y-0">
                <div className="flex items-center gap-2 mb-3">
                    <Input
                        className="h-10"
                        type="text"
                        placeholder="Enter Voucher Code"
                    />{' '}
                    <Button>APPLY</Button>
                </div>
            </CardContent>
            {/* voucher code apply */}

            <CardHeader className="p-0 space-y-0 mb-3 font-medium">
                Order Summary
            </CardHeader>
            <CardContent className="p-0 space-y-2">
                <div className="flex justify-between items-center gap-2 mb-1">
                    <h3>Items Total (2 Items)</h3>
                    <p>
                        <span>&#2547;</span>
                        {10.0}
                    </p>
                </div>
                <div className="flex justify-between items-center gap-2 mb-1">
                    <h3>Delivery Fee</h3>
                    <p>
                        <span>&#2547;</span>
                        {10.0}
                    </p>
                </div>
                <div className="flex justify-between items-center gap-2 mb-1">
                    <h3>Shipping discount and voucher</h3>
                    <p>
                        <span>&#2547;</span>
                        {10.0}
                    </p>
                </div>
                <hr />

                <div className="flex justify-between items-center gap-2 my-3">
                    <h3>Total:</h3>
                    <p>
                        <span>&#2547;</span>
                        {10.0}
                    </p>
                </div>
                <h5 className="text-xs text-right">
                    VAT included, where applicable
                </h5>
            </CardContent>
            <Button className="w-full mt-1">Proceed to Pay</Button>
        </Card>
    );
}
