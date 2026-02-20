import { Router } from 'express'
import { sendError, sendSuccess } from '../common/http-response.js'
import {
  getPortalCountWithBestRecord,
  getRecordsForLevel,
  getRecordsForPlayer,
  submitRecord
} from './leaderboard.service.js'

export const leaderboardRouter = Router()

leaderboardRouter.post('/leaderboard/submitRecord', async (req, res) => {
  const result = await submitRecord(req.body)
  if (!result.ok) {
    return sendError(res, result.status, result.code, result.message)
  }

  return sendSuccess(res, result.data)
})

leaderboardRouter.get('/leaderboard/getRecordsForLevel', async (req, res) => {
  const result = await getRecordsForLevel(req.query)
  if (!result.ok) {
    return sendError(res, result.status, result.code, result.message)
  }

  return sendSuccess(res, result.data)
})

leaderboardRouter.get('/leaderboard/getPortalCountWithBestRecord', async (req, res) => {
  const result = await getPortalCountWithBestRecord(req.query)
  if (!result.ok) {
    return sendError(res, result.status, result.code, result.message)
  }

  return sendSuccess(res, result.data)
})

leaderboardRouter.get('/leaderboard/getRecordsForPlayer', async (req, res) => {
  const result = await getRecordsForPlayer(req.query)
  if (!result.ok) {
    return sendError(res, result.status, result.code, result.message)
  }

  return sendSuccess(res, result.data)
})
