"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSearchAddressBookDataPhoneNumber } from "@/lib/server/address-book";
import debounce from "@/utils/debounce";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define Zod schema
const addressSchema = z.object({
     fullName: z.string().min(2, "Full Name must be at least 2 characters"),
     email: z.string().email("Invalid email"),
     phone: z.string().regex(/^01[3-9]\d{8}$/, "Invalid BD phone number"),
     landmark: z.string().optional(),

     province: z.string().min(2, "Province / Region is required"),
     city: z.string().min(2, "City name is required"),
     zone: z.string().min(2, "Zone is required"),
     address: z.string().min(10, "Address must be at least 10 characters"),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddNewAddressForm() {
     const {
          register,
          handleSubmit,
          formState: { errors },
          formState,
          reset,
     } = useForm<AddressFormData>({
          resolver: zodResolver(addressSchema),
     });

     const onSubmit = async (data: AddressFormData) => {
          try {
               console.log("Submitting address:", data);
               toast.success("Address added successfully!");
               reset();
          } catch (error) {
               console.error("Add address went error:", error);
          }
     };

     /**
      * @description
      * 1. get the address book data from server
      * 2. if data is found, set the data to the form
      * 3. if data is not found, set the data to the form
      */
     const delayDebounce = debounce(async (inputNumber: string) => {
          const response = await getSearchAddressBookDataPhoneNumber(
               inputNumber
          );

          if (!response) {
               return;
          }

          const address = JSON.parse(response) as AddressType[];
          console.log(address);

          const defaultData = address.find(
               (item) => item.phone === inputNumber
          );
          if (defaultData) {
               reset({
                    phone: defaultData.phone,
                    fullName: defaultData.name,
                    address: defaultData.fullAddress,
               });
               return;
          }
     }, 400);

     async function handelPhoneChange(phoneNumber: string) {
          if (!phoneNumber || phoneNumber.length < 10) return;
          try {
               delayDebounce(phoneNumber);
          } catch (error) {
               console.error("Checkout Form get error:", error);
          }
     }
     /**
      * ferch data phone number inpute strat
      */

     return (
          <section className="max-w-4xl mx-auto p-6 bg-white dark:bg-neutral-900 ">
               <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">
                    Add New Address
               </h2>

               <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
               >
                    {/* Left Column - Personal Details */}
                    <div className="space-y-4">
                         <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                   id="phone"
                                   type="tel"
                                   placeholder="01XXXXXXXXX"
                                   {...register("phone")}
                                   onChange={(event) => {
                                        const phoneNumber = event.target.value;
                                        handelPhoneChange(phoneNumber);
                                   }}
                              />
                              {errors.phone && (
                                   <p className="text-red-500 text-sm">
                                        {errors.phone.message}
                                   </p>
                              )}
                         </div>
                         <div>
                              <Label htmlFor="fullName">Full Name</Label>
                              <Input id="fullName" {...register("fullName")} />
                              {errors.fullName && (
                                   <p className="text-red-500 text-sm">
                                        {errors.fullName.message}
                                   </p>
                              )}
                         </div>

                         <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                   id="email"
                                   type="email"
                                   {...register("email")}
                              />
                              {errors.email && (
                                   <p className="text-red-500 text-sm">
                                        {errors.email.message}
                                   </p>
                              )}
                         </div>

                         <div>
                              <Label htmlFor="landmark">
                                   Landmark (Optional)
                              </Label>

                              <Input id="landmark" {...register("landmark")} />
                         </div>
                    </div>

                    {/* Right Column - Address Details */}
                    <div className="space-y-4">
                         <div>
                              <Label htmlFor="province">
                                   Province / Region
                              </Label>
                              <Input id="province" {...register("province")} />
                              {errors.province && (
                                   <p className="text-red-500 text-sm">
                                        {errors.province.message}
                                   </p>
                              )}
                         </div>

                         <div>
                              <Label htmlFor="city">City</Label>
                              <Input id="city" {...register("city")} />
                              {errors.city && (
                                   <p className="text-red-500 text-sm">
                                        {errors.city.message}
                                   </p>
                              )}
                         </div>

                         <div>
                              <Label htmlFor="zone">Zone</Label>
                              <Input id="zone" {...register("zone")} />
                              {errors.zone && (
                                   <p className="text-red-500 text-sm">
                                        {errors.zone.message}
                                   </p>
                              )}
                         </div>

                         <div>
                              <Label htmlFor="address">Full Address</Label>
                              <Textarea
                                   id="address"
                                   placeholder="Street, City, ZIP Code"
                                   {...register("address")}
                              />
                              {errors.address && (
                                   <p className="text-red-500 text-sm">
                                        {errors.address.message}
                                   </p>
                              )}
                         </div>
                    </div>

                    {/* Submit Button - Full Width Below */}
                    <div className="col-span-1 md:col-span-2 flex justify-end">
                         <Button
                              type="submit"
                              className="text-white ml-auto"
                              disabled={formState.isSubmitting}
                         >
                              {formState.isSubmitting
                                   ? "Saving..."
                                   : "Save Address"}
                         </Button>
                    </div>
               </form>
          </section>
     );
}

interface AddressType {
     name: string;
     email: string | null;
     phone: string;
     landmark?: string;
     region: string | null;
     city: string | null;
     fullAddress: string;
     isSelected: boolean;
     zone: string | null;
}

// type CheckoutDefaultValus = AddressType & {
//      id: string;
// };
