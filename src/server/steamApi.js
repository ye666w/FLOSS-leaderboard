import jwt from 'jsonwebtoken'

const TOKEN_TTL = '12h'
const JWT_ALGORITHM = 'HS256'

const STEAM_API_URL =
  'https://api.steampowered.com/ISteamUserAuth/AuthenticateUserTicket/v1/'

export const authenticateSteamTicket = async (steamId, ticket) => {
  try {
    const url = new URL(STEAM_API_URL)

    url.searchParams.set('key', process.env.STEAM_API_KEY)
    url.searchParams.set('appid', process.env.STEAM_APP_ID)
    url.searchParams.set('ticket', ticket)

    const response = await fetch(url)

    if (!response.ok) {
      return { success: false, error: 'Steam API error' }
    }

    const data = await response.json()
    const params = data?.response?.params

    if (!params || params.result !== 'OK') {
      return { success: false, error: 'Steam authentication failed' }
    }

    if (String(params.steamid) !== String(steamId)) {
      return { success: false, error: 'SteamID mismatch' }
    }

    return { success: true, steamId: params.steamid }
  } catch (err) {
    console.error('Steam auth error:', err)
    return { success: false, error: 'Steam API error' }
  }
}

export const createToken = (steamId) => {
  return jwt.sign(
    { steamId: String(steamId) },
    process.env.JWT_SECRET,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: TOKEN_TTL
    }
  )
}

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: [JWT_ALGORITHM] }
    )

    return { success: true, steamId: decoded.steamId }
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return { success: false, error: 'Token expired' }
    }

    return { success: false, error: 'Invalid token' }
  }
}