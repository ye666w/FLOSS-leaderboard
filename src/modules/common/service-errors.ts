import type { ServiceError } from './service-result.types.js'

export const createServiceError = <Status extends number, Code extends string>(
  status: Status,
  code: Code,
  message: string
): ServiceError<Status, Code> => ({
  ok: false,
  status,
  code,
  message
})

export const badRequestError = (message: string): ServiceError<400, 'BAD_REQUEST'> =>
  createServiceError(400, 'BAD_REQUEST', message)

export const unauthorizedError = (message: string): ServiceError<401, 'UNAUTHORIZED'> =>
  createServiceError(401, 'UNAUTHORIZED', message)

export const internalError = (message: string): ServiceError<500, 'INTERNAL_ERROR'> =>
  createServiceError(500, 'INTERNAL_ERROR', message)
