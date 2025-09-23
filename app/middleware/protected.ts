export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()
  await authStore.checkAuth()

  if (!authStore.user) {
    return navigateTo('/login')
  }
})