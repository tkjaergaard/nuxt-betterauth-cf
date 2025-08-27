import { navigateTo, useRequestHeaders, useRequestURL, useRuntimeConfig, useState } from '#app'
import type {
  ClientOptions,
  InferSessionFromClient,
  InferUserFromClient,
} from 'better-auth/client'
import { createAuthClient } from 'better-auth/client'

import { defu } from 'defu'
import { computed, ref } from 'vue'

import type {
  RouteLocationRaw,
} from 'vue-router'

// @ts-expect-error Imported by nuxt
import { client as clientConfig } from '#auth/config'

interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
}

export function useAuth() {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined

  const client = createAuthClient({
    baseURL: url.origin,
    plugins: [],
    fetchOptions: {
      headers,
    },
    ...clientConfig,
  })

  const options = defu(
    useRuntimeConfig().public.auth as Partial<RuntimeAuthConfig>,
    {
      only: 'user',
      redirectUserTo: '/',
      redirectGuestTo: '/sign-in',
    },
  )

  const session = useState<InferSessionFromClient<ClientOptions> | null>(
    'auth:session',
    () => null,
  )

  const user = useState<InferUserFromClient<ClientOptions> | null>(
    'auth:user',
    () => null,
  )

  const sessionFetching = import.meta.server
    ? ref<Promise<void> | false>(false)
    : useState<Promise<void> | false>('auth:sessionFetching', () => false)

  const fetchSession = async () => {
    if (sessionFetching.value) {
      console.log('already fetching session')
      return sessionFetching.value
    }

    // eslint-disable-next-line no-async-promise-executor
    const promise = new Promise<void>(async (resolve) => {
      // @ts-expect-error headers can be undefined
      const { data } = await client.getSession({
        fetchOptions: {
          headers,
        },
      })

      session.value = data?.session || null

      user.value = data?.user || null

      sessionFetching.value = false
      return resolve()
    })

    sessionFetching.value = promise

    return promise
  }

  if (import.meta.client) {
    client.$store.listen('$sessionSignal', async (signal) => {
      if (!signal) return
      fetchSession()
    })
  }

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn: client.signIn,
    signUp: client.signUp,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      const res = await client.signOut()
      session.value = null
      user.value = null
      if (redirectTo) {
        await navigateTo(redirectTo)
      }
      return res
    },
    options,
    fetchSession,
    client,
  }
}
