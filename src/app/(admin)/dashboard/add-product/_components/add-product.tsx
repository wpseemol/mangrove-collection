"use client";

import { User } from "next-auth";
import { useRouter } from "next/navigation";

export default function AddProduct({
     allCategory,
     user,
}: {
     allCategory: string;
     user: string;
}) {
     /**
      * string to make object or content.
      */
     const category = JSON.parse(allCategory) as Categories[];
     const loginUser = JSON.parse(user) as User;
     console.log("AddProduct components:", category, loginUser);

     const router = useRouter();
     console.log("AddProduct components:", router);

     return <></>;
}

/**
 * Represents a category entity.
 *
 * @interface Categories
 * @property {string} id - The unique identifier for the category.
 * @property {string} name - The name of the category.
 * @property {string} slug - The URL-friendly identifier for the category, typically used in web URLs.
 * @property {string} imgUrl - The URL of the image associated with the category.
 */
interface Categories {
     id: string;
     name: string;
     slug: string;
     imgUrl: string;
}
