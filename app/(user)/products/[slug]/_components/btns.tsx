import { Button } from '@/components/ui/button';

export default function BuyAndCardBtn() {
    return (
        <div className="flex items-center flex-wrap gap-x-2 w-full">
            <Button
                variant="default"
                size="sm"
                className="text-neutral-100 hover:bg-primary-foreground px-5">
                Buy Now
            </Button>{' '}
            <Button variant="outline" size="sm" className="px-5 ">
                Add to Cart
            </Button>
        </div>
    );
}
