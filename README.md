# Nuxt, Better Auth and Cloudflare D1

<!-- [![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href] -->

Add Better Auth to you Nuxt project powered by Cloudflare with ease.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)

## Features

<!-- Highlight some of the features your module provide here -->
- ⛰ &nbsp;Easy setup, minimal configuration
- 🚠 &nbsp;Integrates D1 and KV
- 🌲 &nbsp;Manage schemas Drizzle

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-betterauth-cf
```

Install the dependencies in your project.
```bash
pnpm add -D drizzle-kit wrangler @cloudflare/workers-types
pnpm add drizzle-kit better-auth
````

Add this to your package.json file
```json
{
  // ...
  "scripts": {
    // ...
    "db:generate": "pnpm drizzle-kit generate",
    "db:migrate": "wrangler d1 migrations apply mock --local",
    "auth:generate": "pnpx @better-auth/cli generate --output ./db/schemas/auth.ts"
  }
}
```

Create a `wrangler.jsonc` or `wranger.toml` file in the root of your project:
[https://developers.cloudflare.com/workers/wrangler/configuration/](https://developers.cloudflare.com/workers/wrangler/configuration/)


The module automatically creates these files in your project:

```
.
├── auth
│   └── config.ts
├── db
│   └── schemas
│       ├── app.ts
│       ├── auth.ts
│       └── index.ts
├── drizzle.config.ts
└── lib
    └── auth.ts
```

## Configuration
The module is somewhat opinionated in terms of how Cloudflare D1 and Cloudflare KV is integrated.
To setup modules, hooks etc. for Better Auth, go to the `auth/config.ts` file.

From here you can centrally manage your server- and client side configuration.

It's important that the file exports a `config` and `client`.

```ts
import { defineAuthConfig, defineAuthClientConfig } from 'nuxt-betterauth-cf/config'
import { username } from "better-auth/plugins"
import { usernameClient } from "better-auth/client/plugins"

export const config = defineAuthConfig({
  plugins: [username()]
})

export const client = defineAuthClientConfig({
  plugins: [usernameClient()]
})
```

## Composables
This module comes with a `useAuth` composable for easy interaction with Better Auth.
Please infer the return type to see the different helpers provided by the composable.
You can always access the raw Better Auth client through `.client`.

```vue
<script setup lang="ts">
  const auth = useAuth()

  const client = auth.client // Maps to the raw Better Auth client
</script>
```

## Server routes

This module automatically adds the api endpoint required by Better Auth.
If you want to setup protected routes you can use the `defineAuthenticatedEventHandler`.

It's auto-imported for you and works the same as `defineEventHandler` with the difference that it checks for a valid Better Auth session or throws and error.

The current session and Better Auth instance is provided through the `event.context`.

```ts
export default defineAuthenticatedEventHandler(async (event) => {
  const session = event.context.session // The current session
  const auth = event.context.auth // The Better Auth instance
})
```