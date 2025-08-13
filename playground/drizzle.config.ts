import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  driver: 'd1-http',
  out: './db/migrations',
  schema: './db/schemas/index.ts',
})
