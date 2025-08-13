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

Install Drizzle and Drizzle Kit
```bash
pnpm add -D drizzle-kit
pnpm add drizzle-kit
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

## Composables

### useAuth
```vue
<script setup lang="ts">
const auth = useAuth()
</script>
```