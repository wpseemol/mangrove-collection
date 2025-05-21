"use server";

import { connectMongoDB } from "@/db/connections";
import AddressBookModel from "@/lib/schemas/mongoose/address-book";
import { AddressBookType } from "@/types/address-book";
import { replaceMongoIds } from "@/utils/replace";

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

export const SECRET_KEY_ADDRESS_BOOK = "DKFLKELKksjjfsdfasedujjw";

export const COOKIE_KEY_ADDRESS_BOOK = "__address_book";
