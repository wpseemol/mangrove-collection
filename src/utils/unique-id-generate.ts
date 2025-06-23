/**
 * Generates one or more unique IDs based on a customizable pattern and character set.
 *
 * @param options - Configuration options for ID generation.
 * @param options.count - The number of unique IDs to generate. Defaults to 1.
 * @param options.pattern - The pattern to use for each ID, where '*' is replaced by a random character from the character set. Defaults to '***'.
 * @param options.charSet - The set of characters to use for random replacements. Defaults to all alphanumeric characters.
 * @returns A single ID as a string if `count` is 1, or an array of IDs if `count` is greater than 1.
 */

export function generateUniqueIds(options: IdOptions = {}): string | string[] {
     const {
          count = 1,
          pattern = "***",
          charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
     } = options;

     const results: string[] = [];

     for (let i = 0; i < count; i++) {
          let id = "";
          for (const char of pattern) {
               id +=
                    char === "*"
                         ? charSet.charAt(
                                Math.floor(Math.random() * charSet.length)
                           )
                         : char;
          }
          results.push(id);
     }

     return count === 1 ? results[0] : results;
}

/**
 * Options for generating unique IDs.
 * @property count - Number of IDs to generate (default: 1)
 * @property pattern - Pattern for ID generation (pattern: '****-****-****')
 * @property charSet - Character set to use for random characters (default: alphanumeric)
 */
interface IdOptions {
     count?: number;
     pattern?: string;
     charSet?: string;
}
