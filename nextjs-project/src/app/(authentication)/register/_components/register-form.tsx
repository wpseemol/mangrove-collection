"use client";

import ButtonLoading from "@/components/button-loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { userRegister } from "@/lib/actions/user";
import { registerSchema } from "@/lib/schemas/zod/register-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function RegisterForm() {
     const [showPassword, setShowPassword] = useState(false);
     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
     const [passwordRequirements, setPasswordRequirements] =
          useState<PasswordRequirements | null>(null);

     const router = useRouter();

     const form = useForm<z.infer<typeof registerSchema>>({
          resolver: zodResolver(registerSchema),
          defaultValues: {
               fullname: "",
               email: "",
               phone: "",
               password: "",
               conformPass: "",
          },
     });

     /**
      * Handle form submission
      * This function will be called when the form is submitted and all validations pass.
      * You can replace the console.log with your actual form submission logic.
      */
     async function onSubmit(values: z.infer<typeof registerSchema>) {
          const response = await userRegister(JSON.stringify(values));
          if (!response.success) {
               toast.error(response.message || "Registration failed");
               return;
          }

          if (response.success) {
               console.log("Form submitted successfully response:", response);
               toast.success(response.message);
               setTimeout(() => {
                    router.push("/login");
               }, 2000);
               form.reset();
               return;
          }
     }

     /**
      * check password strength and requirements
      * - At least 8 characters
      * - At least one uppercase letter
      * - At least one lowercase letter
      * - At least one number
      * - At least one special character
      * This effect runs whenever the password value changes.
      */
     const passwordValue = form.watch("password");
     useEffect(() => {
          if (!passwordValue) return;

          const requirements: PasswordRequirements = {
               length: passwordValue.length >= 8,
               uppercase: /[A-Z]/.test(passwordValue),
               lowercase: /[a-z]/.test(passwordValue),
               number: /\d/.test(passwordValue),
               special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
          };

          const strength = Object.values(requirements).filter(Boolean).length;

          if (strength > 4) {
               setPasswordRequirements(null);
               return;
          }

          setPasswordRequirements(requirements);
     }, [passwordValue]);

     return (
          <>
               <Form {...form}>
                    <form
                         onSubmit={form.handleSubmit(onSubmit)}
                         className="space-y-6"
                    >
                         <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
                              <div className="space-y-6">
                                   {/* Full Name Field */}
                                   <FormField
                                        control={form.control}
                                        name="fullname"
                                        render={({ field, fieldState }) => (
                                             <FormItem>
                                                  <label
                                                       htmlFor="fullname"
                                                       className="block text-sm font-medium text-gray-700 mb-1"
                                                  >
                                                       Full Name
                                                  </label>
                                                  <FormControl>
                                                       <input
                                                            id="fullname"
                                                            type="text"
                                                            {...field}
                                                            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-0  ${
                                                                 fieldState.error
                                                                      ? "border-red-500"
                                                                      : "border-gray-300"
                                                            }`}
                                                            placeholder="Enter your full name"
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

                                   {/* Phone Field */}
                                   <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field, fieldState }) => (
                                             <FormItem>
                                                  <label
                                                       htmlFor="phone"
                                                       className="block text-sm font-medium text-gray-700 mb-1"
                                                  >
                                                       Phone Number
                                                  </label>
                                                  <FormControl>
                                                       <input
                                                            id="phone"
                                                            type="text"
                                                            {...field}
                                                            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-0  ${
                                                                 fieldState.error
                                                                      ? "border-red-500"
                                                                      : "border-gray-300"
                                                            }`}
                                                            placeholder="Enter your phone number"
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
                                                  <label
                                                       htmlFor="password"
                                                       className="block text-sm font-medium text-gray-700 mb-1"
                                                  >
                                                       Password
                                                  </label>
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

                                                  <PasswordStrengthIndicator
                                                       requirements={
                                                            passwordRequirements
                                                       }
                                                  />
                                             </FormItem>
                                        )}
                                   />

                                   {/* Confirm Password Field */}
                                   <FormField
                                        control={form.control}
                                        name="conformPass"
                                        render={({ field, fieldState }) => (
                                             <FormItem>
                                                  <label
                                                       htmlFor="conformPass"
                                                       className="block text-sm font-medium text-gray-700 mb-1"
                                                  >
                                                       Confirm Password
                                                  </label>
                                                  <div className="relative">
                                                       <FormControl>
                                                            <input
                                                                 id="conformPass"
                                                                 type={
                                                                      showConfirmPassword
                                                                           ? "text"
                                                                           : "password"
                                                                 }
                                                                 {...field}
                                                                 className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-0  ${
                                                                      fieldState.error
                                                                           ? "border-red-500"
                                                                           : "border-gray-300"
                                                                 }`}
                                                                 placeholder="Confirm your password"
                                                            />
                                                       </FormControl>
                                                       <button
                                                            type="button"
                                                            onClick={() =>
                                                                 setShowConfirmPassword(
                                                                      !showConfirmPassword
                                                                 )
                                                            }
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                       >
                                                            {showConfirmPassword ? (
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

                                   {/* Terms Notice */}
                                   <Alert className="border-gray-200">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">
                                             By creating an account, you agree
                                             to our Terms of Service and Privacy
                                             Policy.
                                        </AlertDescription>
                                   </Alert>

                                   {/* Submit Button */}
                                   <Button
                                        type="submit"
                                        className="text-white w-full"
                                        disabled={form.formState.isSubmitting}
                                   >
                                        Create Account
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

type PasswordRequirements = {
     length: boolean;
     uppercase: boolean;
     lowercase: boolean;
     number: boolean;
     special: boolean;
};

const PasswordStrengthIndicator = ({
     requirements,
}: {
     requirements: PasswordRequirements | null;
}) => {
     if (!requirements) return null;

     const indicators = [
          { key: "length", text: "At least 8 characters" },
          { key: "uppercase", text: "One uppercase letter" },
          { key: "lowercase", text: "One lowercase letter" },
          { key: "number", text: "One number" },
          { key: "special", text: "One special character" },
     ];

     return (
          <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
               <p className="text-sm font-medium text-gray-700 mb-2">
                    Password must contain:
               </p>
               <div className="space-y-1">
                    {indicators.map(({ key, text }) => (
                         <div key={key} className="flex items-center text-sm">
                              {requirements[
                                   key as keyof PasswordRequirements
                              ] ? (
                                   <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                              ) : (
                                   <X className="w-4 h-4 text-red-500 mr-2" />
                              )}
                              <span
                                   className={
                                        requirements[
                                             key as keyof PasswordRequirements
                                        ]
                                             ? "text-green-700"
                                             : "text-red-700"
                                   }
                              >
                                   {text}
                              </span>
                         </div>
                    ))}
               </div>
          </div>
     );
};
