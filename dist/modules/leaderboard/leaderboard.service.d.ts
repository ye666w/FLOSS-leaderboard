import type { LevelRecordRow, PortalCountRow, PlayerRecordRow, SubmitRecordInput, ServiceResult, RecordsForLevelQuery, PortalCountQuery, RecordsForPlayerQuery } from './leaderboard.types.js';
export declare const submitRecord: (input: SubmitRecordInput) => Promise<ServiceResult<{
    result: "ok";
}>>;
export declare const getRecordsForLevel: (query: RecordsForLevelQuery) => Promise<ServiceResult<{
    records: LevelRecordRow[];
}>>;
export declare const getPortalCountWithBestRecord: (query: PortalCountQuery) => Promise<ServiceResult<{
    records: PortalCountRow[];
}>>;
export declare const getRecordsForPlayer: (query: RecordsForPlayerQuery) => Promise<ServiceResult<{
    records: PlayerRecordRow[];
}>>;
//# sourceMappingURL=leaderboard.service.d.ts.map