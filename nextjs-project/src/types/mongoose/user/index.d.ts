import { Role } from "@/types/user";

export type UserSchemaType = {
     username: string; // Optional since it has a default value
     name: string;
     email: string;
     password: string | null;
     image?: string | null; // Optional because it has a default value
     phone: string | null;
     role: Role;
     provider: string;
     registerAt?: Date; // Optional because it has a default value
};
