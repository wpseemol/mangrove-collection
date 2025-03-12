'use client';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcCheckmark } from 'react-icons/fc';
import { z } from 'zod';

export function CheckoutForm() {
    const [paymentMethod, setPaymentMethond] = useState<string>('cod');

    const cod = paymentMethod === 'cod';
    const onlinePayment = paymentMethod === 'online-payment';

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof checkoutSchema>>({
        resolver: zodResolver(checkoutSchema),
    });

    const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
        console.log('Form submitted', values.fullAddress);
    };

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
                            onClick={() => setPaymentMethond('online-payment')}
                            variant={onlinePayment ? 'outline' : 'ghost'}>
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
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                {...register('phoneNumber')}
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
                                Full Address
                            </label>
                            <textarea
                                {...register('fullAddress')}
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
                        <Button type="submit" className=" text-white w-full">
                            Place Order
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
    phoneNumber: z.string().min(10, 'Phone Number is required'),
    fullAddress: z.string().min(1, 'Full Address is required'),
    termsAccepted: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions',
    }),
});
