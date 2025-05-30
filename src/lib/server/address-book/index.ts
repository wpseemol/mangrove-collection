"use server";

import { connectMongoDB } from "@/db/connections";
import AddressBookModel from "@/lib/schemas/mongoose/address-book";
import { AddressBookType } from "@/types/address-book";
import { replaceMongoIds } from "@/utils/replace";
import { getAddressBookDataCookies } from "../order-confirm";

/**
 *
 * @param inputPhone string
 * @description This function is used to fetch the address book data from the server.
 * if not get data, it will return null.
 * @returns
 */
export async function getSearchAddressBookDataPhoneNumber(
     inputPhone: string
): Promise<string | null> {
     if (!inputPhone) {
          console.error("inputPhone is empty");
          return null;
     }
     try {
          await connectMongoDB();

          const existingAddressBookResponse = await AddressBookModel.findOne({
               addresses: { $elemMatch: { phone: inputPhone } },
          }).lean();

          if (!existingAddressBookResponse) {
               console.error(
                    "No address book found for the given phone number."
               );
               return null;
          }

          const existingAddressBook = replaceMongoIds(
               existingAddressBookResponse
          ) as AddressBookType;

          return JSON.stringify(existingAddressBook.addresses);
     } catch (error) {
          console.error("Error fetching address book data:", error);
          return null;
     }
}

export async function getAddressBookData() {
     try {
          const cookiesPhoneNumber = await getAddressBookDataCookies();
          if (!cookiesPhoneNumber) {
               console.error("No phone number found in cookies.");
               return null;
          }

          await connectMongoDB();

          const existingAddressBookResponse = await AddressBookModel.findOne({
               addresses: { $elemMatch: { phone: cookiesPhoneNumber } },
          }).lean();

          if (!existingAddressBookResponse) {
               console.error(
                    "No address book found for the given phone number."
               );
               return null;
          }

          const existingAddressBook = replaceMongoIds(
               existingAddressBookResponse
          ) as AddressBookType;

          return JSON.stringify(existingAddressBook);
     } catch (error) {
          console.error("Error fetching address book data:", error);
          return null;
     }
}
