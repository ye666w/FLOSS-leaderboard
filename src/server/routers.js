import express from 'express'
import https from 'https'
import fs from 'fs'

import {
  getTop5,
  getAll,
  getPlayerRank,
  getPlayerRecord,
  getPlayerTopStatusByLevels,
  submitRecord,
	getGlobalTop5,
	getGlobalTopCount
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

const sslOptions = {
  key: fs.readFileSync('./origin.key'),
  cert: fs.readFileSync('./origin.pem')
}

const parseLevelId = (value) => {
  const num = Number(value)
  return Number.isInteger(num) ? num : null
}

app.post('/auth', async (req, res) => {
  try {
    const { steamId, authSessionTicket } = req.body

    if (!steamId || !authSessionTicket) {
      return clientError(res, 400, 'steamId and authSessionTicket required')
    }

    const authResult = await authenticateSteamTicket(
      steamId,
      authSessionTicket
    )

    if (!authResult.success) {
      return clientError(res, 401, authResult.error)
    }

    const token = await createToken(authResult.steamId)

    res.json({ success: true, token })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Authentication failed')
  }
})

app.get('/leaderboard/topFive', async (req, res) => {
  try {
    const levelId = parseLevelId(req.query.levelId)
    const order = parseOrder(req.query.order)

    if (!levelId || !order) {
      return clientError(res, 400, 'levelId and order required')
    }

    const data = await getTop5(levelId, order)

    res.json({ success: true, data })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to load leaderboard')
  }
})

app.get('/leaderboard/globalTopFive', async (req, res) => {
  try {
    const data = await getGlobalTop5()

    res.json({ success: true, data })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to load global top 5')
  }
})

app.get('/leaderboard/getAll', async (req, res) => {
  try {
    const levelId = parseLevelId(req.query.levelId)
    const order = parseOrder(req.query.order)

    if (!levelId || !order) {
      return clientError(res, 400, 'levelId and order required')
    }

    const data = await getAll(levelId, order)

    res.json({ success: true, data })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to load leaderboard')
  }
})

app.get('/leaderboard/playerRecord', async (req, res) => {
  try {
    const steamId = req.query.steamId
    const levelId = parseLevelId(req.query.levelId)

    if (!steamId || !levelId) {
      return clientError(res, 400, 'steamId and levelId required')
    }

    const record = await getPlayerRecord(
      steamId,
      levelId
    )

    res.json({ success: true, record })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to load player record')
  }
})

app.get('/leaderboard/playerRank', async (req, res) => {
  try {
    const steamId = req.query.steamId
    const levelId = parseLevelId(req.query.levelId)
    const order = parseOrder(req.query.order)

    if (!steamId || !levelId || !order) {
      return clientError(res, 400, 'steamId, levelId and order required')
    }

    const rank = await getPlayerRank(
      steamId,
      levelId,
      order
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

app.get('/leaderboard/playerTopStatus', async (req, res) => {
  try {
    const steamId = req.query.steamId
    const order = parseOrder(req.query.order)

    if (!steamId || !order) {
      return clientError(res, 400, 'steamId and order required')
    }

    const data = await getPlayerTopStatusByLevels(
      steamId,
      order
    )

    res.json({ success: true, data })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to load player top status')
  }
})

app.get('/leaderboard/globalTopCount', async (req, res) => {
  try {
    const { steamId } = req.query

    if (!steamId) {
      return clientError(res, 400, 'steamId required')
    }

    const data = await getGlobalTopCount(steamId)

    res.json({ success: true, data })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to load player global top count')
  }
})

app.post('/leaderboard/submit', async (req, res) => {
  try {
    const { levelId, steamName, time, token, order } = req.body

    const parsedLevel = parseLevelId(levelId)
    const parsedOrder = parseOrder(order)

    if (!token || !parsedLevel || !steamName || !time || !parsedOrder) {
      return clientError(res, 400, 'token, levelId, steamName, time and order required')
    }

    const authResult = await verifyToken(token)

    if (!authResult.success) {
      return clientError(res, 401, authResult.error)
    }

    await submitRecord(
      authResult.steamId,
      steamName,
      parsedLevel,
      Number(time),
      parsedOrder
    )

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    clientError(res, 500, 'Failed to submit record')
  }
})

app.get('/ping', (_, res) => {
  res.status(200).send('ok')
})

https.createServer(sslOptions, app)
  .listen(process.env.API_PORT, () => {
    console.log(`API running on port ${process.env.API_PORT}`)
})