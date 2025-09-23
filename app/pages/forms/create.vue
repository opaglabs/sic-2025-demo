<template>
  <div>
    <div class="mb-12 flex gap-4 items-center">
      <UButton
        icon="i-lucide-chevron-left"
        to="/"
        color="neutral"
        variant="subtle"
        class="rounded-full"
      />

      <h1 class="text-2xl font-bold">Create New Form</h1>
    </div>

    <FormCreateAndEdit v-model="state" :loading="loading" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)

const state = ref({
  title: '',
  description: '',
  fields: [
    { name: '', type: 'text', label: '', required: false, options: '' }
  ]
})

type Schema = z.output<typeof state>

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
  try {
    const success = await $fetch<{
      formId: string
    }>('/api/forms/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify(payload.data)
    })

    if (success) {
      router.push('/forms/' + success.formId)
    } else {
      toast.add({
        title: 'Error',
        description: 'Invalid data',
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