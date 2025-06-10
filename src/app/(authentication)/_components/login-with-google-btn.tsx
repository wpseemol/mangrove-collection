"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoginWithGoogleBtn() {
     const [loading, setLoading] = useState(false);
     const searchParams = useSearchParams();
     const code = searchParams.get("code");
     const router = useRouter();

     async function handleGoogleLogin() {
          setLoading(true);
          try {
               // Implement Google login logic here
               await signIn("google", {
                    redirect: true,
                    callbackUrl: "/",
               });
               console.log("Google login initiated");
          } catch (error) {
               console.error("Error during Google login:", error);
          } finally {
               setLoading(false);
          }
     }

     useEffect(() => {
          if (searchParams.has("code")) {
               toast.error(code);
               setTimeout(() => {
                    router.push("/login");
               }, 1500);
          }
     }, [code, searchParams, router]);

     return (
          <Button
               onClick={handleGoogleLogin}
               variant="outline"
               className="w-full mt-4 group border-gray-200 cursor-pointer disabled:cursor-wait"
          >
               <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    className="mr-2 inline-block align-middle group-hover:scale-125 duration-300"
               >
                    <g>
                         <path
                              fill="#4285F4"
                              d="M21.805 10.023h-9.18v3.955h5.262c-.227 1.18-1.36 3.463-5.262 3.463-3.166 0-5.75-2.62-5.75-5.841s2.584-5.841 5.75-5.841c1.803 0 3.014.768 3.708 1.426l2.537-2.474C17.13 3.67 15.13 2.75 12.625 2.75c-5.02 0-9.09 4.07-9.09 9.09s4.07 9.09 9.09 9.09c5.24 0 8.715-3.68 8.715-8.88 0-.597-.067-1.057-.16-1.527z"
                         />
                         <path
                              fill="#34A853"
                              d="M3.545 7.68l3.25 2.384c.89-1.73 2.59-2.934 4.58-2.934 1.303 0 2.48.447 3.4 1.32l2.537-2.474C15.13 3.67 13.13 2.75 10.625 2.75c-2.99 0-5.58 1.72-7.08 4.23z"
                         />
                         <path
                              fill="#FBBC05"
                              d="M12.625 21.25c2.43 0 4.47-.8 5.96-2.18l-2.75-2.25c-.77.52-1.76.83-3.21.83-2.47 0-4.56-1.67-5.31-3.93l-3.23 2.49c1.49 2.51 4.08 4.04 7.54 4.04z"
                         />
                         <path
                              fill="#EA4335"
                              d="M21.805 10.023h-9.18v3.955h5.262c-.227 1.18-1.36 3.463-5.262 3.463-3.166 0-5.75-2.62-5.75-5.841s2.584-5.841 5.75-5.841c1.803 0 3.014.768 3.708 1.426l2.537-2.474C17.13 3.67 15.13 2.75 12.625 2.75c-5.02 0-9.09 4.07-9.09 9.09s4.07 9.09 9.09 9.09c5.24 0 8.715-3.68 8.715-8.88 0-.597-.067-1.057-.16-1.527z"
                              opacity=".1"
                         />
                    </g>
               </svg>
               {loading ? "Logging in..." : "Login with Google"}
          </Button>
     );
}
