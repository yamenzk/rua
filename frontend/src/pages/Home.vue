<template>
  <WelcomeScreen
    v-if="showWelcome"
    :username="session.user"
    :onComplete="handleWelcomeComplete"
  />
  
  <h2 class="font-bold text-lg text-gray-600 mb-4">
    Welcome {{ session.user }}!
  </h2>

  <Button @click="session.logout.submit()">Logout</Button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createResource } from 'frappe-ui'
import { session } from '../data/session'
import WelcomeScreen from './WelcomeScreen.vue'

const showWelcome = ref(false)

onMounted(() => {
  // Only show welcome screen if user just logged in
  if (session.justLoggedIn) {
    showWelcome.value = true
  }
})

const handleWelcomeComplete = () => {
  showWelcome.value = false
  session.justLoggedIn = false  // Reset the flag after welcome screen is done
}

const ping = createResource({
  url: 'ping',
  auto: true,
})

const navigation = [
  { name: 'Projects', to: '/projects', icon: 'briefcase' },
  { name: 'Inventory', to: '/inventory', icon: 'box' },
  { name: 'Employees', to: '/employees', icon: 'users' },
  { name: 'Settings', to: '/settings', icon: 'settings' },
]
</script>