"use client";

import ButtonLoading from "@/components/button-loading";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { signInServer } from "@/lib/actions/user";
import { loginSchema } from "@/lib/schemas/zod/login-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { z } from "zod";

export default function LoginForm() {
     const router = useRouter();

     const [showPassword, setShowPassword] = useState(false);
     const form = useForm<z.infer<typeof loginSchema>>({
          resolver: zodResolver(loginSchema),
          defaultValues: {
               email: "",
               password: "",
          },
     });

     /**
      * @param values - The values submitted from the form.
      * Handles the form submission logic.
      * This function can be used to send the login request to the server.
      */
     async function onSubmit(values: z.infer<typeof loginSchema>) {
          const response = await signInServer(JSON.stringify(values));
          if (!response?.success) {
               toast.error(
                    response.message || "Login failed. Please try again."
               );
               return;
          }

          if (response.success) {
               toast.success(response.message || "Login successful!");
               setTimeout(() => {
                    router.push("/");
               }, 1000);
               form.reset();
               return;
          }
     }

     return (
          <>
               <Form {...form}>
                    <form
                         onSubmit={form.handleSubmit(onSubmit)}
                         className="space-y-6"
                    >
                         <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
                              <div className="space-y-6">
                                   {/* Email Field */}
                                   <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field, fieldState }) => (
                                             <FormItem>
                                                  <label
                                                       htmlFor="email"
                                                       className="block text-sm font-medium text-gray-700 mb-1"
                                                  >
                                                       Email Address
                                                  </label>
                                                  <FormControl>
                                                       <input
                                                            id="email"
                                                            type="email"
                                                            {...field}
                                                            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-0  ${
                                                                 fieldState.error
                                                                      ? "border-red-500"
                                                                      : "border-gray-300"
                                                            }`}
                                                            placeholder="Enter your email"
                                                       />
                                                  </FormControl>
                                                  {fieldState.error
                                                       ?.message && (
                                                       <p className="mt-1 text-sm text-red-600 flex items-center">
                                                            <AlertCircle className="w-4 h-4 mr-1" />
                                                            {
                                                                 fieldState
                                                                      .error
                                                                      .message
                                                            }
                                                       </p>
                                                  )}
                                             </FormItem>
                                        )}
                                   />

                                   {/* Password Field */}
                                   <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field, fieldState }) => (
                                             <FormItem>
                                                  <div className="flex justify-between items-center">
                                                       <label
                                                            htmlFor="password"
                                                            className="block text-sm font-medium text-gray-700 mb-1"
                                                       >
                                                            Password
                                                       </label>
                                                       <button
                                                            type="button"
                                                            className="text-sm text-blue-600 hover:text-blue-500"
                                                            onClick={() => {
                                                                 /* Add forgot password logic */
                                                            }}
                                                       >
                                                            Forgot password?
                                                       </button>
                                                  </div>
                                                  <div className="relative">
                                                       <FormControl>
                                                            <input
                                                                 id="password"
                                                                 type={
                                                                      showPassword
                                                                           ? "text"
                                                                           : "password"
                                                                 }
                                                                 {...field}
                                                                 className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-0  ${
                                                                      fieldState.error
                                                                           ? "border-red-500"
                                                                           : "border-gray-300"
                                                                 }`}
                                                                 placeholder="Enter your password"
                                                            />
                                                       </FormControl>
                                                       <button
                                                            type="button"
                                                            onClick={() =>
                                                                 setShowPassword(
                                                                      !showPassword
                                                                 )
                                                            }
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                       >
                                                            {showPassword ? (
                                                                 <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                 <Eye className="w-4 h-4" />
                                                            )}
                                                       </button>
                                                  </div>
                                                  {fieldState.error
                                                       ?.message && (
                                                       <p className="mt-1 text-sm text-red-600 flex items-center">
                                                            <AlertCircle className="w-4 h-4 mr-1" />
                                                            {
                                                                 fieldState
                                                                      .error
                                                                      .message
                                                            }
                                                       </p>
                                                  )}
                                             </FormItem>
                                        )}
                                   />

                                   {/* Submit Button */}
                                   <Button
                                        type="submit"
                                        className="w-full text-white"
                                        disabled={form.formState.isSubmitting}
                                   >
                                        Sign In{" "}
                                        {form.formState.isSubmitting && (
                                             <ButtonLoading />
                                        )}
                                   </Button>
                              </div>
                         </div>
                    </form>
               </Form>
               <Toaster position="top-center" richColors closeButton />
          </>
     );
}
