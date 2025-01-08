<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Employees</h1>
      <Button variant="solid" @click="showNewEmployee = true">
        New Employee
      </Button>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="p-4">
        <p class="text-gray-600">Employee management coming soon...</p>
        <div class="mt-4 space-y-2">
          <div class="text-sm text-gray-500">Planned features:</div>
          <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Employee profiles and information</li>
            <li>Role and department management</li>
            <li>Time tracking and attendance</li>
            <li>Performance reviews and goals</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button } from 'frappe-ui'

const showNewEmployee = ref(false)
</script>
