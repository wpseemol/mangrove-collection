import { Suspense } from "react";

import Account from "./account";
import { Cart } from "./cart";
import FullScreenWraper from "./full-screen-wraper";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import NavOrderMenu from "./nav-order-menu";
import { Offer } from "./offer";
import { Search } from "./search";

export default async function FullScreen() {
     return (
          <nav className="hidden md:block">
               <FullScreenWraper className="border-b border-black py-2 ">
                    <ul
                         className="container mx-auto flex justify-evenly items-center"
                         style={{
                              margin: "0 auto",
                         }}
                    >
                         {/* logo  */}
                         <Logo />

                         {/* search  */}
                         <Search />

                         {/* offer */}
                         <Offer />

                         {/* card */}
                         <Cart />

                         {/* my order */}
                         <NavOrderMenu />

                         {/* account */}
                         <Suspense fallback={<p>loading...</p>}>
                              <Account />
                         </Suspense>
                    </ul>
               </FullScreenWraper>

               <div className="border-b border-black/15 shadow-2xs">
                    <ul
                         className="w-fit text-base font-medium flex justify-center items-center mx-auto gap-5 "
                         style={{
                              margin: "0 auto",
                         }}
                    >
                         <NavMenu />
                    </ul>
               </div>
          </nav>
     );
}
