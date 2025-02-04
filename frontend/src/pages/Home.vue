<template>
  <WelcomeScreen
    v-if="showWelcome"
    :username="session.user"
    :onComplete="handleWelcomeComplete"
  />
  
  <div class="space-y-8">
    <!-- Project Map Section -->
        <UAEMap />


        <!-- Welcome Section -->
    <div class="flex items-center justify-between px-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-primary-50 p-2">
          <FeatherIcon 
            :name="timeBasedIcon" 
            class="h-5 w-5 text-primary-600" 
          />
        </div>
        <h2 class="text-xl font-semibold text-gray-900">
          {{ timeBasedGreeting }}, {{ session.employee_name }}!
        </h2>
      </div>
    </div>
    <!-- Quick Stats Section -->
    <div class="animate-fade-in px-4">
      <QuickStats />
    </div>

    <!-- Action Items Section -->
    <div class="bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">Action Items</h3>
        <button class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-500">
          <FeatherIcon name="more-horizontal" class="h-5 w-5" />
        </button>
      </div>
      <ActionItems />
    </div>

    
  </div>
</template>

<script setup>
import { ref, onMounted, h, inject, onUnmounted, Transition, computed } from 'vue'
import { session } from '../data/session'
import WelcomeScreen from './WelcomeScreen.vue'
import UAEMap from './UAEMap.vue'
import QuickStats from './QuickStats.vue'
import ActionItems from './ActionItems.vue'
import { formatDate, getServerDate, DATE_FORMATS } from '@/utils/format'
import { FeatherIcon } from 'frappe-ui'

const showWelcome = ref(false)
const setHeaderAction = inject('setHeaderAction')
const weatherData = ref(null)
const showPhase = ref('date')  // To track which phase is being shown ('date', 'time', 'weather')
const intervalRef = ref(null)
const currentTime = ref('')

const timeBasedGreeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 22) return 'Good evening'
  return 'Happy late night'
})

const timeBasedIcon = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'sunrise'
  if (hour >= 12 && hour < 17) return 'sun'
  if (hour >= 17 && hour < 22) return 'sunset'
  return 'moon'
})

// Register cleanup first before async operations
onUnmounted(() => {
  if (intervalRef.value) clearInterval(intervalRef.value)
})

// Function to format and update the current time
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    const response = await fetch(
      'http://api.weatherapi.com/v1/current.json?key=d93ba9a60adc499ea58230427250302&q=auto:ip'
    )
    if (!response.ok) throw new Error('Weather fetch failed')
    weatherData.value = await response.json()

    // Set up cycling between the phases (date, time, weather)
    intervalRef.value = setInterval(() => {
      if (showPhase.value === 'date') {
        showPhase.value = 'time'
      } else if (showPhase.value === 'time') {
        showPhase.value = 'weather'
      } else {
        showPhase.value = 'date'
      }
    }, 8000) // Cycle every 8 seconds

    // Set up time update every minute
    setInterval(updateTime, 60000) // Update time every minute
    updateTime() // Initialize the time immediately

    // Create header content with safe data access
    setHeaderAction(
      h('div', { class: 'flex items-center gap-4 mr-4' }, [
        h(Transition, {
          name: 'cycle-fade',
          mode: 'out-in'
        }, () => showPhase.value === 'weather' && weatherData.value?.current
          ? h('div', { 
              key: 'weather',
              class: 'flex items-center gap-2'
            }, [
              h('img', {
                src: `https:${weatherData.value.current.condition.icon}`,
                class: 'w-8 h-8',
                alt: 'Weather icon'
              }),
              h('span', { class: 'text-sm font-medium' }, 
                `${weatherData.value.current.temp_c}°C`
              )
            ])
          : showPhase.value === 'time'
          ? h('div', {
              key: 'time',
              class: 'text-right text-sm text-gray-500'
            }, [
              h('div', { class: 'text-xs font-medium text-gray-900' }, currentTime.value) // Display time
            ])
          : h('div', {
              key: 'date',
              class: 'text-right'
            }, [
              h('div', { class: 'text-xs font-medium text-gray-900' },
                formatDate(getServerDate(), DATE_FORMATS.FULL_LONG)
              )
            ])
        )
      ])
    )

  } catch (error) {
    console.error('Error loading weather:', error)
    // Fallback to showing only date and time
    setHeaderAction(
      h('div', { class: 'text-right' }, [
        h('div', { class: 'text-xs font-medium text-gray-900' }, 'Current Date'),
        h('div', { class: 'text-xs text-gray-500' },
          formatDate(getServerDate(), DATE_FORMATS.FULL_LONG)
        ),
        h('div', { class: 'text-xs text-gray-500' },
          currentTime.value // Display the current time
        )
      ])
    )
  }
})
</script>

<style>
.cycle-fade-enter-active,
.cycle-fade-leave-active {
  transition: all 0.5s ease;
}

.cycle-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.cycle-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
