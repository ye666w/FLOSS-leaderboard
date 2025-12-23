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
import {
  clientError,
  parseOrder
} from './helpers.js'

const app = express()
app.use(express.json())

app.get('/leaderboard/topFive', async (req, res) => {
  try {
    const levelId = Number(req.query.levelId)
    const order = parseOrder(req.query.order)

    if (!Number.isInteger(levelId)) {
      return clientError(res, 400, 'levelId is required')
    }

    const top5 = await getTop5(levelId, order)
    res.json({ success: true, data: top5 })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to load leaderboard')
  }
})

app.get('/leaderboard/playerRecord', async (req, res) => {
  try {
    const { steamId, levelId, order } = req.query

    if (!steamId || !levelId) {
      return clientError(res, 400, 'steamId and levelId required')
    }

    const record = await getPlayerRecord(
      steamId,
      Number(levelId),
      parseOrder(order)
    )

    res.json({ success: true, record })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to load player record')
  }
})

app.get('/leaderboard/playerRank', async (req, res) => {
  try {
    const { steamId, levelId, order } = req.query

    if (!steamId || !levelId || !order) {
      return clientError(res, 400, 'steamId, levelId, order required')
    }

    const rank = await getPlayerRank(
      steamId,
      Number(levelId),
      parseOrder(order)
    )

    if (rank) {
      rank.place = Number(rank.place)
      rank.steam_id = rank.steam_id.toString()
    }

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
    const { levelId, steamName, time, token, order } = req.body
		
    if (!token || levelId === undefined || time === undefined || !steamName || !order) {
			return clientError(res, 400, 'token, levelId, steamName, time, order required')
    }

		const sortOrder = parseOrder(order)

    const authResult = await verifyToken(token)
    if (!authResult.success) {
      return clientError(res, 401, authResult.error)
    }

    await submitRecord(
      authResult.steamId,
      steamName,
      Number(levelId),
      time,
      sortOrder
    )

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to submit record')
  }
})

app.get('/ping', (req, res) => {
    res.status(200).send('ok')
})

app.listen(process.env.API_PORT)