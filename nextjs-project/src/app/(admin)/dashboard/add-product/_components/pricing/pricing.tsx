import { AddProductFormType } from "@/types/add-products";
import PriceUnitSelect from "./price-currency";
import PriceFiled from "./price-filed";

export default function Pricing({
     form,
     isFormReset,
}: {
     form: AddProductFormType;
     isFormReset: boolean;
}) {
     return (
          <>
               <div className="mb-4">
                    <PriceUnitSelect form={form} />
               </div>
               <div className="mb-4">
                    <PriceFiled form={form} isFormReset={isFormReset} />
               </div>
          </>
     );
}
