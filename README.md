# FLOSS Leaderboard

[FLOSS](https://store.steampowered.com/app/4003010/FLOSS/) -
a fast-paced top-down shooter without any excess. Built on aggressive movement, precise controls, and real challenge. Designed for players who love to learn, adapt, and master mechanics.

## `.env` example

```env
DB_USER=
DB_PASSWORD=
STEAM_APP_ID=4003010
STEAM_API_KEY=
JWT_SECRET=
ADMIN_API_KEY=
```

- `STEAM_APP_ID` and `STEAM_API_KEY` are obtained from Steamworks.
- Other fields can be derived from your environment, but secrets (`DB_PASSWORD`, `JWT_SECRET`, `ADMIN_API_KEY`) must be strong and securely generated.
