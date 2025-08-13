export default defineAuthenticatedEventHandler(async (event) => {
  const auth = useAuthServer(event)

  return auth
})
