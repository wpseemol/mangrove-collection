"use server";

import { signIn } from "@/auth";
import { connectMongoDB } from "@/db/connections";
import { User } from "@/lib/schemas/mongoose/user";
import {
     RegisterUser,
     Role,
     UserLoginInfo,
     UserLoginResponse,
     UserResponseType,
} from "@/types/user";
import { getErrorMessage } from "@/utils/error";
import { replaceMongoIds } from "@/utils/replace";
import bcrypt from "bcryptjs";
import { MongoServerError } from "mongodb";

/**
 * Registers a new user with the provided login information.
 *
 * @param loginInfo - A JSON string containing user registration details.
 * @returns An object indicating success or failure and a message.
 */
export async function userRegister(loginInfo: string | null) {
     try {
          if (!loginInfo) {
               console.log("No login information provided.");
               return {
                    success: false,
                    message: "No login information provided.",
               };
          }

          const { fullname, email, phone, password, conformPass } = JSON.parse(
               loginInfo
          ) as RegisterUser;
          if (!fullname || !email || !phone || !password || !conformPass) {
               console.log("Register User: Missing required fields.");
               return { success: false, message: "Missing required fields." };
          }

          if (password !== conformPass) {
               console.log("Register User: Passwords do not match.");
               return { success: false, message: "Passwords do not match." };
          }

          /**
           * Using bcrypt to hash the password.
           */
          const salt = await bcrypt.genSaltSync(10);
          const hashPassword = await bcrypt.hashSync(password, salt);

          const registerUserInfo = {
               name: fullname,
               email,
               phone,
               password: hashPassword,
          };

          await User.create(registerUserInfo);

          return {
               success: true,
               message: "User registered successfully.",
          };
     } catch (error) {
          const typeError = error as MongoServerError;

          if (typeError.code === 11000) {
               const pattern: string | null =
                    typeof typeError.keyPattern === "object"
                         ? Object.keys(typeError.keyPattern)[0]
                         : null;

               let message = "";

               if (pattern === "email")
                    message = "Email is already in use in another account.";
               if (pattern === "username")
                    message = "Username is already in use.";
               if (pattern === "phone")
                    message = "Phone number already in use in another account.";

               return { success: false, message };
          }

          if (error instanceof Error) {
               return { success: false, message: error.message };
          }

          console.log("Error in userRegister:", error);
          return { success: false, message: "An unknown error occurred." };
     }
}

export async function googolProviderUserCreate(googleUser: string | null) {
     if (!googleUser) {
          return {
               success: false,
               message: "No Google user information provided.",
          };
     }
     try {
          const { name, email, image } = JSON.parse(
               googleUser
          ) as UserLoginResponse;

          if (!name || !email) {
               console.log("Google User: Missing required fields.");
               return { success: false, message: "Missing required fields." };
          }

          await connectMongoDB();

          const existingUser = await User.findOne({
               email,
          }).lean<UserResponseType>();

          if (existingUser) {
               return {
                    success: true,
                    message: "User already exists.",
                    user: {
                         id: existingUser._id.toString(),
                         name: existingUser.name,
                         email: existingUser.email,
                         role: existingUser.role,
                         image: existingUser.image,
                         provider: existingUser.provider,
                    },
               };
          }

          const newUser = (await User.create({
               name,
               email,
               image,
               provider: "google",
          })) as UserResponseType;

          return {
               success: true,
               message: "Google user created successfully.",
               user: {
                    id: newUser._id.toString(),
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    image: newUser.image,
                    provider: newUser.provider,
               },
          };
     } catch (error) {
          return {
               success: false,
               message: "An error occurred while creating the Google user.",
               error: JSON.stringify(error),
          };
     }
}

/**
 * Logs in a user with the provided login information.
 *
 * @param loginInfo - A JSON string containing user login details.
 * @returns An object indicating success or failure and a message.
 */
export async function userLogin(loginInfo: string | null) {
     if (!loginInfo) {
          console.log("No login information provided.");
          return {
               success: false,
               message: "No login information provided.",
          };
     }
     try {
          const { email, password } = JSON.parse(loginInfo) as UserLoginInfo;

          if (!email || !password) {
               console.log("Login User: Missing required fields.");
               return { success: false, message: "Missing required fields." };
          }

          await connectMongoDB();

          const projection = "name email role image provider password";
          const response = await User.findOne({ email }, projection).lean();

          if (!response) {
               console.log("Login User: User not found.");
               return { success: false, message: "User not found." };
          }

          const user = replaceMongoIds(response) as UserLoginResponse;

          if (user.provider === "google") {
               return {
                    success: false,
                    message: "You are already login with google",
               };
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
               console.log("Login User: Invalid password.");
               return { success: false, message: "Password is not correct." };
          }

          return {
               success: true,
               message: "User logged in successfully.",
               user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
               },
          };
     } catch (error) {
          console.log("Error in userLogin:", error);
          if (error instanceof Error) {
               return {
                    success: false,
                    message: error.message || "Internal server error.",
                    error: JSON.stringify(error),
               };
          }

          return {
               success: false,
               message: "Internal server error.",
          };
     }
}

/**
 * Signs in a user using the NextAuth.js credentials provider.
 *
 * @param loginInfo - A JSON string containing user login details.
 * @returns An object indicating success or failure and a message.
 */

export async function signInServer(loginInfo: string | null) {
     if (!loginInfo) {
          console.log("No login information provided.");
          return {
               success: false,
               message: "No login information provided.",
          };
     }

     try {
          const { email, password } = JSON.parse(loginInfo) as UserLoginInfo;

          if (!email || !password) {
               console.log("Login User: Missing required fields.");
               return { success: false, message: "Missing required fields." };
          }

          await signIn("credentials", {
               redirect: false,
               email,
               password,
          });
          return {
               success: true,
               message: "User logged in successfully.",
          };
     } catch (error) {
          console.log("login error:", error);
          return {
               success: false,
               message: getErrorMessage(error),
               error: JSON.stringify(error),
          };
     }
}

/**
 * Checks if the given user has an admin role.
 *
 * @param userId - type `string` The user object to check.
 * @param userRole - type `Role` User Role type admin,creator,user
 * @param staticRole - type `Role` User Role the is the check vale
 * @returns True if the user is an admin, false otherwise.
 */
export async function userRoleCheck(
     userId: string,
     userRole: Role,
     staticRole: Role
): boolean {
     if (!userId || !userRole || !staticRole) return false;

     try {
          await connectMongoDB();

          const showFiled = "role";
          const userResponse = await User.findOne(
               { _id: userId },
               showFiled
          ).lean<{ role: Role }>();

          if (!userResponse) return false;

          return staticRole === userRole && userResponse.role === staticRole;
     } catch (error) {
          console.log("is admin Check error:", error);
          return false;
     }
}
