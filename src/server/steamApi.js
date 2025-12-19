import jwt from 'jsonwebtoken'
import {
  saveAuthToken,
  verifyAuthToken
} from '../db/requests.js'

const TOKEN_TTL = '24h'
const STEAM_API_URL =
  'https://api.steampowered.com/ISteamUserAuth/AuthenticateUserTicket/v1/'

export async function authenticateSteamTicket(steamId, ticket) {
  try {
    const url = new URL(STEAM_API_URL)
    url.searchParams.set('key', process.env.STEAM_API_KEY)
    url.searchParams.set('appid', process.env.STEAM_APP_ID)
    url.searchParams.set('ticket', ticket)

    const response = await fetch(url)
    const data = await response.json()

    const params = data?.response?.params
    if (!params || params.result !== 'OK') {
      return { success: false, error: 'Steam authentication failed' }
    }

    if (params.steamid !== steamId) {
      return { success: false, error: 'SteamID mismatch' }
    }

    return { success: true, steamId: params.steamid }
  } catch (err) {
    console.error('Steam auth error:', err)
    return { success: false, error: 'Steam API error' }
  }
}

export async function createToken(steamId) {
  const token = jwt.sign(
    { steamId },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  )

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await saveAuthToken(steamId, token, expiresAt)

  return token
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const valid = await verifyAuthToken(decoded.steamId, token)
    if (!valid.success) {
      return { success: false, error: 'Invalid or expired token' }
    }

    return { success: true, steamId: decoded.steamId }
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return { success: false, error: 'Token expired' }
    }
    return { success: false, error: 'Invalid token' }
  }
}