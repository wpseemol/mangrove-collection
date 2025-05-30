import { getOrderProducts } from "@/lib/server/order-confirm";
import { OrderProductType } from "@/types/my-order";
import EmptyProducts from "./empty-product";
import OrderAddressBookComponent from "./order-address-book-component";
import OrderTable from "./order-table";

export default async function MyOrderPageContent({
     searchParams,
}: {
     searchParams: SearchParams;
}) {
     if (!searchParams?.section) {
          const orderProductsString = await getOrderProducts();

          if (!orderProductsString) {
               return <EmptyProducts />;
          }

          const orderProducts = JSON.parse(
               orderProductsString
          ) as OrderProductType[];

          return (
               /**
                * base url without search params
                */
               <>
                    <OrderTable orderProducts={orderProducts} />
               </>
          );
     }
     if (searchParams.section === "address-book") {
          return <OrderAddressBookComponent />;
     }

     return <>Not found.</>;
}

interface SearchParams {
     section?: string;
}
