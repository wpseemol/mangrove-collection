import "next-auth";
import "next-auth/jwt";
import { Role } from "./user";

declare module "next-auth" {
     interface Session {
          user: {
               id: string;
               name: string;
               email: string;
               image: string | null;
               role: Role;
          };
     }

     interface User {
          id: string;
          name: string;
          email: string;
          image: string | null;
          role: Role;
     }
}

declare module "next-auth/jwt" {
     interface JWT {
          id: string;
          name: string;
          email: string;
          image: string | null;
          role: Role;
     }
}
