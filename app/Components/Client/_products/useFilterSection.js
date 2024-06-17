'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

let selectPrice = { min: '', max: '' };
let selectCategory = [];
export default function useFilterSection() {
    const searchParamsInstance = useSearchParams();
    const searchParams = new URLSearchParams(searchParamsInstance);
    const category = searchParams.get('category');
    const price = searchParams.get('price');
    const selectSize = searchParams.get('size');
    const router = useRouter();
    const pathName = usePathname();

    if (category) {
        const decodedCategory = decodeURI(category);
        selectCategory = decodedCategory.split('|');
    } else {
        selectCategory = [];
    }

    if (price) {
        const priceDefaultArray = price.split('-');
        selectPrice.min = priceDefaultArray[0];
        selectPrice.max = priceDefaultArray[1];
    } else {
        selectPrice = { min: '', max: '' };
    }

    function handelChange(event, type) {
        const name = event.target.name;
        if (type === 'categories') {
            const checked = event.target.checked;

            if (checked) {
                selectCategory.push(name);
            } else {
                const filter = selectCategory.filter(
                    (category) => category !== name
                );
                selectCategory = filter;
            }

            if (selectCategory.length > 0) {
                searchParams.set(
                    'category',
                    encodeURI(selectCategory.join('|'))
                );
            } else {
                searchParams.delete('category');
            }
        } else if (type === 'price') {
            const value = event.target.value;

            if (name === 'min') {
                selectPrice.min = value;
            } else if (name === 'max') {
                selectPrice.max = value;
            }
            const { max, min } = selectPrice;

            if (max || min) {
                const pricePrams =
                    (min ? min : max ? '0' : '') + (max ? `-${max}` : '');

                searchParams.set('price', pricePrams);
            } else {
                searchParams.delete('price');
            }
        } else if (type === 'size') {
            const value = event.target.value;

            searchParams.set('size', value);
        }

        router.replace(`${pathName}?${searchParams.toString()}`);
    }

    return { handelChange, selectCategory, selectPrice, selectSize };
}
