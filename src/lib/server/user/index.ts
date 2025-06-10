"use server";

import { signIn } from "@/auth";
import { User } from "@/lib/schemas/mongoose/user";
import {
     RegisterUser,
     UserGoogleRegister,
     UserLoginInfo,
     UserLoginResponse,
} from "@/types/user";
import { getErrorMessage } from "@/utils/error";
import { replaceMongoIds } from "@/utils/replace";
import bcrypt from "bcryptjs";
import { MongoServerError } from "mongodb";
import { Types } from "mongoose";

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

          const existingUser = await User.findOne({ email }).lean();

          if (existingUser) {
               const user: UserGoogleRegister = {
                    id: (existingUser._id as Types.ObjectId).toString(),
                    name: existingUser.name as string,
                    email: existingUser.email as string,
                    role: existingUser.role as string,
                    image: existingUser.image as string,
               };
               return {
                    success: true,
                    message: "User already exists.",
                    user,
               };
          }

          const newUser = await User.create({
               name,
               email,
               image,
               provider: "google",
          });

          const user: UserGoogleRegister = {
               id: (newUser._id as Types.ObjectId).toString(),
               name: newUser.name as string,
               email: newUser.email as string,
               role: newUser.role as string,
               image: newUser.image as string,
          };

          return {
               success: true,
               message: "Google user created successfully.",
               user,
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
