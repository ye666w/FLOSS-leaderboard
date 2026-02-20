import jwt from 'jsonwebtoken'
import type { Algorithm } from 'jsonwebtoken'
import { TokenPayload } from './jwt.types.js'

const TOKEN_TTL = '12h'
const JWT_ALGORITHM: Algorithm = 'HS256'

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return secret
}

export const createToken = (payload: TokenPayload): string =>
  jwt.sign(payload, getJwtSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: TOKEN_TTL
  })

export const verifyToken = (token: string): boolean => {
  try {
    jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] })
    return true
  } catch {
    return false
  }
}
