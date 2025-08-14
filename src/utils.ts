import fs from 'node:fs/promises'
import { addTypeTemplate, type Resolver } from '@nuxt/kit'

const DRIZZLE_CONFIG = `import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  driver: 'd1-http',
  out: './db/migrations',
  schema: './db/schemas/index.ts',
})
`

const AUTH_CLI_FILE = `/**
/**
 * This file is only intended for generating the auth schema.
 * It is not intended for use in your application.
 */

import { createJiti } from 'jiti'
import { createResolve } from "mlly";

const _resolve = createResolve({ url: import.meta.url });

const jiti = createJiti(import.meta.url, {
  alias: {
    '#auth/config': await _resolve("../auth/config.ts"),
  }
});

const { useAuth } = await jiti.import('nuxt-betterauth-cf/auth') as { useAuth: typeof import('nuxt-betterauth-cf/auth').useAuth }

import type {
  D1Database,
  KVNamespace,
} from '@cloudflare/workers-types'

export const auth = useAuth(
  {} as D1Database,
  {} as KVNamespace,
)
`

const AUTH_CONFIG_FILE = `import { defineAuthConfig, defineAuthClientConfig } from 'nuxt-betterauth-cf/config'

export const config = defineAuthConfig()

export const client = defineAuthClientConfig()
`

export async function fileExists(filePath: string): Promise<boolean> {
  return fs.access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

export async function ensureDrizzleConfig(resolver: Resolver) {
  const path = resolver.resolve('./drizzle.config.ts')

  const exists = await fileExists(path)

  if (exists) {
    return
  }

  await fs.writeFile(path, DRIZZLE_CONFIG, 'utf-8')
}

export async function ensureAuthFile(resolver: Resolver) {
  const path = resolver.resolve('./lib/auth.ts')

  const exists = await fileExists(path)

  if (exists) {
    return
  }

  await fs.mkdir(resolver.resolve('./lib'), { recursive: true })

  await fs.writeFile(resolver.resolve('./lib/auth.ts'), AUTH_CLI_FILE, 'utf-8')
}

export async function ensureAuthSchemaFile(resolver: Resolver) {
  const path = resolver.resolve('./db/schemas/auth.ts')

  const exists = await fileExists(path)

  if (exists) {
    return
  }

  await fs.writeFile(path, `// To generate the Better Auth schema, run the following command:
// pnpx @better-auth/cli generate --output ./db/schemas/auth.ts
`)
}

export async function ensureAppSchemaFile(resolver: Resolver) {
  const path = resolver.resolve('./db/schemas/app.ts')

  const exists = await fileExists(path)

  if (exists) {
    return
  }

  await fs.writeFile(path, `// Define your Drizzle schemas here`)
}

export async function ensureSchemaFiles(resolver: Resolver) {
  const path = resolver.resolve('./db/schemas/index.ts')

  const exists = await fileExists(path)

  if (exists) {
    return
  }

  await fs.mkdir(resolver.resolve('./db/schemas'), { recursive: true })

  await Promise.all([
    fs.writeFile(path, `export * from './auth'
export * from './app'
`),

    ensureAuthSchemaFile(resolver),
    ensureAppSchemaFile(resolver)])
}

export const TYPE_DECLARATIONS = `export type MiddlewareOptions = false | {
  /**
   * Only apply auth middleware to guest or user
   */
  only?: 'guest' | 'user'
  /**
   * Redirect authenticated user to this route
   */
  redirectUserTo?: string
  /**
   * Redirect guest to this route
   */
  redirectGuestTo?: string
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig extends SharedPublicRuntimeConfig {
    auth?: MiddlewareOptions
  }
}

declare module '#app' {
  interface PageMeta {
    auth?: MiddlewareOptions
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    auth?: MiddlewareOptions
  }
}

export {}
`

export function ensureTypesDeclarations() {
  addTypeTemplate({
    filename: 'types/auth.d.ts',
    getContents: () => TYPE_DECLARATIONS })
}

export async function ensureAuthConfigFile(resolver: Resolver) {
  const path = resolver.resolve('./auth/config.ts')

  const exists = await fileExists(path)

  if (exists) {
    return
  }

  await fs.mkdir(resolver.resolve('./auth'), { recursive: true })

  fs.writeFile(path, AUTH_CONFIG_FILE, 'utf-8')
}
