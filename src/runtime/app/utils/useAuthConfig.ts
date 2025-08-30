import { useRequestHeaders, useRequestURL } from '#app'
import type { AuthClientConfig } from '../../config'

export function useAuthConfig<Options extends AuthClientConfig>(config?: Options) {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined

  return {
    baseURL: url.origin,
    fetchOptions: {
      headers,
    },
    ...(config || {}),
    plugins: config?.plugins ?? [] as Options['plugins'] extends undefined ? [] : Options['plugins'],
  }
}
