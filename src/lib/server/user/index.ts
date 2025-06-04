"use server";

import { User } from "@/lib/schemas/mongoose/user";
import { RegisterUser, UserLoginInfo } from "@/types/user";
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
          const user = await User.findOne({ email }, projection).lean();

          if (!user) {
               console.log("Login User: User not found.");
               return { success: false, message: "User not found." };
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
               console.log("Login User: Invalid password.");
               return { success: false, message: "Invalid password." };
          }

          return {
               success: true,
               message: "User logged in successfully.",
               response: JSON.stringify(user),
          };
     } catch (error) {
          if (error instanceof Error) {
               return {
                    success: false,
                    message: error.message || "Internal server error.",
                    error: JSON.stringify(error),
               };
          }
     }
}
