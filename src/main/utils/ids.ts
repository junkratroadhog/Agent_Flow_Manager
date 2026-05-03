import { randomBytes } from 'crypto'

/**
 * Generates a URL-safe unique ID.
 * Format: {prefix}_{12 random hex chars}
 */
export function generateId(prefix: string): string {
  const random = randomBytes(6).toString('hex')
  return `${prefix}_${random}`
}

export const ID_PREFIXES = {
  PROJECT: 'prj',
  SESSION: 'ses',
  MESSAGE: 'msg',
  AGENT: 'agt',
  ACTION: 'act',
  TOOL_CALL: 'tlc',
  TOOL: 'tol'
} as const
