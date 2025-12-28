import { createHomePageDetails } from "@/lib/actions/home-page-details";


export default function AddProductLoading() {
     return (
          <>
               <form action={createHomePageDetails}>

                    <button type="submit">create page details</button>
               </form>
          </>
     );
}
