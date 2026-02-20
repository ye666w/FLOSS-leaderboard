import { Router } from 'express'
import { requireAdminAccess } from '../../admin/admin.middleware.js'
import { sendError, sendSuccess } from '../../common/http-response.js'
import {
  getAdminPortalCountWithBestRecord,
  getAdminRecordsForLevel,
  getAdminRecordsForPlayer
} from './admin.service.js'

export const leaderboardAdminRouter = Router()

leaderboardAdminRouter.use('/leaderboard/admin', requireAdminAccess)

leaderboardAdminRouter.get('/leaderboard/admin/getRecordsForLevel', async (req, res) => {
  const result = await getAdminRecordsForLevel(req.query)
  if (!result.ok) {
    return sendError(res, result.status, result.code, result.message)
  }

  return sendSuccess(res, result.data)
})

leaderboardAdminRouter.get('/leaderboard/admin/getPortalCountWithBestRecord', async (req, res) => {
  const result = await getAdminPortalCountWithBestRecord(req.query)
  if (!result.ok) {
    return sendError(res, result.status, result.code, result.message)
  }

  return sendSuccess(res, result.data)
})

leaderboardAdminRouter.get('/leaderboard/admin/getRecordsForPlayer', async (req, res) => {
  const result = await getAdminRecordsForPlayer(req.query)
  if (!result.ok) {
    return sendError(res, result.status, result.code, result.message)
  }

  return sendSuccess(res, result.data)
})
