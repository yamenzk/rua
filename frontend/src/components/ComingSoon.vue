<template>
  <div class="bg-white rounded-lg border p-6">
    <div class="flex flex-col items-center justify-center py-12">
      <FeatherIcon 
        :name="icon" 
        class="w-12 h-12 text-gray-400 mb-4" 
      />
      <p class="text-base font-medium text-gray-900">{{ label }} Coming Soon</p>
      <p class="text-sm text-gray-600">This feature is under development.</p>
    </div>
  </div>
</template>

<script setup>
import { FeatherIcon } from 'frappe-ui'

defineProps({
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  }
})
</script>
