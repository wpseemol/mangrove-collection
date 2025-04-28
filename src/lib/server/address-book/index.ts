"use server";

/**
 *
 * @param inputPhone string
 * @description This function is used to fetch the address book data from the server.
 * if not get data, it will return null.
 * @returns
 */
export async function getSearchAddressBookData(inputPhone: string) {
     try {
          console.log("inputPhone:", inputPhone);
     } catch (error) {
          console.error("Error fetching address book data:", error);
          return null;
     }
}
