import { ZodError } from "zod";

export function formatZodError(error: ZodError) {
     return error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code,
     }));
}

export function getFirstErrorMessage(error: ZodError) {
     return error.errors[0]?.message || "Validation failed";
}
