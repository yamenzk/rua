<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
    </div>

    <div class="bg-white rounded-lg shadow divide-y">
      <div class="p-4 space-y-4">
        <h2 class="text-lg font-medium text-gray-900">Company Settings</h2>
        <div class="space-y-3">
          <Input
            label="Company Name"
            v-model="settings.companyName"
            placeholder="Enter company name"
          />
          <FileUploader
            label="Company Logo"
            accept="image/*"
            :preview="settings.logo"
            @change="onLogoChange"
          />
        </div>
      </div>

      <div class="p-4 space-y-4">
        <h2 class="text-lg font-medium text-gray-900">Preferences</h2>
        <div class="space-y-3">
          <Switch
            v-model="settings.notifications"
            label="Enable Email Notifications"
          />
          <Select
            v-model="settings.theme"
            label="Theme"
            :options="themeOptions"
          />
        </div>
      </div>

      <div class="p-4">
        <Button
          variant="solid"
          class="w-full sm:w-auto"
          :loading="saving"
          @click="saveSettings"
        >
          Save Changes
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button, Input, FileUploader, Switch, Select } from 'frappe-ui'

const saving = ref(false)
const settings = ref({
  companyName: '',
  logo: null,
  notifications: true,
  theme: 'light'
})

const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' }
]

function onLogoChange(file) {
  // Handle logo upload
  console.log('Logo changed:', file)
}

async function saveSettings() {
  saving.value = true
  try {
    // Save settings logic here
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Settings saved:', settings.value)
  } catch (error) {
    console.error('Error saving settings:', error)
  } finally {
    saving.value = false
  }
}
</script>
