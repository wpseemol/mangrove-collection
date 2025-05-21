import AddressBookTable from "./address-book-table";
import EmptyAddressBook from "./empty-address-book";

export default async function OrderAddressBookComponent() {
     const addressBook = null;

     if (!addressBook || addressBook.length < 1) {
          return <EmptyAddressBook />;
     }

     return <>{addressBook && <AddressBookTable data={addressBook} />}</>;
}
