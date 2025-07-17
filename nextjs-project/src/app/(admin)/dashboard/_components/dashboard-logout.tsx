"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function DashboardLogout({
     isDryerClose,
}: {
     isDryerClose: boolean;
}) {
     const [loading, setLoading] = useState<boolean>(false);

     async function handelLogout() {
          setLoading(true);
          try {
               await signOut({ redirect: true, redirectTo: "/" });
          } catch (error) {
               console.log("logout error:", error);
          } finally {
               setLoading(false);
          }
     }

     return (
          <div className="flex justify-center">
               <button
                    disabled={loading}
                    onClick={handelLogout}
                    className="flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-800/80 p-3 rounded font-bold hover:text-primary-foreground disabled:cursor-not-allowed"
               >
                    <span className={`${isDryerClose ? "hidden" : ""} `}>
                         Logout
                    </span>

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
               </button>
          </div>
     );
}
