/**
 * Converts a MongoDB ObjectId string to a 7 or 8 character order ID.
 * Uses the first 7 or 8 characters of the ObjectId.
 * @param {string} mongoId - The MongoDB ObjectId string.
 * @param {number} length - The desired length min 5. Defaults to 8.
 * @returns {string} The order ID.
 */
export function mongodbIdToOrderId(
     mongoId: string,
     length: number = 8
): string {
     if (
          !mongoId ||
          typeof mongoId !== "string" ||
          !/^[a-fA-F0-9]{24}$/.test(mongoId)
     ) {
          throw new Error("Invalid MongoDB ObjectId");
     }
     const minLength = 5;
     const maxLength = mongoId.length;
     if (length < minLength || length > maxLength) {
          throw new Error(
               `Length must be between ${minLength} and ${maxLength}`
          );
     }
     return mongoId.slice(0, length);
}
