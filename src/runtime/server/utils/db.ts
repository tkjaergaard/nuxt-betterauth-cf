import { drizzle } from 'drizzle-orm/d1'
import type { D1Database } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'
import { getCloudflareBindings } from './cloudflare'

export function useDB<T extends Record<string, unknown> | undefined>(
  DB: D1Database,
  schemas?: T,
) {
  return drizzle<NonNullable<T>>(DB, { schema: schemas })
}

export function getDBFromEvent<T extends Record<string, unknown>>(
  event: H3Event,
  schemas: T,
): ReturnType<typeof useDB<T>> {
  const { DB } = getCloudflareBindings(event)
  return useDB<T>(DB, schemas)
}
