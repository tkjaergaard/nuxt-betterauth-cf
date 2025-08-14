import type { H3Event } from 'h3'
import { getCloudflareBindings } from './cloudflare'
import { useDB } from './auth'

export function getDBFromEvent<T extends Record<string, unknown>>(
  event: H3Event,
  schemas: T,
): ReturnType<typeof useDB<T>> {
  const { DB } = getCloudflareBindings(event)
  return useDB<T>(DB, schemas)
}
