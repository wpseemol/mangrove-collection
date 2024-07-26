'use client';
import { FormControl, FormLabel } from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function PriceUnitSelect() {
    return (
        <div className="mt-2">
            <FormLabel className="mb-1">Currency*</FormLabel>
            <Select
            //onValueChange={}
            // defaultValue={}
            >
                <FormControl>
                    <SelectTrigger
                        className="bg-transparent border border-neutral-500/20
                    p-2 focus:outline-none min-w-44 focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]">
                        <SelectValue placeholder={`Select currency.`} />
                    </SelectTrigger>
                </FormControl>
                <SelectContent
                    className="bg-[#f0f1f7] dark:bg-[#252729]
                border border-neutral-500/20
                p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]
                ">
                    <SelectItem value="taka">&#2547; টাকা</SelectItem>
                    <SelectItem value="dollar">&#36; Dollar</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
