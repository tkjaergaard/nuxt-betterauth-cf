import type { BetterAuthOptions, ClientOptions } from 'better-auth'

type AuthConfig = Omit<BetterAuthOptions, 'database' | 'secondaryStorage' | 'baseURL'>

type AuthClientConfig = ClientOptions

export function defineAuthConfig(config: AuthConfig = {}) {
  return config
}

export function defineAuthClientConfig(config: AuthClientConfig = {}) {
  return config
}
