export type UserSchemaType = {
    username: string; // Optional since it has a default value
    name: string;
    email: string;
    password: string | null;
    image?: string | null; // Optional because it has a default value
    phone: string | null;
    role: 'user' | 'creator' | 'admin';
    provider: string;
    registerAt?: Date; // Optional because it has a default value
};

export enum UserRole {
    ADMIN = 'admin',
    CREATOR = 'creator',
    USER = 'user',
}
