<template>
  <UForm :state="model" :schema="schema" class="space-y-10" @submit="onSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UFormField name="title" label="Title" required class="w-full">
        <UInput v-model="model.title" placeholder="Enter the title" type="text" class="w-full" />
      </UFormField>

      <UFormField name="description" label="Description" class="w-full">
        <UInput v-model="model.description" placeholder="Enter the description" type="text" class="w-full" />
      </UFormField>
    </div>

    <USeparator />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="(field, index) in model.fields" :key="index"
        class="space-y-6 p-4 border rounded-lg dark:border-gray-50/10 border-gray-200">
        <UFormField name="label" label="Label" required class="w-full">
          <UInput v-model="field.label" placeholder="Enter the field label" type="text" class="w-full" />
        </UFormField>

        <UFormField name="name" label="Name" required class="w-full">
          <UInput v-model="field.name" placeholder="Enter the field name" type="text" class="w-full" />
        </UFormField>

        <UFormField name="type" label="Type" required class="w-full">
          <USelect
            v-model="field.type" :items="['text', 'number', 'date', 'email', 'password', 'textarea']"
            class="w-full" />
        </UFormField>

        <UFormField name="required" label="Required" class="w-full">
          <UCheckbox v-model="field.required" />
        </UFormField>

        <UFormField name="options" label="Options (JSON)" class="w-full">
          <UTextarea
            v-model="field.options" placeholder='e.g. {"min": 0, "max": 100} for number type' class="w-full"
            :rows="3" />
        </UFormField>

        <div class="flex justify-end">
          <UButton
            type="button" icon="i-lucide-trash-2" color="error" variant="subtle"
            :disabled="model?.fields?.length === 1" @click="model?.fields?.splice(index, 1)">
            Remove
          </UButton>
        </div>
      </div>
    </div>

    <div class="flex">
      <UButton
        type="button" icon="i-lucide-plus" color="neutral" variant="subtle"
        @click="model?.fields?.push({ name: '', type: 'text', label: '', required: false, options: '' })">
        Add Field
      </UButton>
    </div>

    <div class="pt-6 flex justify-end">
      <UButton type="submit" icon="i-lucide-save" :loading="loading">
        Save Form
      </UButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as z from 'zod'

const props = defineProps<{
  modelValue?: {
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
  loading: boolean
}>()

const model = useVModel(props, 'modelValue') as WritableComputedRef<{
  title: string
  description: string
  fields: {
    name: string
    type: string
    label: string
    required: boolean
    options: string
  }[]
}>

const emit = defineEmits<{
  (e: 'submit', payload: FormSubmitEvent<Schema>): void
}>()

const onSubmit = (payload: FormSubmitEvent<Schema>) => {
  emit('submit', payload)
}

type Schema = z.output<typeof model>

const schema = z.object({
  title: z.string().min(2, 'Must be at least 2 characters'),
  description: z.string().max(100, 'Must be at most 100 characters'),
  fields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    label: z.string(),
    required: z.boolean(),
    options: z.string().transform((val) => {
      try {
        return val ? JSON.parse(val) : {}
      } catch {
        return {}
      }
    }),
  })).optional()
})
</script>