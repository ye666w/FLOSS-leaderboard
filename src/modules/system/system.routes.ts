import { Router } from 'express'
import { sendError, sendSuccess } from '../common/http-response.js'
import {
  buildClientUpdateRequiredMessage,
  CLIENT_UPDATE_REQUIRED_CODE,
  isClientVersionSupported,
  resolveClientVersion,
  resolveRequiredClientVersion
} from '../client-version/client-version.service.js'

export const systemRouter = Router()

systemRouter.get('/ping', (_req, res) => {
  return sendSuccess(res, { message: 'pong' })
})

systemRouter.get('/version', (req, res) => {
  const requiredVersion = resolveRequiredClientVersion()
  if (requiredVersion == null) {
    return sendSuccess(res, { isSupported: true, requiredVersion: null })
  }

  const clientVersion = resolveClientVersion(req)
  if (!isClientVersionSupported(clientVersion, requiredVersion)) {
    res.setHeader('x-required-client-version', requiredVersion)
    return sendError(
      res,
      426,
      CLIENT_UPDATE_REQUIRED_CODE,
      buildClientUpdateRequiredMessage(requiredVersion)
    )
  }

  return sendSuccess(res, { isSupported: true, requiredVersion })
})
