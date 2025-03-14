'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import debounce from '@/utils/debounce';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Define Zod schema
const addressSchema = z.object({
    fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    landmark: z.string().optional(),

    province: z.string().min(2, 'Province / Region is required'),
    city: z.string().min(2, 'City name is required'),
    zone: z.string().min(2, 'Zone is required'),
    address: z.string().min(5, 'Address is too short'),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddNewAddressForm() {
    const [isDefaultValue, setIsDefaultValue] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        formState,
        reset,
        watch,
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
    });

    /**
     * ferch data phone number inpute strat
     */
    const phoneNumber = watch('phone');

    const delayDebounce = debounce(async (inputNumber: string) => {
        const response = await fetch(
            `/api/v1/place-order/search-get?input-phone-number=${inputNumber}`
        );
        if (response.ok) {
            const responseData = await response.json();

            const defaultData = responseData.data as CheckoutDefaultValus;

            if (responseData.success) {
                reset({
                    fullName: defaultData.name,
                    email: defaultData.email || '',
                    city: defaultData.city || '',
                    address: defaultData.fullAddress,
                    phone: inputNumber,
                    landmark: defaultData.landmark || '',
                    zone: defaultData.zone || '',
                    province: defaultData.region || '',
                });
                setIsDefaultValue(true);
            } else {
                setCheckoutDefaultValus(null);
            }
        }
    }, 400);

    useEffect(() => {
        if (!phoneNumber || phoneNumber.length < 10 || isDefaultValue) return;

        try {
            delayDebounce(phoneNumber);
        } catch (error) {
            console.error('Checkout Form get error:', error);
        }
    }, [phoneNumber, delayDebounce, isDefaultValue]);
    /**
     * ferch data phone number inpute strat
     */

    const onSubmit = async (data: AddressFormData) => {
        try {
            console.log('Submitting address:', data);
            toast.success('Address added successfully!');
            reset();
        } catch (error) {
            console.error('Add Addres went error:', error);
        }
    };

    return (
        <section className="max-w-4xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">
                Add New Address
            </h2>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Personal Details */}
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="01XXXXXXXXX"
                            {...register('phone')}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" {...register('fullName')} />
                        {errors.fullName && (
                            <p className="text-red-500 text-sm">
                                {errors.fullName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register('email')} />
                        {errors.email && (
                            <p className="text-red-500 text-sm">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="landmark">Landmark (Optional)</Label>

                        <Input id="landmark" {...register('landmark')} />
                    </div>
                </div>

                {/* Right Column - Address Details */}
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="province">Province / Region</Label>
                        <Input id="province" {...register('province')} />
                        {errors.province && (
                            <p className="text-red-500 text-sm">
                                {errors.province.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" {...register('city')} />
                        {errors.city && (
                            <p className="text-red-500 text-sm">
                                {errors.city.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="zone">Zone</Label>
                        <Input id="zone" {...register('zone')} />
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
                            {...register('address')}
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
                        disabled={formState.isSubmitting}>
                        {formState.isSubmitting ? 'Saving...' : 'Save Address'}
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

type CheckoutDefaultValus = AddressType & {
    id: string;
};
