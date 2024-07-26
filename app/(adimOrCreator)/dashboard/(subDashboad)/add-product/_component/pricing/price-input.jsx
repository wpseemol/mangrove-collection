import { Input } from '@/components/ui/input';

export default function PriceInput({ form, onChangeValue }) {
    function handelPriceInput(event) {
        onChangeValue(parseInt(event.target.value));
    }

    return (
        <>
            <Input
                type="number"
                onChange={handelPriceInput}
                className=" bg-transparent border border-neutral-500/20
                p-2 focus:outline-none focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                placeholder="Product price"
            />
        </>
    );
}
