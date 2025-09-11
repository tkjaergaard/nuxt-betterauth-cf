import { navigateTo, useRequestHeaders, useRuntimeConfig, useState } from '#imports'
// Remove unused import
import type { ComputedRef, Ref } from 'vue'
import { createAuthClient } from 'better-auth/client'
import { useAuthConfig } from './useAuthConfig'

import { defu } from 'defu'
import { computed, ref } from 'vue'

import type {
  RouteLocationRaw,
} from 'vue-router'
import type { AuthClientConfig } from '../../config'

interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
}

type CreateAuthClientType<T extends AuthClientConfig> = ReturnType<typeof createAuthClient<ReturnType<typeof useAuthConfig<T>>>>

type ExtractUserType<T> = T extends { user: infer U } ? U : never
type ExtractSessionType<T> = T extends { session: infer S } ? S : never

type UseAuthReturn<T extends AuthClientConfig> = {
  session: Ref<ExtractSessionType<CreateAuthClientType<T>['$Infer']['Session']> | null>
  user: Ref<ExtractUserType<CreateAuthClientType<T>['$Infer']['Session']> | null>
  loggedIn: ComputedRef<boolean>
  signOut: (options?: { redirectTo?: RouteLocationRaw }) => Promise<Response>
  options: RuntimeAuthConfig
  fetchSession: () => Promise<void>
  client: CreateAuthClientType<T>
}

export function createAuthClientComposable<Options extends AuthClientConfig>(config?: Options): UseAuthReturn<Options> {
  const headers = import.meta.server ? useRequestHeaders() : undefined

  const client = createAuthClient(useAuthConfig(config))

  const options = defu(
    useRuntimeConfig().public.auth as Partial<RuntimeAuthConfig>,
    {
      only: 'user',
      redirectUserTo: '/',
      redirectGuestTo: '/sign-in',
    },
  )

  const session = useState<typeof client.$Infer.Session | null>(
    'auth:session',
    () => null,
  )

  const user = useState<ExtractUserType<typeof client.$Infer.Session> | null>(
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
      // @ts-expect-error Bad typing
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
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      // @ts-expect-error Bad typing
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
