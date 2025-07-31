import ProductCard from "@/components/product-card";
import { getCategoryids } from "@/lib/actions/category";
import { getProducts } from "@/lib/actions/products";
import { GetProductsParamsType } from "@/types/product";
import { SearchParamsType } from "../page";
import ListViewProductCard from "./list-view-card";
import ProductViewChange from "./product-view-change";

export default async function ProductSection({
     searchParamsData,
}: {
     searchParamsData: SearchParamsType;
}) {
     const { category, price, size, search } = searchParamsData;

     const decodedCategory = decodeURI(category);
     const slugArray = decodedCategory.split("|");

     const categorisIds = await getCategoryids(slugArray);

     const searchParams = search ? decodeURI(search) : null;

     const params: GetProductsParamsType = {
          categorisIds: categorisIds.length > 0 ? categorisIds : null,
          price: price ? price : null,
          size: size ? size : null,
          search: searchParams,
     };

     const products = await getProducts(params);

     return (
          <ProductViewChange
               isEmpty={products.length === 0 || !products}
               listViewCard={products.map((product) => (
                    <ListViewProductCard key={product.id} details={product} />
               ))}
          >
               {products.map((product) => (
                    <ProductCard key={product.id} details={product} />
               ))}
          </ProductViewChange>
     );
}
