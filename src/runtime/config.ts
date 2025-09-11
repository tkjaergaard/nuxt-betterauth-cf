import type { BetterAuthOptions, ClientOptions } from 'better-auth'

export type AuthConfig = Omit<BetterAuthOptions, 'database' | 'secondaryStorage' | 'baseURL'>

export type AuthClientConfig = Partial<Omit<ClientOptions, 'fetchOptions'
  | 'disableDefaultFetchPlugins' | '$InferAuth'>>

export function defineAuthConfig<T extends AuthConfig>(config: T) {
  return config
}

export function defineAuthClientConfig<T extends AuthClientConfig>(config: T) {
  return config
}
