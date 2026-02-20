export type RecordsDirection = 'asc' | 'desc'

type SteamIdentity<WithSteamId extends boolean> = WithSteamId extends true
  ? { steamId: string }
  : {}

export type LevelRecordRow<WithSteamId extends boolean = false> = {
  place: number
  steamName: string
  seed: number
  score: number
} & SteamIdentity<WithSteamId>

export type PlayerRecordRow<WithSteamId extends boolean = false> = {
  levelId: number
  seed: number
  score: number
} & SteamIdentity<WithSteamId>

export type PortalCountRow<WithSteamId extends boolean = false> = {
  place: number
  steamName: string
  portalCount: number
} & SteamIdentity<WithSteamId>

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
