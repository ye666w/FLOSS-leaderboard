import type { Response } from 'express'

type ApiError = {
  code: string
  message: string
}

export const sendSuccess = <T>(res: Response, data: T, status = 200): Response =>
  res.status(status).json({
    success: true,
    data
  })

export const sendError = (
  res: Response,
  status: number,
  code: string,
  message: string
): Response =>
  res.status(status).json({
    success: false,
    error: {
      code,
      message
    } satisfies ApiError
  })
