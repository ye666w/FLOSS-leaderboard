import express from 'express'
import {
  getTop5,
  getPlayerRank,
  getPlayerRecord,
  submitRecord
} from '../db/requests.js'
import { checkSteamId } from './steamApi.js'

const app = express()
app.use(express.json())

app.get('/leaderboard/topFive', async (req, res) => {
  try {
    const levelId = parseInt(req.query.levelId)
    if (isNaN(levelId)) return res.status(400).json({ error: 'levelId is required' })

    const top5 = await getTop5(levelId)
    res.json(top5)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/leaderboard/playerRecord', async (req, res) => {
  try {
    const { steamId, levelId } = req.query
    if (!steamId || !levelId) return res.status(400).json({ error: 'steamId and levelId required' })

    const time = await getPlayerRecord(steamId, parseInt(levelId))
    res.json({ time })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/leaderboard/playerRank', async (req, res) => {
  try {
    const { steamId, levelId } = req.query
    if (!steamId || !levelId) return res.status(400).json({ error: 'steamId and levelId required' })

    const rank = await getPlayerRank(steamId, parseInt(levelId))
    res.json({ rank })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/leaderboard/submit', async (req, res) => {
  try {
    const { steamId, levelId, time } = req.body;

    if (!steamId || levelId === undefined || time === undefined) {
      return res.status(400).json({ error: 'steamId, levelId, time required' });
    }

    const isSteamIdValid = await checkSteamId(steamId);

    if (!isSteamIdValid) {
      return res.status(400).json({ error: 'Invalid Steam ID or user does not own the app' });
    }

    await submitRecord(steamId, parseInt(levelId), parseFloat(time));
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})