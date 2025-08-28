/**
/**
 * This file is only intended for generating the auth schema.
 * It is not intended for use in your application.
 */
import { config } from '../auth/config'
import { createAuthClientServer } from 'nuxt-betterauth-cf/auth'

import type {
  D1Database,
  KVNamespace,
} from '@cloudflare/workers-types'

export const auth = createAuthClientServer(
  {} as D1Database,
  {} as KVNamespace,
  config,
)
