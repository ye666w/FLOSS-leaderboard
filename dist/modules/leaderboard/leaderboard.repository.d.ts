import type { LevelRecordRow, PortalCountRow, PlayerRecordRow, RecordsDirection } from './leaderboard.types.js';
export declare function submitRecord(steamId: bigint, steamName: string, levelId: number, seed: number, score: number, recordsDirection?: RecordsDirection): Promise<'ok'>;
export declare function getRecordsForLevel(levelId: number, recordsDirection: RecordsDirection, recordsLimit?: number, steamId?: bigint): Promise<LevelRecordRow[]>;
export declare function getRecordsForPlayer(steamId: bigint, recordsDirection: RecordsDirection, recordsLimit?: number): Promise<PlayerRecordRow[]>;
export declare function getPortalCountWithBestRecord(recordsDirection: RecordsDirection, portalDirection: RecordsDirection, recordsLimit?: number, steamId?: bigint): Promise<PortalCountRow[]>;
//# sourceMappingURL=leaderboard.repository.d.ts.map