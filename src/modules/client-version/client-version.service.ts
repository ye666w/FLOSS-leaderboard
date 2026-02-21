import type { Request } from 'express'

export const CLIENT_VERSION_HEADER = 'x-client-version'
export const CLIENT_UPDATE_REQUIRED_CODE = 'CLIENT_UPDATE_REQUIRED' as const

const normalizeVersion = (value?: string): string | null => {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export const resolveRequiredClientVersion = (): string | null =>
  normalizeVersion(process.env.REQUIRED_CLIENT_VERSION)

export const resolveClientVersion = (req: Request): string | null =>
  normalizeVersion(req.header(CLIENT_VERSION_HEADER) ?? undefined)

export const isClientVersionSupported = (
  clientVersion: string | null,
  requiredVersion: string | null
): boolean => requiredVersion == null || clientVersion === requiredVersion

export const buildClientUpdateRequiredMessage = (requiredVersion: string): string =>
  `Client update required. Please update the game to version ${requiredVersion}.`
