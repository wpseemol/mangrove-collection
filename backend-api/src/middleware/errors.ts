import type { ErrorRequestHandler, RequestHandler } from 'express'
import multer from 'multer'
import { env } from '../config/env.js'
import { Prisma } from '../generated/prisma/client.js'
import { HttpError } from '../lib/http.js'
import { report } from '../lib/log.js'

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ message: `The route ${req.path.replace(/^\//, '')} could not be found.` })
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (res.headersSent) return

  if (error instanceof HttpError) {
    if (error.headers) res.set(error.headers)
    res.status(error.status).json(error.errors ? { message: error.message, errors: error.errors } : { message: error.message })
    return
  }

  if (error instanceof multer.MulterError) {
    const field = (error.field ?? 'file').replace(/\[\d*\]$/, '')
    const message =
      error.code === 'LIMIT_FILE_SIZE' ? `The ${field} field must not be greater than 10240 kilobytes.` : error.code === 'LIMIT_FILE_COUNT' ? 'Too many files were uploaded.' : 'The upload could not be processed.'
    res.status(422).json({ message, errors: { [field]: [message] } })
    return
  }

  const type = (error as { type?: string })?.type
  if (type === 'entity.parse.failed') {
    res.status(400).json({ message: 'The request body is not valid JSON.' })
    return
  }
  if (type === 'entity.too.large') {
    res.status(413).json({ message: 'The request is too large.' })
    return
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    res.status(404).json({ message: 'Resource not found.' })
    return
  }

  // http-errors from express/serve-static (e.g. a missing upload) carry their own client status.
  const status = Number((error as { status?: unknown; statusCode?: unknown })?.status ?? (error as { statusCode?: unknown })?.statusCode)
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    res.status(status).json({ message: status === 404 ? 'Not Found' : ((error as Error).message ?? 'Bad Request') })
    return
  }

  report(error)
  res.status(500).json(env().APP_DEBUG ? { message: (error as Error)?.message ?? 'Server Error.', exception: (error as Error)?.name } : { message: 'Server Error.' })
}
