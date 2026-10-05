/**
 * Client-side mirror of the API's SafeText rule (backend-api/app/Rules/SafeText.php).
 * The server is the real gate; this just gives instant feedback before a request is sent.
 */
const UNSAFE_TEXT = [
  /<\s*\/?\s*[a-z!?%]/i,
  /[?%]>/,
  /\b(?:javascript|vbscript)\s*:|\bdata\s*:\s*[a-z]+\/[\w.+-]+[;,]/i,
  /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/,
  /\bunion\s+(?:all\s+)?select\b/i,
  /;\s*(?:drop|truncate|alter|delete|insert|update|create|grant|shutdown)\s/i,
  /['"`]\s*(?:or|and)\s+['"`]?\w+['"`]?\s*(?:=|like)\s*['"`]?\w+/i,
  /['"`]\s*(?:--|#|\/\*)/,
  /\/\*[\s\S]*?\*\//,
  /\b(?:sleep|benchmark|pg_sleep)\(/i,
  /\bwaitfor\s+delay\b/i,
  /\b(?:information_schema|load_file)\b|\binto\s+(?:out|dump)file\b/i,
];

export const UNSAFE_TEXT_MESSAGE = "This field must not contain HTML, PHP, script or SQL code.";

export const isUnsafeText = (value: string) => UNSAFE_TEXT.some((pattern) => pattern.test(value));

/** Passwords are hashed and never echoed back, so any character is allowed. */
const RAW_FIELD = /password/;

/**
 * Walks a request body (plain object or FormData) and returns Laravel-style errors,
 * keyed by dotted path, for any string that the API would reject.
 */
export function findUnsafeFields(body: unknown): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  const visit = (value: unknown, path: string) => {
    if (typeof value === "string") {
      if (path && !RAW_FIELD.test(path) && isUnsafeText(value)) errors[path] = [UNSAFE_TEXT_MESSAGE];
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, path ? `${path}.${index}` : String(index)));
    } else if (value && typeof value === "object" && !(value instanceof Blob)) {
      for (const [key, item] of Object.entries(value)) visit(item, path ? `${path}.${key}` : key);
    }
  };

  if (body instanceof FormData) {
    body.forEach((value, key) => visit(value, key));
  } else {
    visit(body, "");
  }

  return errors;
}
