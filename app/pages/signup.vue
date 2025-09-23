<template>
  <PagesSignupForm />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['guest'],
  layout: 'auth'
})

useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started'
})
</script>