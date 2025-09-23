<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold mb-6">Forms</h1>

      <UButton label="New Form" icon="i-lucide-plus" to="/forms/create" />
    </div>
    <UiTableElement :data="data?.forms" :columns="columns" :loading="status === 'pending'" />
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

definePageMeta({
  middleware: ['protected']
})

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const toast = useToast()
const { copy } = useClipboard()
const authStore = useAuthStore()

type Form = {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  userId: number
  fields: number
}

const { data, status } = useAsyncData('forms', () =>
  $fetch<{
    forms: Form[]
  }>('/api/forms', {
    headers: {
      Authorization: `Bearer ${authStore.token}`
    }
  })
)

const columns: TableColumn<Form>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => {
      return new Date(row.getValue('updatedAt')).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  },
  {
    accessorKey: 'fields',
    header: 'Field Count',
    cell: ({ row }) => {
      return h(UBadge, { class: 'capitalize', variant: 'subtle', color: 'neutral' }, () =>
        row.getValue('fields')
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown'
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto',
              'aria-label': 'Actions dropdown'
            })
        )
      )
    }
  }
]

function getRowItems(row: Row<Form>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copy ID',
      onSelect() {
        copy(row.original.id)

        toast.add({
          title: 'Form ID copied to clipboard!',
          color: 'success',
          icon: 'i-lucide-circle-check'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'View details',
      to: `/forms/${row.original.id}`
    },
    {
      label: 'Delete form',
      color: 'error',
      onSelect: async () => {
        if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
          return
        }
        try {
          await $fetch(`/api/forms/${row.original.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${authStore.token}`
            }
          })

          toast.add({
            title: 'Form deleted successfully!',
            color: 'success',
            icon: 'i-lucide-circle-check'
          })

          await refreshNuxtData('forms')
        } catch (error) {
          toast.add({
            title: 'Error deleting form - ' + (error instanceof Error ? error.message : ''),
            color: 'error',
            icon: 'i-lucide-alert-circle'
          })
        }
      }
    },
  ]
}
</script>