import { addImportsDir, addServerScanDir, createResolver, defineNuxtModule, installModule, addRouteMiddleware, hasNuxtModule } from '@nuxt/kit'
import { ensureAuthConfigFile, ensureAuthFile, ensureDrizzleConfig, ensureSchemaFiles, ensureTypesDeclarations } from './utils'

// Module options TypeScript interface definition
export interface ModuleOptions {
  middleware?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-betterauth-cf',
    configKey: 'auth',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    middleware: true,
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)
    const ROOT_PATH = _nuxt.options.vite.root!

    let rootResolver = createResolver(ROOT_PATH)

    if (rootResolver.resolve('.').endsWith('app')) {
      rootResolver = createResolver(rootResolver.resolve('./..'))
    }

    _nuxt.options.alias ??= {}
    _nuxt.options.alias['#auth/config'] = rootResolver.resolve('./auth/config')
    _nuxt.options.alias['nuxt-betterauth-cf/config'] = resolver.resolve('./runtime/config')
    _nuxt.options.alias['#auth/schemas'] = rootResolver.resolve('./db/schemas/index')

    _nuxt.options.nitro.alias ??= {}
    _nuxt.options.nitro.alias['#auth/config'] = rootResolver.resolve('./auth/config')
    _nuxt.options.nitro.alias['#auth/schemas'] = rootResolver.resolve('./db/schemas/index')
    _nuxt.options.nitro.alias['nuxt-betterauth-cf/config'] = resolver.resolve('./runtime/config')

    _nuxt.hook('modules:done', async () => {
      if (_nuxt.options._prepare) {
        return
      }

      await Promise.all([
        ensureDrizzleConfig(rootResolver),
        ensureAuthFile(rootResolver),
        ensureSchemaFiles(rootResolver),
        ensureAuthConfigFile(rootResolver),
      ])
    })

    ensureTypesDeclarations()

    addServerScanDir(resolver.resolve('./runtime/server'))
    addImportsDir(resolver.resolve('./runtime/app/composables'))

    if (_options.middleware) {
      addRouteMiddleware({
        name: 'better-auth',
        path: resolver.resolve('./runtime/app/middleware/auth.global'),
        global: true,
      })
    }

    if (!hasNuxtModule('nitro-cloudflare-dev')) {
      installModule('nitro-cloudflare-dev')
    }
  },
})
