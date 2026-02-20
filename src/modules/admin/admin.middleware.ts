import type { RequestHandler } from 'express'
import { sendError } from '../common/http-response.js'
import { resolveAdminHeader, verifyAdminAccess } from './admin-auth.service.js'

export const requireAdminAccess: RequestHandler = (req, res, next) => {
  const header = resolveAdminHeader(
    req.header('authorization') ?? undefined,
    req.header('x-admin-key') ?? undefined
  )

  const auth = verifyAdminAccess(header)
  if (!auth.ok) {
    return sendError(res, auth.status, auth.code, auth.message)
  }

  return next()
}
