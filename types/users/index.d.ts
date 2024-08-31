/**
 * Represents a user within the system.
 *
 * @typedef {Object} ManageUserType
 * @property {string} id - The unique identifier for the user.
 * @property {string} name - The name of the user.
 * @property {string} email - The email address of the user.
 * @property {RoleType} role - The role assigned to the user (e.g., admin, user, etc.).
 * @property {string | null | undefined} [image] - The URL or path to the user's profile image. It can be `null` or omitted.
 */
export type ManageUserType = {
    id: string;
    fullName: string;
    email: string;
    role: RoleType;
    image?: string | null;
};
