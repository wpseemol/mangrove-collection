"use server";

export async function userRegister(loginInfo: string | null) {
     try {
          if (!loginInfo) {
               console.log("No login information provided.");
               return false;
          }

          const { username, password } = JSON.parse(loginInfo);
          if (!username || !password) {
               console.log("Username or password is missing.");
               return false;
          }
     } catch (error) {
          console.log("Error in userRegister:", error);
          return false;
     }
}
