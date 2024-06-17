'use client';
import useFilterSection from './useFilterSection';

const sizeArray = ['xs', 's', 'm', 'l', 'xl'];

export default function FilterSection({ allCategory }) {
    const { handelChange, selectCategory, selectPrice } = useFilterSection();

    return (
        <div className="col-span-1 bg-white px-4 pb-6 shadow rounded overflow-hidden hidden md:block">
            <div className="divide-y divide-gray-200 space-y-5">
                <div>
                    <h3 className="text-xl text-gray-800 mb-3 uppercase font-medium">
                        Categories
                    </h3>
                    <div className="space-y-2">
                        {allCategory?.map((category) => {
                            const {
                                id,
                                categoryName,
                                categorySlug,
                                productCount,
                            } = category;
                            return (
                                <div key={id} className="flex items-center">
                                    <input
                                        onChange={(event) =>
                                            handelChange(event, 'categories')
                                        }
                                        checked={selectCategory?.includes(
                                            categorySlug
                                        )}
                                        type="checkbox"
                                        name={categorySlug}
                                        id={categorySlug}
                                        className="text-primary focus:ring-0 rounded-sm cursor-pointer"
                                    />
                                    <label
                                        htmlFor="cat-1"
                                        className="text-gray-600 ml-3 cursor-pointer">
                                        {categoryName}
                                    </label>
                                    <div className="ml-auto text-gray-600 text-sm">
                                        ({productCount})
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-4">
                    <h3 className="text-xl text-gray-800 mb-3 uppercase font-medium">
                        Price
                    </h3>
                    {/* price input component */}
                    <div className="mt-4 flex items-center">
                        <input
                            onChange={(event) => handelChange(event, 'price')}
                            defaultValue={selectPrice.min}
                            type="number"
                            name="min"
                            id="min"
                            className="w-full border-gray-300 focus:border-primary rounded focus:ring-0 px-3 py-1 text-gray-600 shadow-sm"
                            placeholder="min"
                        />
                        <span className="mx-3 text-gray-500">-</span>
                        <input
                            onChange={(event) => handelChange(event, 'price')}
                            defaultValue={selectPrice.max}
                            type="number"
                            name="max"
                            id="max"
                            className="w-full border-gray-300 focus:border-primary rounded focus:ring-0 px-3 py-1 text-gray-600 shadow-sm"
                            placeholder="max"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <h3 className="text-xl text-gray-800 mb-3 uppercase font-medium">
                        size
                    </h3>
                    <div className="flex items-center gap-2">
                        {sizeArray?.map((name) => (
                            <div key={name} className="size-selector">
                                <input
                                    onChange={(event) =>
                                        handelChange(event, 'size')
                                    }
                                    type="radio"
                                    // checked={defaultSize === name}
                                    name="size"
                                    id={`size-${name}`}
                                    value={name}
                                    className="hidden"
                                />
                                <label
                                    htmlFor={`size-${name}`}
                                    className="text-xs border border-gray-200 rounded-sm h-6 w-6 flex items-center justify-center cursor-pointer shadow-sm text-gray-600 uppercase">
                                    {name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
