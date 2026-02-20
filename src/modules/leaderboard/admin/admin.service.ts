import type { ServiceResult } from '../../common/service-result.types.js'
import {
  getPortalCountWithBestRecord as getPortalCountWithBestRecordBase,
  getRecordsForLevel as getRecordsForLevelBase,
  getRecordsForPlayer as getRecordsForPlayerBase
} from '../leaderboard.service.js'
import type {
  AdminLevelRecordRow,
  AdminPortalCountQuery,
  AdminPortalCountRow,
  AdminRecordsForLevelQuery,
  AdminRecordsForPlayerQuery,
  AdminPlayerRecordRow
} from './admin.types.js'

export const getAdminRecordsForLevel = async (
  query: AdminRecordsForLevelQuery
): Promise<ServiceResult<{ records: AdminLevelRecordRow[] }>> =>
  getRecordsForLevelBase(query, true)

export const getAdminPortalCountWithBestRecord = async (
  query: AdminPortalCountQuery
): Promise<ServiceResult<{ records: AdminPortalCountRow[] }>> =>
  getPortalCountWithBestRecordBase(query, true)

export const getAdminRecordsForPlayer = async (
  query: AdminRecordsForPlayerQuery
): Promise<ServiceResult<{ records: AdminPlayerRecordRow[] }>> =>
  getRecordsForPlayerBase(query, true)
