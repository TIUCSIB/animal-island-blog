import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'

import type { WorkerEnv } from './types'

export function getEnv() {
  return env as unknown as WorkerEnv
}

export function getDb() {
  return drizzle(getEnv().DB)
}
