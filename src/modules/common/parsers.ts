export const parseOptionalPositiveInt = (value: unknown): number | undefined | null => {
  if (value == null || value === '') {
    return undefined
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

export const parseRequiredInt = (value: unknown): number | null => {
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) {
    return null
  }

  return parsed
}

export const parseBigIntValue = (value: unknown): bigint | null => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  try {
    return BigInt(value)
  } catch {
    return null
  }
}
