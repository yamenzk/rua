<template>
    <h2 class="font-bold text-lg text-gray-600 mb-4">
      Welcome {{ session.user }}!
    </h2>

      <Button @click="session.logout.submit()">Logout</Button>

</template>

<script setup>
import { ref } from 'vue'
import { Dialog } from 'frappe-ui'
import { createResource } from 'frappe-ui'
import { session } from '../data/session'
import { FeatherIcon } from 'frappe-ui'

const ping = createResource({
  url: 'ping',
  auto: true,
})

const showDialog = ref(false)

const navigation = [
  { name: 'Projects', to: '/projects', icon: 'briefcase' },
  { name: 'Inventory', to: '/inventory', icon: 'box' },
  { name: 'Employees', to: '/employees', icon: 'users' },
  { name: 'Settings', to: '/settings', icon: 'settings' },
]
</script>

<style scoped>
.router-link-active {
  @apply text-blue-600;
}
</style>
