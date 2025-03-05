'use server';

import { CardProductType } from '@/types/product';
import { revalidatePath } from 'next/cache';

const baseUrl = process.env.NEXT_PUBLIC_API_URL!;

export async function getProducts(
    searchParams = ''
): Promise<CardProductType[] | null> {
    try {
        const response = await fetch(
            `${baseUrl}api/v1/products${searchParams}`
        );

        if (response.ok) {
            const { data } = await response.json();
            revalidatePath('/products');

            return data;
        }

        return null;
    } catch (error) {
        console.error('category fetch:', error);
        return null;
    }
}

export async function getPopularProducts(): Promise<CardProductType[] | null> {
    try {
        const response = await fetch(`${baseUrl}api/v1/products/popular`);

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

export async function getNewArrivalProduct(): Promise<
    CardProductType[] | null
> {
    try {
        const response = await fetch(`${baseUrl}api/v1/products/new-arrival`);

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
