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
import { Label } from "@/components/ui/label";

import { loginSchema } from "@/lib/schemas/zod/login-schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { PiEyeClosedDuotone, PiEyeDuotone } from "react-icons/pi";
import { z } from "zod";

export default function LoginForm() {
     const form = useForm<z.infer<typeof loginSchema>>({
          resolver: zodResolver(loginSchema),
          defaultValues: {
               email: "",
               password: "",
          },
     });

     // 2. Define a submit handler.
     async function onSubmit(values: z.infer<typeof loginSchema>) {
          try {
               await signIn("credentials", {
                    redirect: true,
                    redirectTo: "/",
                    ...values,
               });
          } catch (error) {
               console.error("Login error:", error);
          }
     }

     return (
          <>
               <Form {...form}>
                    <form
                         onSubmit={form.handleSubmit(onSubmit)}
                         className="grid gap-y-4 -mt-2"
                    >
                         {/* input email */}

                         <div className="grid gap-2">
                              <FormField
                                   control={form.control}
                                   name="email"
                                   render={({ field, fieldState }) => (
                                        <FormItem>
                                             <Label htmlFor="email">
                                                  Email
                                             </Label>

                                             <FormControl>
                                                  <Input
                                                       id="email"
                                                       type="email"
                                                       {...field}
                                                       className="w-full bg-transparent border border-neutral-500/20
                                            p-3 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                                                       placeholder="leroy@jenkins.com"
                                                  />
                                             </FormControl>
                                             <FormMessage className="text-red-500">
                                                  {fieldState.error?.message}
                                             </FormMessage>
                                        </FormItem>
                                   )}
                              />
                         </div>

                         {/* input email */}

                         {/* input password */}
                         <div className="grid gap-2">
                              {/* if forget password */}
                              <div className="flex items-center">
                                   <Label htmlFor="password">Password</Label>
                                   <Link
                                        href="#"
                                        className="ml-auto inline-block text-sm underline"
                                   >
                                        Forgot your password?
                                   </Link>
                              </div>
                              <PasswordField form={form} />
                         </div>

                         {/* input  password */}

                         <Button
                              disabled={form.formState.isSubmitting}
                              type="submit"
                              className="w-full text-white"
                         >
                              Login{" "}
                              {form.formState.isSubmitting && <ButtonLoading />}
                         </Button>
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
