import { getAddressBookData } from "@/lib/server/address-book";
import AddressBookTable from "./address-book-table";
import EmptyAddressBook from "./empty-address-book";

export default async function OrderAddressBookComponent() {
     const response = await getAddressBookData();

     if (!response) {
          return <EmptyAddressBook />;
     }

     const addressBook = JSON.parse(response) as AddressBook;

     if (addressBook.addresses.length < 1) {
          return <EmptyAddressBook />;
     }

     return <>{addressBook && <AddressBookTable data={addressBook} />}</>;
}

interface Address {
     name: string;
     email: string | null;
     phone: string;
     landmark?: string;
     region: string | null;
     city: string | null;
     fullAddress: string;
     isSelected: boolean;
     zone: string | null;
}

interface AddressBook {
     id: string;
     userId?: string | null;
     addresses: Address[];
}
