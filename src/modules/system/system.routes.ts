import { Router } from 'express'
import { sendSuccess } from '../common/http-response.js'

export const systemRouter = Router()

systemRouter.get('/ping', (_req, res) => {
  return sendSuccess(res, { message: 'pong' })
})