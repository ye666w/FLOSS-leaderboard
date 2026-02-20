import { verifyTicket } from '../external/steam.service.js'
import { createToken } from '../jwt/jwt.service.js'

export const auth = async (steamId: string, steamTicket: string): Promise<string | null> => {
  if (!steamId || !steamTicket) {
    return null
  }

  const isValidTicket = await verifyTicket(steamId, steamTicket)
  if (!isValidTicket) {
    return null
  }

  return createToken({ steamId })
}
