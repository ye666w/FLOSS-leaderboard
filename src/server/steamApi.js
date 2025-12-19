import fetch from 'node-fetch';

const steamApiUrl = 'https://partner.steam-api.com';

export async function checkSteamId(steamId) {
  try {
    const params = new URLSearchParams({
      key: process.env.STEAM_API_KEY,
      steamid: steamId,
      appid: process.env.FLOSS_APPID,
    });

    const requestUrl = `${steamApiUrl}/ISteamUser/CheckAppOwnership/v4/?${params.toString()}`;
    const response = await fetch(requestUrl);
    const data = await response.json();

    if (data && data.ownsapp) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}