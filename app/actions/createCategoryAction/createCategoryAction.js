'use server';

export default async function createCategoryAction(categoryObj) {
    categoryObj.forEach((value, key) => {
        console.log(key, value);
    });

    return;
}
