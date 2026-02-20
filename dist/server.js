import express from 'express';
import https from 'https';
import fs from 'fs';
import { authRouter } from './modules/auth/auth.routes.js';
import { leaderboardRouter } from './modules/leaderboard/leaderboard.routes.js';
import { sendError } from './modules/common/http-response.js';
import { systemRouter } from './modules/system/system.routes.js';
const app = express();
app.use(express.json());
app.use(authRouter);
app.use(leaderboardRouter);
app.use(systemRouter);
app.use((error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return sendError(res, 500, 'INTERNAL_ERROR', message);
});
const API_PORT = Number(process.env.API_PORT ?? 3000);
const SSL = process.env.SSL;
if (SSL) {
    const sslOptions = {
        key: fs.readFileSync('./origin.key'),
        cert: fs.readFileSync('./origin.pem')
    };
    https.createServer(sslOptions, app).listen(API_PORT, () => {
        console.log(`API running in HTTPS on port ${API_PORT}`);
    });
}
else {
    app.listen(API_PORT, () => {
        console.log(`API running in HTTP on port ${API_PORT}`);
    });
}
//# sourceMappingURL=server.js.map