/**
 * Represents the data required to register a new user.
 *
 * @property fullname - The full name of the user.
 * @property email - The user's email address.
 * @property phone - The user's phone number.
 * @property password - The user's chosen password.
 * @property conformPass - The confirmation of the user's password.
 */
export interface RegisterUser {
     fullname: string;
     email: string;
     phone: string;
     password: string;
     conformPass: string;
}

/**
 * Represents the data required to log in a user.
 *
 * @property email - The user's email address.
 * @property password - The user's password.
 */
export interface UserLoginInfo {
     email: string;
     password: string;
}

/**
 * Represents the response from a user login operation.
 * @deprecated This interface is deprecated and should not be used in new code.
 * Use `UserLoginResponse` instead.
 * @property id - The unique identifier of the user.
 * @property name - The name of the user.
 * @property email - The email address of the user.
 * @property image - The profile image URL of the user, or null if not available.
 * @property role - The role of the user, which can be "user", "creator", or "admin".
 * @property password - The user's password (not recommended to expose).
 * @property provider - The authentication provider used, such as "credentials", "google", "github", or "facebook".
 */
export interface UserLoginResponse {
     id: string;
     name: string;
     email: string;
     image: string | null;
     role: "user" | "creator" | "admin";
     password: string;
     provider: string;
}
