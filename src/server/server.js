import express from 'express'
import {
  getTop5,
  getPlayerRank,
  getPlayerRecord,
  submitRecord
} from '../db/requests.js'
import {
  authenticateSteamTicket,
  createToken,
  verifyToken
} from './steamApi.js'

const app = express()
app.use(express.json())

/* ---------- helpers ---------- */

function clientError(res, status, message) {
  return res.status(status).json({ success: false, error: message })
}

/* ---------- routes ---------- */

app.get('/leaderboard/topFive', async (req, res) => {
  try {
    const levelId = Number(req.query.levelId)
    if (!Number.isInteger(levelId)) {
      return clientError(res, 400, 'levelId is required')
    }

    const top5 = await getTop5(levelId)
    res.json({ success: true, data: top5 })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to load leaderboard')
  }
})

app.get('/leaderboard/playerRecord', async (req, res) => {
  try {
    const { steamId, levelId } = req.query
    if (!steamId || !levelId) {
      return clientError(res, 400, 'steamId and levelId required')
    }

    const time = await getPlayerRecord(steamId, Number(levelId))
    res.json({ success: true, time })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to load player record')
  }
})

app.get('/leaderboard/playerRank', async (req, res) => {
  try {
    const { steamId, levelId } = req.query
    if (!steamId || !levelId) {
      return clientError(res, 400, 'steamId and levelId required')
    }

    const rank = await getPlayerRank(steamId, Number(levelId))
    res.json({ success: true, rank })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to load player rank')
  }
})

app.post('/auth', async (req, res) => {
  try {
    const { steamId, authSessionTicket } = req.body

    if (!steamId || !authSessionTicket) {
      return res.status(400).json({
        success: false,
        error: 'steamId and authSessionTicket required'
      })
    }

    const authResult = await authenticateSteamTicket(
      steamId,
      authSessionTicket
    )

    if (!authResult.success) {
      return res.status(401).json(authResult)
    }

    const token = await createToken(authResult.steamId)
    res.json({ success: true, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    })
  }
})

app.post('/leaderboard/submit', async (req, res) => {
  try {
    const { levelId, steamName, time, token } = req.body

    if (!token || levelId === undefined || time === undefined || !steamName) {
      return clientError(res, 400, 'token, levelId, steamName and time required')
    }

    if (typeof time !== 'number' || time <= 0) {
      return clientError(res, 400, 'Invalid time value')
    }

    if (typeof steamName !== 'string' || steamName.length > 64) {
      return clientError(res, 400, 'Invalid steamName')
    }

    const authResult = await verifyToken(token)
    if (!authResult.success) {
      return clientError(res, 401, authResult.error)
    }

    await submitRecord(
      authResult.steamId,
      steamName,
      Number(levelId),
      time
    )

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to submit record')
  }
})

app.get('/ping', (req, res) => {
    res.status(200).send('ok');
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
