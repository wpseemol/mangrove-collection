export function CurrencyIcon({ currency }: { currency: string }) {
    switch (currency) {
        case 'taka':
            return <span>&#2547;</span>;
        case 'dollar':
            return <span>&#36;</span>;

        default:
            return <></>;
    }
}
