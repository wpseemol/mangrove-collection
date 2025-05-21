import AddNewAddressForm from "./add-new-address-form";
import EmptyProducts from "./empty-product";
import OrderAddressBookComponent from "./order-address-book-component";

export default async function MyOrderPageContent({
     searchParams,
}: {
     searchParams: SearchParams;
}) {
     const orderProducts = null;

     if (!searchParams?.section) {
          return (
               /**
                * base url without search params
                */
               <>
                    {orderProducts ? (
                         // <OrderTable orderProducts={orderProducts} />
                         "Product table"
                    ) : (
                         <EmptyProducts />
                    )}
               </>
          );
     }
     if (searchParams.section === "address-book") {
          return <OrderAddressBookComponent />;
     }
     if (searchParams.section === "add-new-address") {
          return <AddNewAddressForm />;
     }
     return <>Not found.</>;
}

interface SearchParams {
     section?: string;
}
