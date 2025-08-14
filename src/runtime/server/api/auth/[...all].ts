import { useAuthServer } from '../../utils/cloudflare'
import { defineEventHandler, toWebRequest } from 'h3'

export default defineEventHandler(async (event) => {
  const auth = useAuthServer(event)

  return auth.handler(toWebRequest(event))
})
