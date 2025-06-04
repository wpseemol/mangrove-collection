"use client";

import ButtonLoading from "@/components/button-loading";
import { Button } from "@/components/ui/button";
import {
     Form,
     FormControl,
     FormField,
     FormItem,
     FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { loginSchema } from "@/lib/schemas/zod/login-schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { PiEyeClosedDuotone, PiEyeDuotone } from "react-icons/pi";
import { z } from "zod";

export default function LoginForm() {
     const [showPassword, setShowPassword] = useState(false);
     const form = useForm<z.infer<typeof loginSchema>>({
          resolver: zodResolver(loginSchema),
          defaultValues: {
               email: "",
               password: "",
          },
     });

     // 2. Define a submit handler.
     async function onSubmit(values: z.infer<typeof loginSchema>) {
          console.log("Form submitted with values:", values);
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
                                        {form.formState.isSubmitting ? (
                                             <>
                                                  <ButtonLoading />
                                                  Signing in...
                                             </>
                                        ) : (
                                             "Sign In"
                                        )}
                                   </Button>
                              </div>
                         </div>
                    </form>
               </Form>
          </>
     );
}

type PasswordFieldProps = {
     form: UseFormReturn<z.infer<typeof loginSchema>>;
};

function PasswordField({ form }: PasswordFieldProps) {
     const [isHidden, setIsHidden] = useState(false);

     return (
          <>
               <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                         <FormItem className="relative">
                              <FormControl>
                                   <Input
                                        id="password"
                                        type={isHidden ? "text" : "password"}
                                        {...field}
                                        className="w-full bg-transparent border border-neutral-500/20
                                            p-3 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                                        placeholder={
                                             isHidden ? "Password" : "********"
                                        }
                                   />
                              </FormControl>
                              <span
                                   onClick={() => setIsHidden((prev) => !prev)}
                                   className="absolute right-4 top-1"
                              >
                                   {isHidden ? (
                                        <PiEyeDuotone />
                                   ) : (
                                        <PiEyeClosedDuotone />
                                   )}
                              </span>
                              <FormMessage className="text-red-500">
                                   {fieldState.error?.message}
                              </FormMessage>
                         </FormItem>
                    )}
               />
          </>
     );
}
