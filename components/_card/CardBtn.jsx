export default function CardBtn() {
    return (
        <>
            <button className="text-sm px-4 py-2 bg-green-600 border border-green-600 rounded text-neutral-200 font-bold hover:text-white hover:bg-green-500 origin-top duration-500">
                Buy Now
            </button>
            <button className=" text-sm px-3 py-2 bg-neutral-200 border border-neutral-200 rounded text-green-700 font-bold hover:text-green-600 hover:bg-white origin-center duration-300">
                Add to Cart
            </button>
        </>
    );
}
