import type { D1Database, KVNamespace } from '@cloudflare/workers-types'
import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import defu from 'defu'
import { drizzle } from 'drizzle-orm/d1'
import { getRequestURL } from 'h3'
import { useEvent } from 'nitropack/runtime/context'

export function createAuthClientServer<K extends Omit<BetterAuthOptions, 'database' | 'secondaryStorage' | 'baseURL'>, T extends Record<string, unknown> | undefined>(DB: D1Database, KV: KVNamespace, options: K, schemas?: T): ReturnType<typeof getAuthServerInstance> {
  const db = useDB(DB, schemas)

  const config = defu(options, { emailAndPassword: {
    enabled: true,
  } })

  return getAuthServerInstance(db, KV, config)
}

function getSecondaryStorage(KV: KVNamespace) {
  return {
    get: key => KV.get(`_auth:${key}`),
    set: (key, value, ttl) =>
      KV.put(`_auth:${key}`, value, { expirationTtl: ttl }),
    delete: key => KV.delete(`_auth:${key}`),
  } as BetterAuthOptions['secondaryStorage']
}

function getDrizzleAdapter(db: ReturnType<typeof useDB>) {
  return drizzleAdapter(db, {
    provider: 'sqlite',
  })
}

function getAuthServerInstance(db: ReturnType<typeof useDB>, KV: KVNamespace, config: Omit<BetterAuthOptions, 'database' | 'secondaryStorage' | 'baseURL'>) {
  const auth = betterAuth({
    database: getDrizzleAdapter(db),
    secondaryStorage: getSecondaryStorage(KV),
    baseURL: getBaseURL(),
    ...(config as object),
  })

  return auth
}

export function useDB<T extends Record<string, unknown> | undefined>(
  DB: D1Database,
  schemas?: T,
) {
  return drizzle<NonNullable<T>>(DB, { schema: schemas })
}

export function getBaseURL() {
  let baseURL = process.env.BETTER_AUTH_URL

  if (!baseURL) {
    try {
      baseURL = getRequestURL(useEvent()).origin
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    catch (e: unknown) {}
  }

  return baseURL
}
