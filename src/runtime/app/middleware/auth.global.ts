import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { defu } from 'defu'
import { authClientConfig } from '#imports'
import { createAuthClientComposable } from '../utils/createAuthClientComposable'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/api')) {
    // Skip auth middleware for API routes
    return
  }

  // If auth is disabled, skip middleware
  if (to.meta?.auth === false) {
    return
  }
  const { loggedIn, options, fetchSession } = createAuthClientComposable(authClientConfig)
  const { only, redirectUserTo, redirectGuestTo } = defu(to.meta?.auth, options)

  /**
   * Fetch the session between each navigation.
   */
  await fetchSession()

  if (only === 'guest' && !loggedIn.value) {
    return
  }

  // If guest mode, redirect if authenticated
  if (only === 'guest' && loggedIn.value) {
    // Avoid infinite redirect
    if (to.path === redirectUserTo) {
      return
    }
    return navigateTo(redirectUserTo)
  }

  // If not authenticated, redirect to home
  if (!loggedIn.value) {
    // Avoid infinite redirect
    if (to.path === redirectGuestTo) {
      return
    }
    return navigateTo(redirectGuestTo)
  }
})
