import { googolProviderUserCreate, userLogin } from "@/lib/server/user";
import type { User } from "next-auth";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
     session: {
          strategy: "jwt",
     },
     pages: {
          signIn: "/login",
          error: "/login",
     },
     trustHost: true,
     secret: process.env.AUTH_SECRET,
     providers: [
          Credentials({
               name: "Credentials",
               type: "credentials",
               credentials: {
                    email: { label: "Email", type: "text" },
                    password: { label: "Password", type: "password" },
               },

               async authorize(
                    credentials:
                         | Partial<Record<"email" | "password", unknown>>
                         | undefined
               ): Promise<User | null> {
                    if (!credentials?.email || !credentials?.password) {
                         errorMessage =
                              "Email and Password are required for login.";
                         throw new InvalidLoginError();
                    }

                    const response = await userLogin(
                         JSON.stringify(credentials)
                    );

                    if (response.success && response.user) {
                         return response?.user;
                    }

                    errorMessage = response.message;
                    throw new InvalidLoginError();
               },
          }),

          Google({
               clientId: process.env.GOOGLE_CLIENT_ID,
               clientSecret: process.env.GOOGLE_CLIENT_SECRET,
               authorization: {
                    params: {
                         prompt: "consent",
                         access_type: "offline",
                         response_type: "code",
                    },
               },
          }),
     ],

     callbacks: {
          async signIn({ user, account }) {
               if (account?.provider === "google") {
                    // do some thing.

                    const googleLoginUser = await googolProviderUserCreate(
                         JSON.stringify(user)
                    );

                    if (googleLoginUser.success && googleLoginUser.user) {
                         user.id = googleLoginUser.user.id;
                         user.role = googleLoginUser.user.role;

                         return true;
                    }

                    errorMessage = googleLoginUser.message;
                    throw new InvalidGoogleLogin(googleLoginUser.message);
               }

               return true;
          },
          // token, user, session, trigger
          async jwt({ token, user, session }) {
               if (user?.role) {
                    token.role = user.role;
               }
               if (session?.role) {
                    token.role = session.role;
               }

               return token;
          },

          async session({ session, token }) {
               if (token.role) {
                    session.user.role = token.role;
               }

               if (token.sub) {
                    session.user.id = token.sub;
               }

               return session;
          },
     },
});

let errorMessage = "Some thing is wrong.";

class InvalidLoginError extends CredentialsSignin {
     type = "CredentialsSignin" as const;
     code = errorMessage;
     cause = {
          ...(errorMessage && { message: errorMessage }), // Only include if exists
          err: new Error(errorMessage), // Actual Error object
     };
}

class InvalidGoogleLogin extends CredentialsSignin {
     type = "AccessDenied" as const;
     code = errorMessage;
     cause = {
          ...(errorMessage && { message: errorMessage }), // Only include if exists
          err: new Error(errorMessage), // Actual Error object
     };
}
