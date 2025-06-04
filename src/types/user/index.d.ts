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
