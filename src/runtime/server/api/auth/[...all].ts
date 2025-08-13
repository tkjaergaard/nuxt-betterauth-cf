import { useAuth } from '../../utils/auth'
import { getCloudflareBindings } from '../../utils/cloudflare'
import { defineEventHandler, toWebRequest } from 'h3'

export default defineEventHandler(async (event) => {
  const { DB, KV } = getCloudflareBindings(event)
  const auth = useAuth(DB, KV, {})

  return auth.handler(toWebRequest(event))
})
