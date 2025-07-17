"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutBtn() {
     const [loading, setLoading] = useState(false);
     async function handleLogout() {
          setLoading(true);
          try {
               await signOut({ redirect: true, redirectTo: "/" });
               console.log("Logout initiated");
          } catch (error) {
               console.error("Error during logout:", error);
          } finally {
               setLoading(false);
          }
     }
     return (
          <>
               <Button
                    onClick={handleLogout}
                    disabled={loading}
                    size="lg"
                    className="text-white cursor-pointer disabled:cursor-wait"
               >
                    Logout
                    {loading ? (
                         <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                         >
                              <circle
                                   className="opacity-25"
                                   cx="12"
                                   cy="12"
                                   r="10"
                                   stroke="currentColor"
                                   strokeWidth="4"
                              />
                              <path
                                   className="opacity-75"
                                   fill="currentColor"
                                   d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              />
                         </svg>
                    ) : (
                         <svg
                              className="h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                         >
                              <path
                                   strokeLinecap="round"
                                   strokeLinejoin="round"
                                   d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                              />
                         </svg>
                    )}
               </Button>
          </>
     );
}
