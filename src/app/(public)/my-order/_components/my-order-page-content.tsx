import AddNewAddressForm from './add-new-address-form';

export default async function MyOrderPageContent({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    if (!searchParams?.section) {
        return (
            /**
             * base url without search params
             */
            <>My order page</>
        );
    }
    if (searchParams.section === 'address-book') {
        return <>this address book: </>;
    }
    if (searchParams.section === 'add-new-address') {
        return <AddNewAddressForm />;
    }
    return <>Not found.</>;
}

interface SearchParams {
    section?: string;
}
