import { defineAuthConfig, defineAuthClientConfig } from 'nuxt-betterauth-cf/config'
import { twoFactor, organization } from 'better-auth/plugins'
import { organizationClient, twoFactorClient } from 'better-auth/client/plugins'

export const config = defineAuthConfig({
  plugins: [
    twoFactor(),
    organization(),
  ],
})

export const client = defineAuthClientConfig({
  plugins: [
    twoFactorClient(),
    organizationClient(),
  ],
})

export type ClientConfig = typeof client
