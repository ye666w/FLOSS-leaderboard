import { Router } from 'express'
import { sendError, sendSuccess } from '../common/http-response.js'
import { auth } from './auth.service.js'

export const authRouter = Router()

authRouter.post('/auth', async (req, res) => {
  const { steamId, steamTicket } = req.body as {
    steamId?: string
    steamTicket?: string
  }

  if (!steamId || !steamTicket) {
    return sendError(res, 400, 'BAD_REQUEST', 'steamId and steamTicket are required')
  }

  const token = await auth(steamId, steamTicket)
  if (!token) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Invalid Steam ticket')
  }

  return sendSuccess(res, { token })
})