import { API_URL } from "@/lib/config";
import { useAuthStore } from "@/stores/auth";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }

  /** First validation message for a field, e.g. `error.field("address.phone")`. */
  field(name: string): string | undefined {
    return this.errors[name]?.[0];
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

type RequestOptions = Omit<RequestInit, "body"> & {
  query?: Query;
  body?: unknown;
};

export async function api<T>(path: string, { query, body, headers, ...init }: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const token = useAuthStore.getState().token;
  const isFormData = body instanceof FormData;

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      useAuthStore.getState().clear();
    }

    throw new ApiError(payload.message ?? "Something went wrong. Please try again.", response.status, payload.errors);
  }

  return payload as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
