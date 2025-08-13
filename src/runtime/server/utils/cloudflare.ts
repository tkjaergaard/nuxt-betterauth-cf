import type { D1Database, KVNamespace } from '@cloudflare/workers-types'
import { createError, type H3Event,
  type EventHandler,
  type EventHandlerRequest,
  type H3EventContext,
  defineEventHandler } from 'h3'
import { useAuth } from './auth'
// @ts-expect-error The alias is created by nuxt.
import { config } from '#auth/config'
import type { Session, User } from 'better-auth'

export interface CloudflareBindings {
  DB: D1Database
  KV: KVNamespace
}

/**
 * Get Cloudflare bindings from the H3Event
 *
 * @param event - H3Event from the request handler
 * @returns CloudflareBindings containing DB and KV_BETTERAUTH
 * @throws Error if bindings are not available
 */
export function getCloudflareBindings(event: H3Event): CloudflareBindings {
  const { DB, KV_BETTERAUTH } = event.context.cloudflare?.env || {}

  if (!DB || !KV_BETTERAUTH) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Database or KV not found. Make sure to setup the bindings in your wrangler.jsonc file.',
    })
  }

  return { DB, KV: KV_BETTERAUTH }
}

export function useAuthServer(event: H3Event) {
  const { DB, KV } = getCloudflareBindings(event)

  return useAuth(DB, KV, config)
}

interface AuthenticatedH3Event extends H3Event {
  context: H3EventContext & {
    // your custom props
    session: { session: Session, user: User }
    auth: ReturnType<typeof useAuthServer>
  }
}

export const defineAuthenticatedEventHandler = <
  T extends EventHandlerRequest,
  D,
>(
  handler: (event: AuthenticatedH3Event) => ReturnType<EventHandler<T, D>>,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    const auth = useAuthServer(event)

    const session = await auth.api.getSession({
      headers: event.headers,
    })

    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Authentication required',
      })
    }

    const e = event as AuthenticatedH3Event

    e.context.session = session
    e.context.auth = auth

    // Call the original handler with the authenticated event
    return handler(e)
  })
