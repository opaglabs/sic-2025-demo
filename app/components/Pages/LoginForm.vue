<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :loading="loading"
    title="Welcome back"
    icon="i-lucide-lock"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account? <ULink
        to="/signup"
        class="text-primary font-medium"
      >Sign up</ULink>.
    </template>

    <template #footer>
      By signing in, you agree to our <ULink
        to="/"
        class="text-primary font-medium"
      >Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const authStore = useAuthStore()
const router = useRouter()

const toast = useToast()

const loading = ref(false)

const fields = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Enter your email',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password',
    required: true
  }
]

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
  loading.value = true

  try {
    const success = await authStore.login(payload.data.email, payload.data.password)
    if (success) {
      router.push('/')
    } else {
      toast.add({
        title: 'Error',
        description: 'Invalid credentials',
        color: 'error'
      })
    }
  } catch (e) {
    toast.add({
      title: 'Error',
      description: 'An error occurred - ' + (e as Error).message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>