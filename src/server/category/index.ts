'use server';

import { Category, CategoryWithCount } from '@/types/home';

/**
 * getCategory function return
 * @returns `Category[] | null`
 */
export async function getCategory(): Promise<Category[] | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
        const response = await fetch(`${baseUrl}api/v1/category`);

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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
        const response = await fetch(
            `${baseUrl}api/v1/category-with-count${limit}`
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
