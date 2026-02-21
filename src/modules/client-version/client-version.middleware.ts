import type { RequestHandler } from 'express'
import { sendError } from '../common/http-response.js'
import {
  buildClientUpdateRequiredMessage,
  CLIENT_UPDATE_REQUIRED_CODE,
  resolveClientVersion,
  resolveRequiredClientVersion,
  isClientVersionSupported
} from './client-version.service.js'

export const requireSupportedClientVersion: RequestHandler = (req, res, next) => {
  const requiredVersion = resolveRequiredClientVersion()
  if (requiredVersion == null) {
    return next()
  }

  const clientVersion = resolveClientVersion(req)
  if (isClientVersionSupported(clientVersion, requiredVersion)) {
    return next()
  }

  res.setHeader('x-required-client-version', requiredVersion)
  return sendError(
    res,
    426,
    CLIENT_UPDATE_REQUIRED_CODE,
    buildClientUpdateRequiredMessage(requiredVersion)
  )
}
