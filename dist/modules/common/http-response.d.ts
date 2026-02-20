import type { Response } from 'express';
export declare const sendSuccess: <T>(res: Response, data: T, status?: number) => Response;
export declare const sendError: (res: Response, status: number, code: string, message: string) => Response;
//# sourceMappingURL=http-response.d.ts.map