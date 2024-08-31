'use server';

export default async function getUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/users', {
            method: 'GET',
        });
        return response;
    } catch (error) {
        throw error;
    }
}
