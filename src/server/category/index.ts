'use server';

import { Category, CategoryWithCount } from '@/types/home';

/**
 * getCategory function return
 * @returns `Category[] | null`
 */

const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
export async function getCategory(): Promise<Category[] | null> {
    try {
        const response = await fetch(`${baseUrl}api/v1/categories/category`);

        if (response.ok) {
            const { data } = await response.json();
            return data;
        }

        return null;
    } catch (error) {
        console.error('category fetch:', error);
        return null;
    }
}

/**
 * getCategoryWithCount function return
 * @returns `CategoryWithCount[] | null`
 */
export async function getCategoryWithCount(
    limit = ''
): Promise<CategoryWithCount[] | null> {
    try {
        const response = await fetch(
            `${baseUrl}api/v1/categories/category-with-count${limit}`
        );

        if (response.ok) {
            const { data } = await response.json();
            return data;
        }

        return null;
    } catch (error) {
        console.error('category fetch:', error);
        return null;
    }
}

/**
 * getCategoryMongoId function return
 * @returns `string[] | null`
 */
export async function getCategoryMongoId(
    category = ''
): Promise<string[] | null> {
    try {
        const response = await fetch(
            `${baseUrl}api/v1/categories/category-ids${category}`
        );

        if (response.ok) {
            const { data } = await response.json();
            return data;
        }

        return null;
    } catch (error) {
        console.error('category fetch:', error);
        return null;
    }
}
