import { parseBigIntValue, parseOptionalPositiveInt, parseRequiredInt } from '../common/parsers.js'
import { badRequestError, unauthorizedError } from '../common/service-errors.js'
import type { ServiceResult } from '../common/service-result.types.js'
import { verifyToken } from '../jwt/jwt.service.js'
import {
  getPortalCountWithBestRecord as getPortalCountWithBestRecordRepo,
  getRecordsForLevel as getRecordsForLevelRepo,
  getRecordsForPlayer as getRecordsForPlayerRepo,
  submitRecord as submitRecordRepo
} from './leaderboard.repository.js'
import type {
  LevelRecordRow,
  PortalCountRow,
  PlayerRecordRow,
  RecordsDirection,
  SubmitRecordInput,
  RecordsForLevelQuery,
  PortalCountQuery,
  RecordsForPlayerQuery
} from './leaderboard.types.js'

const parseDirection = (value: unknown): RecordsDirection | null => {
  if (value === 'asc' || value === 'desc') {
    return value
  }

  return null
}

export const submitRecord = async (
  input: SubmitRecordInput
): Promise<ServiceResult<{ result: 'ok' }>> => {
  const { token, steamId, steamName, recordsDirection } = input

  if (!token || !verifyToken(token)) {
    return unauthorizedError('Invalid token')
  }

  const steamIdParsed = parseBigIntValue(steamId)
  const levelId = parseRequiredInt(input.levelId)
  const seed = parseRequiredInt(input.seed)
  const score = parseRequiredInt(input.score)

  if (
    steamIdParsed == null ||
    !steamName ||
    levelId == null ||
    seed == null ||
    score == null ||
    score <= 0
  ) {
    return badRequestError('token, steamId, steamName, levelId, seed and positive score are required')
  }

  const dir = recordsDirection ?? 'asc'
  if (dir !== 'asc' && dir !== 'desc') {
    return badRequestError('recordsDirection must be asc or desc')
  }

  const result = await submitRecordRepo(steamIdParsed, steamName, levelId, seed, score, dir)
  return { ok: true, data: { result } }
}

export const getRecordsForLevel = async <WithSteamId extends boolean = false>(
  query: RecordsForLevelQuery,
  includeSteamId = false as WithSteamId
): Promise<ServiceResult<{ records: LevelRecordRow<WithSteamId>[] }>> => {
  const levelId = Number(query.levelId)
  const recordsDirection = parseDirection(query.recordsDirection)
  const recordsLimit = parseOptionalPositiveInt(query.recordsLimit)
  const steamIdCandidate = query.steamId == null ? undefined : parseBigIntValue(query.steamId)

  if (!Number.isInteger(levelId) || levelId <= 0 || recordsDirection == null) {
    return badRequestError('levelId and recordsDirection (asc|desc) are required')
  }

  if (recordsLimit === null) {
    return badRequestError('recordsLimit must be a positive integer')
  }

  if (query.steamId != null && steamIdCandidate == null) {
    return badRequestError('steamId must be a valid bigint')
  }

  const steamId = steamIdCandidate ?? undefined
  const records = await getRecordsForLevelRepo(
    levelId,
    recordsDirection,
    recordsLimit,
    steamId,
    includeSteamId
  )
  return { ok: true, data: { records } }
}

export const getPortalCountWithBestRecord = async <WithSteamId extends boolean = false>(
  query: PortalCountQuery,
  includeSteamId = false as WithSteamId
): Promise<ServiceResult<{ records: PortalCountRow<WithSteamId>[] }>> => {
  const recordsDirection = parseDirection(query.recordsDirection)
  const portalDirection = parseDirection(query.portalDirection)
  const recordsLimit = parseOptionalPositiveInt(query.recordsLimit)
  const steamIdCandidate = query.steamId == null ? undefined : parseBigIntValue(query.steamId)

  if (recordsDirection == null || portalDirection == null) {
    return badRequestError('recordsDirection and portalDirection must be asc or desc')
  }

  if (recordsLimit === null) {
    return badRequestError('recordsLimit must be a positive integer')
  }

  if (query.steamId != null && steamIdCandidate == null) {
    return badRequestError('steamId must be a valid bigint')
  }

  const steamId = steamIdCandidate ?? undefined
  const records = await getPortalCountWithBestRecordRepo(
    recordsDirection,
    portalDirection,
    recordsLimit,
    steamId,
    includeSteamId
  )
  return { ok: true, data: { records } }
}

export const getRecordsForPlayer = async <WithSteamId extends boolean = false>(
  query: RecordsForPlayerQuery,
  includeSteamId = false as WithSteamId
): Promise<ServiceResult<{ records: PlayerRecordRow<WithSteamId>[] }>> => {
  const steamId = parseBigIntValue(query.steamId)
  const recordsDirection = parseDirection(query.recordsDirection)
  const recordsLimit = parseOptionalPositiveInt(query.recordsLimit)

  if (steamId == null || recordsDirection == null) {
    return badRequestError('steamId and recordsDirection (asc|desc) are required')
  }

  if (recordsLimit === null) {
    return badRequestError('recordsLimit must be a positive integer')
  }

  const records = await getRecordsForPlayerRepo(steamId, recordsDirection, recordsLimit, includeSteamId)
  return { ok: true, data: { records } }
}
