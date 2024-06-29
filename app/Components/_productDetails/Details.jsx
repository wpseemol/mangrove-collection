import Image from 'next/image';

export default function Details() {
    return (
        <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg my-10">
            {/* <!-- Product Image and Information --> */}
            <div class="md:flex">
                {/* <!-- Product Image --> */}
                <div class="md:flex-shrink-0">
                    <Image
                        class="w-full h-64 object-cover md:w-80"
                        src="/assets/image/mangrove picture.jpg"
                        alt="Product Image"
                        width="350"
                        height="400"
                    />
                </div>
                {/* <!-- Product Information --> */}
                <div class="mt-4 md:mt-0 md:ml-6">
                    {/* <!-- Product Title --> */}
                    <div class="flex justify-between items-center">
                        <h1 class="text-2xl font-bold text-gray-900">
                            Product Title
                        </h1>
                        <p class="text-xl font-semibold text-gray-900">
                            $99.99
                        </p>
                    </div>
                    {/* <!-- Product Rating --> */}
                    <div class="mt-2 flex items-center">
                        <div class="flex items-center">
                            {/* <!-- Star Icons --> */}
                            <svg
                                class="w-5 h-5 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path d="M10 15l-5.88 3.09L5.76 11 1 7.18l6.12-.61L10 1l2.88 5.57 6.12.61L14.24 11l1.64 7.09z" />
                            </svg>
                            <svg
                                class="w-5 h-5 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path d="M10 15l-5.88 3.09L5.76 11 1 7.18l6.12-.61L10 1l2.88 5.57 6.12.61L14.24 11l1.64 7.09z" />
                            </svg>
                            <svg
                                class="w-5 h-5 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path d="M10 15l-5.88 3.09L5.76 11 1 7.18l6.12-.61L10 1l2.88 5.57 6.12.61L14.24 11l1.64 7.09z" />
                            </svg>
                            <svg
                                class="w-5 h-5 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path d="M10 15l-5.88 3.09L5.76 11 1 7.18l6.12-.61L10 1l2.88 5.57 6.12.61L14.24 11l1.64 7.09z" />
                            </svg>
                            <svg
                                class="w-5 h-5 text-gray-300"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path d="M10 15l-5.88 3.09L5.76 11 1 7.18l6.12-.61L10 1l2.88 5.57 6.12.61L14.24 11l1.64 7.09z" />
                            </svg>
                        </div>
                        <span class="ml-2 text-gray-600">(4.0)</span>
                    </div>
                    {/* <!-- Product Description --> */}
                    <p class="mt-4 text-gray-700">
                        This is a detailed description of the product. It
                        provides all the necessary information about the
                        product, including features, benefits, and usage
                        instructions.
                    </p>
                    {/* <!-- Add to Cart Button --> */}
                    <div class="mt-6">
                        <button class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
            {/* <!-- Product Specifications --> */}
            <div class="mt-10">
                <h2 class="text-xl font-bold text-gray-900">Specifications</h2>
                <ul class="mt-4 space-y-2">
                    <li class="flex justify-between text-gray-700">
                        <span>Specification 1:</span>
                        <span>Detail</span>
                    </li>
                    <li class="flex justify-between text-gray-700">
                        <span>Specification 2:</span>
                        <span>Detail</span>
                    </li>
                    <li class="flex justify-between text-gray-700">
                        <span>Specification 3:</span>
                        <span>Detail</span>
                    </li>
                    <li class="flex justify-between text-gray-700">
                        <span>Specification 4:</span>
                        <span>Detail</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
