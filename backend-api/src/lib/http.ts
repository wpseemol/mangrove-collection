export type FieldErrors = Record<string, string[]>

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: FieldErrors,
    public readonly headers?: Record<string, string>,
  ) {
    super(message)
  }
}

/** Builds the Laravel style summary: first message plus "(and N more errors)". */
export function summarize(errors: FieldErrors): string {
  const messages = Object.values(errors).flat()
  const first = messages[0] ?? 'The given data was invalid.'
  const more = messages.length - 1

  return more > 0 ? `${first} (and ${more} more ${more === 1 ? 'error' : 'errors'})` : first
}

export class ValidationError extends HttpError {
  constructor(errors: FieldErrors) {
    super(422, summarize(errors), errors)
  }
}

export function fail(field: string, message: string): never {
  throw new ValidationError({ [field]: [message] })
}

export function failMany(errors: FieldErrors): never {
  throw new ValidationError(errors)
}

export const notFound = (): never => {
  throw new HttpError(404, 'Resource not found.')
}

export const forbidden = (message = 'This action is unauthorized.'): never => {
  throw new HttpError(403, message)
}

export const conflict = (message: string): never => {
  throw new HttpError(409, message)
}

/** Parses a route id; anything that is not a positive integer is a 404, like Laravel's route model binding. */
export function routeId(value: unknown): bigint {
  if (typeof value !== 'string' || !/^\d{1,19}$/.test(value)) notFound()
  const id = BigInt(value as string)
  if (id <= 0n) notFound()
  return id
}
