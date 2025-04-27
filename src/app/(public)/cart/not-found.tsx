"use client";
import CartEmpty from "./_components/cart-empty";

export default function CartProductNotFound() {
     return (
          <main className="container mx-auto min-h-[calc(100vh-25.45rem)] flex flex-col justify-center">
               <CartEmpty />
          </main>
     );
}
