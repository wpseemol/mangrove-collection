'use client';
import { Button } from '@/components/ui/button';
import { usePurchase } from '@/hooks';
import debounce from '@/utils/debounce';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcCheckmark } from 'react-icons/fc';
import Swal from 'sweetalert2';
import { z } from 'zod';

export function CheckoutForm() {
    const [paymentMethod, setPaymentMethond] =
        useState<PaymentMethodType>('cod');

    const { buyProducts, shippingCost } = usePurchase();

    const router = useRouter();

    const cod = paymentMethod === 'cod';
    const onlinePayment = paymentMethod === 'online-payment';

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        formState,
    } = useForm<z.infer<typeof checkoutSchema>>({
        resolver: zodResolver(checkoutSchema),
    });

    const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
        try {
            if (!buyProducts || !shippingCost) return;

            const orderAcceptObj: OrderAcceptType = {
                products: buyProducts,
                fullAddress: values.fullAddress,
                fullName: values.fullName,
                phone: values.phoneNumber,
                termsAccepted: values.termsAccepted,
                paymentMethod: paymentMethod,
                shippingCost,
            };

            const response = await fetch('/api/v1/place-order/set', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderAcceptObj),
            });

            if (response.status === 201) {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Your order is done, Check for confirmation.',
                    showConfirmButton: false,
                    timer: 1500,
                }).then(() => {
                    router.push('/my-order');
                });
            }
        } catch (error) {
            console.error('Place Order Error:', error);
        }
    };

    /**
     * ferch data phone number inpute strat
     */

    const delayDebounce = debounce(async (inputNumber: string) => {
        const response = await fetch(
            `/api/v1/address-book/search-get?input-phone-number=${inputNumber}`
        );
        if (response.ok) {
            const responseData = await response.json();

            const defaultData = responseData.data as CheckoutDefaultValus;

            if (responseData.success) {
                reset({
                    fullName: defaultData.name,
                    fullAddress: defaultData.fullAddress,
                });
            } else {
                reset({
                    fullName: '',
                    fullAddress: '',
                });
            }
        } else {
            reset({
                fullName: '',
                fullAddress: '',
            });
        }
    }, 400);

    async function handelPhoneChange(phoneNumber: string) {
        if (!phoneNumber || phoneNumber.length < 10) return;
        try {
            delayDebounce(phoneNumber);
        } catch (error) {
            console.error('Checkout Form get error:', error);
        }
    }
    /**
     * ferch data phone number inpute strat
     */

    return (
        <div className="bg-gray-100">
            <div className=" flex flex-col items-center py-8 pb-10 sticky top-[4rem] h-fit">
                <div className="bg-blue-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md mb-4 md:mx-0 mx-2">
                    <p className="text-sm">{message}</p>
                </div>
                <div className="mb-4">
                    <h2 className="text-2xl font-bold ">Payment Method</h2>

                    <div className="flex justify-center gap-2 py-3 md:px-0 px-2 ">
                        <Button
                            onClick={() => setPaymentMethond('cod')}
                            variant={cod ? 'outline' : 'ghost'}>
                            {cod ? <FcCheckmark /> : ''}
                            Cash on Delevery
                        </Button>
                        <Button
                            disabled={true}
                            onClick={() => setPaymentMethond('online-payment')}
                            variant={onlinePayment ? 'outline' : 'ghost'}
                            className="disabled:cursor-not-allowed"
                            title="Online Payment comming soon!">
                            {onlinePayment ? <FcCheckmark /> : ''}
                            Online Payment
                        </Button>
                    </div>

                    <h2 className="text-2xl font-bold mb-4">Checkout</h2>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 md:px-0 px-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                placeholder="01XXXXXXXXX"
                                {...register('phoneNumber')}
                                onChange={(event) => {
                                    const phone = event.target.value;
                                    handelPhoneChange(phone);
                                }}
                                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {errors.phoneNumber && (
                                <p className="text-red-500 text-sm">
                                    {errors.phoneNumber.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                {...register('fullName')}
                                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-sm">
                                    {errors.fullName.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Full Address
                            </label>
                            <textarea
                                {...register('fullAddress')}
                                placeholder="Street, City, ZIP Code"
                                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                            {errors.fullAddress && (
                                <p className="text-red-500 text-sm">
                                    {errors.fullAddress.message}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                {...register('termsAccepted')}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label className="ml-2 text-sm text-gray-600">
                                I accept the{' '}
                                <a
                                    href="#"
                                    className="text-indigo-600 underline">
                                    Terms and Conditions
                                </a>{' '}
                                and{' '}
                                <a
                                    href="#"
                                    className="text-indigo-600 underline">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>
                        {errors.termsAccepted && (
                            <p className="text-red-500 text-sm">
                                {errors.termsAccepted.message}
                            </p>
                        )}
                        <Button
                            disabled={formState.isSubmitting}
                            type="submit"
                            className=" text-white w-full">
                            {formState.isSubmitting
                                ? 'Order...'
                                : 'Place Order'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const message: string =
    'অর্ডার সংক্রান্ত যেকোনো প্রয়োজনে কথা বলুন আমাদের সাথে - 01412345678';

const checkoutSchema = z.object({
    fullName: z.string().min(1, 'Full Name is required'),
    phoneNumber: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid BD phone number'),
    fullAddress: z.string().min(10, 'Address must be at least 10 characters'),
    termsAccepted: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions',
    }),
});

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

interface OrderAcceptType {
    phone: string;
    fullName: string;
    fullAddress: string;
    termsAccepted: boolean;
    products: BuyProductType[];
    paymentMethod: PaymentMethodType;
    shippingCost: number;
}

type PaymentMethodType = 'cod' | 'online-payment' | 'card';

interface BuyProductType {
    productId: string;
    quantity: number;
}
