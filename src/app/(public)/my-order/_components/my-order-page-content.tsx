import { getOrderProducts } from "@/lib/server/order-confirm";
import { OrderProductType } from "@/types/my-order";
import AddNewAddressForm from "./add-new-address-form";
import EmptyProducts from "./empty-product";
import OrderAddressBookComponent from "./order-address-book-component";
import OrderTable from "./order-table";

export default async function MyOrderPageContent({
     searchParams,
}: {
     searchParams: SearchParams;
}) {
     const orderProductsString = await getOrderProducts();
     const orderProducts = JSON.parse(
          orderProductsString
     ) as OrderProductType[];

     if (!searchParams?.section) {
          return (
               /**
                * base url without search params
                */
               <>
                    {orderProductsString ? (
                         <OrderTable orderProducts={orderProducts} />
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
