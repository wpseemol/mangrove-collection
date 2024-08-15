'use client';

import { CategoryType, CategoryWithCountType } from '@/types/mongoose-models';
import { sizeArray } from '.';
import useFilterSection from './use-filter-section';

export default function FilterSection({
    allCategory,
}: {
    allCategory: CategoryType;
}) {
    const {
        handelChange,
        selectCategory,
        selectPrice,
        size,
        clickToRemoveSize,
    } = useFilterSection();

    return (
        <div className="col-span-1 content-center bg-white px-4 pb-6 shadow rounded overflow-hidden w-fit mx-auto">
            <div className="divide-y divide-gray-200 space-y-5 ">
                <div>
                    <h3 className="text-xl text-gray-800 mb-3 uppercase font-medium">
                        Categories
                    </h3>
                    <div className="space-y-2">
                        {allCategory?.map((category) => {
                            const { id, name, slug, productCount } =
                                category as CategoryWithCountType;
                            return (
                                <div
                                    key={id}
                                    className="flex items-center capitalize">
                                    <input
                                        onChange={(event) =>
                                            handelChange(event, 'categories')
                                        }
                                        checked={selectCategory?.includes(slug)}
                                        type="checkbox"
                                        name={slug}
                                        id={slug}
                                        className="text-primary focus:ring-0 rounded-sm cursor-pointer"
                                    />
                                    <label
                                        id={slug}
                                        htmlFor={slug}
                                        className="text-gray-600 ml-3 cursor-pointer">
                                        <span className="capitalize">
                                            {name?.toLowerCase()}
                                        </span>
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
                        {sizeArray.map((name) => (
                            <div key={name} className="size-selector">
                                <input
                                    onChange={(event) =>
                                        handelChange(event, 'size')
                                    }
                                    type="radio"
                                    checked={size === name}
                                    name="size"
                                    id={`size-${name}`}
                                    value={name}
                                    className="hidden"
                                />
                                <label
                                    title={
                                        size === name
                                            ? 'Click to remove size from filter.'
                                            : ''
                                    }
                                    onClick={() => {
                                        size === name &&
                                            clickToRemoveSize(size);
                                    }}
                                    htmlFor={`size-${name}`}
                                    className={`${
                                        size === name
                                            ? 'bg-primary-foreground text-neutral-100'
                                            : ''
                                    } text-xs border border-gray-200 rounded-sm h-6 w-6 flex items-center justify-center cursor-pointer shadow-sm text-gray-600 uppercase checked:bg-primary-foreground`}>
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
