export const getErrorMessage = (error: unknown): string => {
     if (typeof error === "object" && error !== null && "code" in error) {
          return String(error.code);
     }
     return "Internal server error.";
};
