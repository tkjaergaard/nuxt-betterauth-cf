<script setup lang="ts">
const { client } = useAuth()

const signIn = async () => {
  await client.signIn.email({
    email: 'example@example.com',
    password: 'password',
  })
}
</script>

<template>
  <div>
    <button @click="signIn">
      Sign in
    </button>
  </div>
</template>
