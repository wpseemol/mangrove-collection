"use client";
import { CheckoutFormType } from "@/lib/schemas/zod/checkout-schema";
import { PurchaseProductsType } from "@/types/purchase";

interface OrderSummaryProps {
    form: CheckoutFormType;
    buyProductData: PurchaseProductsType[];
}

export default function OrderSummary({ form }: OrderSummaryProps) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div className="lg:w-[calc(100%/3-16px)] flex-shrink-0 h-fit sticky top-[5rem]">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#1e1e1e]">
                <h2 className="text-lg font-bold text-primary dark:text-white mb-6">
                    Order Summary
                </h2>
                <div className="mb-6 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
                            <img
                                className="h-full w-full object-cover object-center"
                                data-alt="Thumbnail of a grey premium t-shirt"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV551EWM-As4ZJD-87jgBxOvi5nZgWBtAqYnDhFexeuhZtKI1rY2o8yMJXDvU32jcPOieakAvYMpwFHM5n2dPpKKv_qJ72SuD-oyn2UYMeXO5BXMR6pyTmFWILs_8g1iTRRMoS5yOGKyRRd8puyZEV-dNcdAEh9O12HTUQ6y2C8vaumlxO74YtFuRSiS6KUAi5Ah5gxsXrSH3DUph8b-7qYvkXJY9Q6JaJ52yWCn0eS98f3EdSHpSlYx-qAcmyFfDvoVrjcqqCwYc"
                            />
                        </div>
                        <div className="flex flex-1 flex-col justify-center">
                            <div className="flex justify-between text-base font-medium text-primary dark:text-white">
                                <h3 className="line-clamp-1">
                                    Premium T-Shirt
                                </h3>
                                <p className="ml-4">৳ 850</p>
                            </div>
                            <p className="mt-1 text-sm text-neutral-500">
                                Black / L
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
                            <img
                                className="h-full w-full object-cover object-center"
                                data-alt="Thumbnail of denim jeans"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI_9Rzlw5p66YmI7sQVMGTNLPoey4T2p33GN7fmNaGFfd7ppM1qrtzwCGWF2duebE-RABV04te4v5bhHqJG9Q9JC92CNc0bLtiEk_LP4VoGG6u9CQ8WO6EhNjQ1rxU5D4LNg4nLiQmhxDphEwErzmjdoq0w1L_5-0u2Ln4PVPVBfrOe6uNXH61grnPM-BpBKM7HhhtNp2LSkb4fSvRX7XwNCmkFlfRZR_36s1AdOJjJQy8TUbw8luiFy_Oh7fjaIrCl8_ws3bLByc"
                            />
                        </div>
                        <div className="flex flex-1 flex-col justify-center">
                            <div className="flex justify-between text-base font-medium text-primary dark:text-white">
                                <h3 className="line-clamp-1">Classic Denim</h3>
                                <p className="ml-4">৳ 2,200</p>
                            </div>
                            <p className="mt-1 text-sm text-neutral-500">
                                Blue / 32
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
                            <img
                                className="h-full w-full object-cover object-center"
                                data-alt="Thumbnail of leather belt"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_21_UFcOmXWNwcNT0y5LNkWcL7RrH31t6YYaG0E38rox6doJbFhCAqut8Hta0oE3tcII778GtKk-7o9DFFrN1AA555kkAnXEs7krvSAgRk9tM7agXa5Mwno6sAw2GQC_P14bTHFBDKJYH0Rlz7vJRJJmY_WsIXXWmveP9cko3t4D7OkuCM3ZbT9mgIFGBHoX1Ci64xiN8rmk5sHetfrcUum3XLL1X4xzsS0GzzzrQ-0yyrqXBb2limYnjJomQn6veSRE01O5Dr8M"
                            />
                        </div>
                        <div className="flex flex-1 flex-col justify-center">
                            <div className="flex justify-between text-base font-medium text-primary dark:text-white">
                                <h3 className="line-clamp-1">Leather Belt</h3>
                                <p className="ml-4">৳ 450</p>
                            </div>
                            <p className="mt-1 text-sm text-neutral-500">
                                Brown / One Size
                            </p>
                        </div>
                    </div>
                </div>
                <div className="border-t border-neutral-200 pt-4 space-y-2 dark:border-neutral-700">
                    <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                        <p>Subtotal</p>
                        <p className="font-medium text-primary dark:text-white">
                            ৳ 3,500
                        </p>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                        <p>Delivery Fee</p>
                        <p className="font-medium text-primary dark:text-white">
                            ৳ 60
                        </p>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                        <p>Discount</p>
                        <p className="font-medium text-green-600">- ৳ 0</p>
                    </div>
                </div>
                <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                    <div className="flex items-end justify-between">
                        <p className="text-base font-medium text-primary dark:text-white">
                            Total Amount
                        </p>
                        <p className="text-2xl font-bold text-primary dark:text-white">
                            ৳ 3,560
                        </p>
                    </div>
                    <p className="text-right text-xs text-neutral-400 mt-1">
                        Including VAT
                    </p>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="mt-6 flex items-start gap-2">
                    <div className="flex h-5 items-center">
                        <input
                            {...register("termsAccepted")}
                            className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-600 dark:bg-neutral-800 dark:ring-offset-neutral-900"
                            id="terms"
                            type="checkbox"
                        />
                    </div>
                    <label
                        className="text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer"
                        htmlFor="terms"
                    >
                        I agree to the{" "}
                        <a
                            className="font-medium text-primary underline underline-offset-2 dark:text-white hover:text-primary/80"
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a
                            className="font-medium text-primary underline underline-offset-2 dark:text-white hover:text-primary/80"
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy Policy
                        </a>
                        .
                    </label>
                </div>
                {errors.termsAccepted && (
                    <p className="mt-2 text-sm text-red-500">
                        {errors.termsAccepted.message}
                    </p>
                )}

                {/* Submit Button */}
                <button
                    className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-bold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-primary dark:hover:bg-white/90 transition-colors"
                    type="submit"
                >
                    <span>Place Order</span>
                    <span className="material-symbols-outlined text-[20px]">
                        arrow_forward
                    </span>
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-400">
                    <span className="material-symbols-outlined text-[16px]">
                        lock
                    </span>
                    <p>Secure SSL Encrypted Checkout</p>
                </div>
            </div>
        </div>
    );
}
