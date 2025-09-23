<template>
  <PagesLoginForm />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['guest'],
  layout: 'auth'
})

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue'
})
</script>