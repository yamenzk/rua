<template>
  <WelcomeScreen
    v-if="showWelcome"
    :username="session.user"
    :onComplete="handleWelcomeComplete"
  />
  
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="flex items-center justify-between">
      <h2 class="font-bold text-lg text-gray-900">
        Welcome {{ session.employee_name }}!
      </h2>
      <div class="text-sm text-gray-500">
        {{ getCurrentDate() }}
      </div>
    </div>

    <!-- Quick Stats Section -->
    <QuickStats />

    <!-- Action Items Section -->
    <ActionItems />

    <!-- Project Map Section -->
    <UAEMap />

    
  </div>
</template>

<script setup>
import { ref, onMounted, h, inject } from 'vue'
import { Avatar, Dropdown, FeatherIcon } from 'frappe-ui'
import { session } from '../data/session'
import WelcomeScreen from './WelcomeScreen.vue'
import UAEMap from './UAEMap.vue'
import QuickStats from './QuickStats.vue'
import ActionItems from './ActionItems.vue'

const showWelcome = ref(false)
const setHeaderAction = inject('setHeaderAction')

function getCurrentDate() {
  return new Date().toLocaleDateString('en-AE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100))
    setHeaderAction(
      h(Dropdown, {
        options: [{
          group: 'Account',
          items: [{
            label: 'Logout',
            icon: () => h(FeatherIcon, { name: 'log-out' }),
            onClick: () => session.logout.submit()
          }]
        }]
      }, () => [
        h(Avatar, {
          shape: 'circle',
          image: session.employee_image,
          label: session.employee_name?.substring(0, 2)?.toUpperCase(),
          size: 'xl',
          class: 'cursor-pointer ring-2 ring-gray-900 hover:ring-gray-700'
        })
      ])
    )
  } catch (error) {
    console.error('Error loading employee:', error)
  }
})


const handleWelcomeComplete = () => {
  showWelcome.value = false
  session.justLoggedIn = false
}
</script>