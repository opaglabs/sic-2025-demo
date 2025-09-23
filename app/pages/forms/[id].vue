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

      <h1 class="text-2xl font-bold">Edit Form</h1>
    </div>
    <FormCreateAndEdit v-if="status === 'success'" v-model="data" :loading="loading" @submit="onSubmit" />
  </div>
</template>

<script setup lang="ts">
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)

const { data, status } = useAsyncData(
  `form-${route.params.id}`,
  async () => $fetch<{
    title: string
    description: string
    fields: {
      name: string
      type: string
      label: string
      required: boolean
      options: string
    }[]
  }>(`/api/forms/${route.params.id}`, {
    headers: {
      Authorization: `Bearer ${authStore.token}`
    }
  }).then((res) => ({
    ...res,
    fields: res.fields.map((field) => ({
      ...field,
      options: JSON.stringify(field.options, null, 2)
    }))
  })),
  {
    watch: [() => route.params.id],
  }
)

type Schema = z.output<typeof data>

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
  try {
    const success = await $fetch<{
      formId: string
    }>('/api/forms/' + route.params.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify(payload.data)
    })

    if (success) {
      toast.add({
        title: 'Success',
        description: 'Form updated successfully',
        color: 'success'
      })
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