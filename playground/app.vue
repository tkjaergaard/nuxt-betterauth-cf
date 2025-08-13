<template>
  <div>
    Nuxt module playground!
  </div>

  <pre>{{ session }}</pre>

  <pre>{{ user }}</pre>

  <pre>{{ options }}</pre>

  <pre>{{ client }}</pre>
</template>

<script setup langs="ts">
import { client } from '#auth/config'

const { session, user, options } = useAuth()
</script>
