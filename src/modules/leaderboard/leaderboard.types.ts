export type RecordsDirection = 'asc' | 'desc'

export type LevelRecordRow = {
  place: number
  steamName: string
  seed: number
  score: number
}

export type PlayerRecordRow = {
  levelId: number
  seed: number
  score: number
}

export type PortalCountRow = {
  place: number
  steamName: string
  portalCount: number
}

export type ServiceError = {
  ok: false
  status: number
  code: string
  message: string
}

export type ServiceSuccess<T> = {
  ok: true
  data: T
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceError

export type SubmitRecordInput = {
  token?: string
  steamId?: string | number
  steamName?: string
  levelId?: unknown
  seed?: unknown
  score?: unknown
  recordsDirection?: RecordsDirection
}

export type RecordsForLevelQuery = {
  levelId?: unknown
  recordsDirection?: unknown
  recordsLimit?: unknown
  steamId?: unknown
}

export type PortalCountQuery = {
  recordsDirection?: unknown
  portalDirection?: unknown
  recordsLimit?: unknown
  steamId?: unknown
}

export type RecordsForPlayerQuery = {
  steamId?: unknown
  recordsDirection?: unknown
  recordsLimit?: unknown
}