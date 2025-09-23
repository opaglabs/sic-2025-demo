<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <span class="text-sm font-medium text-foreground/70 mr-2">
        Hello, {{ userName }}
      </span>
      
      <UColorModeButton />

      <UButton
        label="Logout"
        icon="i-lucide-log-out"
        color="neutral"
        variant="ghost"
        @click="authStore.logout"
      />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

const userName = computed(() => authStore.user?.name || 'Guest')
</script>
