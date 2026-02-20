import { timingSafeEqual } from 'crypto'
import { internalError, unauthorizedError } from '../common/service-errors.js'
import type { ServiceError, ServiceGuardResult } from '../common/service-result.types.js'

const expectedKey = process.env.ADMIN_API_KEY

export type AdminAuthError = ServiceError<401 | 500, 'UNAUTHORIZED' | 'INTERNAL_ERROR'>

export type AdminAuthResult = ServiceGuardResult<401 | 500, 'UNAUTHORIZED' | 'INTERNAL_ERROR'>

export const resolveAdminHeader = (
  authorization?: string,
  xAdminKey?: string
): string | undefined => xAdminKey ?? authorization

const extractAdminKey = (rawHeader?: string): string | null => {
  if (!rawHeader) {
    return null
  }

  const value = rawHeader.trim()
  if (!value) {
    return null
  }

  const bearerPrefix = 'Bearer '
  if (value.startsWith(bearerPrefix)) {
    const token = value.slice(bearerPrefix.length).trim()
    return token || null
  }

  return value
}

export const verifyAdminAccess = (rawHeader?: string): AdminAuthResult => {
  if (!expectedKey) {
    return internalError('ADMIN_API_KEY is not configured')
  }

  const providedKey = extractAdminKey(rawHeader)
  if (!providedKey) {
    return unauthorizedError('Admin key is required')
  }

  const expectedBuffer = Buffer.from(expectedKey, 'utf8')
  const providedBuffer = Buffer.from(providedKey, 'utf8')

  if (expectedBuffer.length !== providedBuffer.length) {
    return unauthorizedError('Invalid admin key')
  }

  if (!timingSafeEqual(expectedBuffer, providedBuffer)) {
    return unauthorizedError('Invalid admin key')
  }

  return { ok: true }
}
