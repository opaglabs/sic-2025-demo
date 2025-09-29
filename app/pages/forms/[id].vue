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
    <FormCreateAndEdit v-if="status === 'success' && Object.keys(form).length > 0" v-model="form" :loading="loading" @submit="onSubmit" />
    <span v-else>Carregando...</span>
  </div>
</template>

<script setup lang="ts">
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

interface DataRequest {
  title: string
  description: string
  fields: {
    name: string
    type: string
    label: string
    required: boolean
    options: string
  }[]
}

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)

const { data, status } = useAsyncData(
  `form-${route.params.id}`,
 async () => {
  try {
    const response =  await $fetch<DataRequest>(`/api/forms/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    }).then((res) => ({
      ...res,
      fields: res.fields.map((field) => ({
        ...field,
        options: JSON.stringify(field.options, null, 2)
      }))
    }))

    return response;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return {};
  }
 }
);

const form = ref<DataRequest>({} as DataRequest);

watchEffect(() => {
  if (data.value) {
    form.value = { ...data.value } as DataRequest
  }
})

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