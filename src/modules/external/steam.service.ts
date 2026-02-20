const STEAM_API_KEY = process.env.STEAM_API_KEY
const STEAM_APP_ID = process.env.STEAM_APP_ID

const STEAM_API_URL = 'https://api.steampowered.com'
const AUTH_URL = '/ISteamUserAuth/AuthenticateUserTicket/v1/'

type SteamAuthResponse = {
  response?: {
    params?: {
      result?: string
      steamid?: string
    }
  }
}

export const verifyTicket = async (steamId: string, ticket: string): Promise<boolean> => {
  if (!steamId || !ticket || !STEAM_API_KEY || !STEAM_APP_ID) {
    return false
  }

  try {
    const url = new URL(AUTH_URL, STEAM_API_URL)
    url.searchParams.set('key', STEAM_API_KEY)
    url.searchParams.set('appid', STEAM_APP_ID)
    url.searchParams.set('ticket', ticket)

    const response = await fetch(url)

    if (!response.ok) {
      return false
    }

    const data = (await response.json()) as SteamAuthResponse
    const params = data.response?.params

    if (!params || params.result !== 'OK' || !params.steamid) {
      return false
    }

    return params.steamid === steamId
  } catch {
    return false
  }
}
