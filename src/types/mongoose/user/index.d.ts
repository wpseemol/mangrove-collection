export type UserSchemaType = {
    username: string; // Optional since it has a default value
    fullName: string;
    email: string;
    password: string | null;
    image?: string | null; // Optional because it has a default value
    phone: string | null;
    role: 'user' | 'creator' | 'admin';
    registerAt?: Date; // Optional because it has a default value
};
