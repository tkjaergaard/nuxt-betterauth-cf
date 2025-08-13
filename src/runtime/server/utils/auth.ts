import { useEvent } from 'nitropack/runtime/context'
import type { D1Database, KVNamespace } from '@cloudflare/workers-types'
import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getRequestURL } from 'h3'
import { useDB } from './db'
import defu from 'defu'

export function useAuth(DB: D1Database, KV: KVNamespace, options: Omit<BetterAuthOptions, 'database' | 'secondaryStorage' | 'baseURL'> = {}): ReturnType<typeof betterAuth> {
  const db = useDB(DB)

  const config = defu(options, { emailAndPassword: {
    enabled: true,
  } })

  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    secondaryStorage: {
      get: key => KV.get(`_auth:${key}`),
      set: (key, value, ttl) =>
        KV.put(`_auth:${key}`, value, { expirationTtl: ttl }),
      delete: key => KV.delete(`_auth:${key}`),
    },
    baseURL: getBaseURL(),
    ...config,
  })

  return auth
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
