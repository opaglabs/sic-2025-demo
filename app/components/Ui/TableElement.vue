<template>
  <UTable :data="data" :columns="columns" class="flex-1" :loading="loading" />
</template>

<script setup lang="ts" generic="T extends object = object">
import type { TableColumn } from '@nuxt/ui'

defineProps<{
  data?: T[]
  columns?: TableColumn<T>[]
  loading?: boolean
}>()
</script>
