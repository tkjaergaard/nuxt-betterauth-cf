import { useRequestHeaders, useRequestURL } from '#app'

export function useAuthConfig() {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined

  return {
    baseURL: url.origin,
    fetchOptions: {
      headers,
    },
    // @ts-expect-error Globally loaded const
    ...(authClientConfig || {}),
  }
}
