import type {
  LevelRecordRow,
  PortalCountRow,
  PlayerRecordRow,
  RecordsForLevelQuery,
  PortalCountQuery,
  RecordsForPlayerQuery
} from '../leaderboard.types.js'
import type { ServiceResult } from '../../common/service-result.types.js'

export type AdminLevelRecordRow = LevelRecordRow<true>
export type AdminPortalCountRow = PortalCountRow<true>
export type AdminPlayerRecordRow = PlayerRecordRow<true>

export type AdminRecordsForLevelQuery = RecordsForLevelQuery
export type AdminPortalCountQuery = PortalCountQuery
export type AdminRecordsForPlayerQuery = RecordsForPlayerQuery

export type AdminResult<T> = ServiceResult<T>
