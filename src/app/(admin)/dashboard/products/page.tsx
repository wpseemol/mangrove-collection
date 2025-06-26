import { getProductManage } from "@/lib/actions/products/get-product-manage";

export default async function ProductPage() {
     const products = await getProductManage();
     return (
          <main>
               <h1 className="text-2xl font-bold">Products</h1>
               {JSON.stringify(products)}
          </main>
     );
}
