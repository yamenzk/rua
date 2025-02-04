<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Collapsible Sidebar for Desktop -->
    <aside 
      class="fixed inset-y-0 left-0 z-30 hidden flex-col transition-all duration-300 md:flex"
      :class="[isCollapsed ? 'w-16' : 'w-64']"
    >
      <!-- Logo Section -->
      <div class="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
        <div class="flex items-center gap-3" v-show="!isCollapsed">
          <img src="/logo.png" alt="Logo" class="h-8 w-auto" @error="$event.target.style.display='none'" />
          <h1 class="text-xl font-bold text-gray-900">Rua Company</h1>
        </div>
        <button 
          @click="isCollapsed = !isCollapsed"
          class="rounded-lg p-1.5 hover:bg-gray-100"
        >
          <FeatherIcon
            :name="isCollapsed ? 'chevron-right' : 'chevron-left'"
            class="h-5 w-5 text-gray-500"
          />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 bg-white px-3 py-4">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
          :class="[
            $route.path === item.to 
              ? 'bg-primary-50 text-primary-700' 
              : 'text-gray-700 hover:bg-gray-50'
          ]"
        >
          <div class="relative flex items-center gap-3">
            <FeatherIcon
              :name="item.icon"
              class="h-5 w-5"
              :class="[
                $route.path === item.to 
                  ? 'text-primary-600'
                  : 'text-gray-400 group-hover:text-gray-500'
              ]"
            />
            <span 
              :class="[isCollapsed ? 'opacity-0' : 'opacity-100']"
              class="whitespace-nowrap transition-opacity duration-200"
            >
              {{ item.name }}
            </span>
          </div>

          <!-- Active Indicator -->
          <div
            v-if="$route.path === item.to"
            class="absolute inset-y-0 right-0 w-1 rounded-l-lg bg-primary-600"
          ></div>
        </router-link>
      </nav>

      <!-- User Profile & Actions Section -->
      <div class="border-t bg-white">
        <!-- Quick Actions -->
        <div class="border-b p-3" v-show="!isCollapsed">
          <div class="flex items-center justify-around">
            <!-- What's New Button -->
            <button 
              class="group relative flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200"
              @click="showWhatsNew = true"
            >
              <div class="sparkle-animation">
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
                      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="dotGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="dotGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  <path 
                    class="star"
                    d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z"
                    fill="url(#starGradient)"
                    stroke="url(#starGradient)"
                    stroke-width="0.5"
                  />
                  <circle 
                    class="dot-1"
                    cx="20" 
                    cy="4" 
                    r="1.5"
                    fill="url(#dotGradient1)"
                  />
                  <circle 
                    class="dot-2"
                    cx="4" 
                    cy="4" 
                    r="1.5"
                    fill="url(#dotGradient2)"
                  />
                  <circle 
                    class="dot-3"
                    cx="20" 
                    cy="18" 
                    r="1.5"
                    fill="url(#dotGradient2)"
                  />
                  <circle 
                    class="dot-4"
                    cx="4" 
                    cy="18" 
                    r="1.5"
                    fill="url(#dotGradient1)"
                  />
                </svg>
              </div>
              <div class="flex flex-col items-start">
                <span class="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-xs font-medium text-transparent">
                  What's New
                </span>
                <span v-if="latestVersion" class="text-[10px] font-medium text-gray-400">
                  v{{ latestVersion }}
                </span>
              </div>
              <div 
                v-if="hasUnreadUpdates"
                class="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-500"
              />
            </button>

            <!-- Notifications -->
            <Tooltip
              text="Coming Soon"
              placement="bottom"
            >
            <button 
              class="relative rounded-lg p-2 hover:bg-gray-50"
            >
              <FeatherIcon name="bell" class="h-5 w-5 text-gray-500" />
              <div class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-500"></div>
            </button>
            </Tooltip>

            <!-- Settings -->
            <Tooltip
              text="Coming Soon"
              placement="bottom"
            >
            <button 
              class="rounded-lg p-2 hover:bg-gray-50"
              title="Settings"
            >
              <FeatherIcon name="settings" class="h-5 w-5 text-gray-500" />
            </button>
            </Tooltip>
          </div>
        </div>

        <!-- User Profile -->
        <div 
          class="p-4"
          :class="{'items-center': isCollapsed}"
        >
          <div class="flex items-center gap-3">
            <div class="relative">
              <img
                v-if="userAvatar"
                :src="userAvatar"
                alt="User"
                class="h-10 w-10 rounded-full bg-gray-200 object-cover"
              />
              <div 
                v-else
                class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600"
              >
                {{ userInitials }}
              </div>
              <div class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-400"></div>
            </div>
            <div v-show="!isCollapsed" class="flex-1 overflow-hidden">
              <h3 class="truncate text-sm font-medium text-gray-900">{{ userName }}</h3>
              <p class="truncate text-xs text-gray-500">{{ userEmail }}</p>
            </div>
            <div v-show="!isCollapsed" class="flex items-center gap-3">
              <button 
                class="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                @click="session.logout.submit"
              >
                <FeatherIcon name="log-out" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Navigation Drawer -->
    <div 
      v-show="isMobileMenuOpen" 
      class="fixed inset-0 z-40 md:hidden"
      @click="isMobileMenuOpen = false"
    >
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
      <div class="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
        <!-- Mobile Header -->
        <div class="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
          <div class="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" class="h-8 w-auto" @error="$event.target.style.display='none'" />
            <h1 class="text-xl font-bold text-gray-900">Rua Co.</h1>
          </div>
          <button 
            @click="isMobileMenuOpen = false"
            class="rounded-lg p-1.5 hover:bg-gray-100"
          >
            <FeatherIcon name="x" class="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <!-- Mobile Navigation -->
        <nav class="flex-1 space-y-1 bg-white px-3 py-4">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            class="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium"
            :class="[
              $route.path === item.to 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="isMobileMenuOpen = false"
          >
            <FeatherIcon
              :name="item.icon"
              class="mr-3 h-5 w-5"
              :class="[
                $route.path === item.to 
                  ? 'text-primary-600'
                  : 'text-gray-400'
              ]"
            />
            {{ item.name }}
          </router-link>
        </nav>

        <!-- Mobile Quick Actions -->
        <div class="border-t border-b bg-white p-4">
          <div class="flex items-center justify-around">
            <button 
              class="flex flex-col items-center gap-1 rounded-lg p-3 hover:bg-gray-50"
              @click="showWhatsNew = true"
            >
              <div class="sparkle-animation">
                <svg width="24" height="24" viewBox="0 0 24 24" class="text-primary-500" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    class="star"
                    d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="0.5"
                  />
                  <circle 
                    class="dot-1"
                    cx="20" 
                    cy="4" 
                    r="1.5"
                    fill="currentColor"
                  />
                  <circle 
                    class="dot-2"
                    cx="4" 
                    cy="4" 
                    r="1.5"
                    fill="currentColor"
                  />
                  <circle 
                    class="dot-3"
                    cx="20" 
                    cy="18" 
                    r="1.5"
                    fill="currentColor"
                  />
                  <circle 
                    class="dot-4"
                    cx="4" 
                    cy="18" 
                    r="1.5"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span class="text-xs text-gray-600">What's New</span>
            </button>

            <button class="flex flex-col items-center gap-1 rounded-lg p-3 hover:bg-gray-50">
              <div class="relative">
                <FeatherIcon name="bell" class="h-6 w-6 text-gray-500" />
                <div class="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary-500"></div>
              </div>
              <span class="text-xs text-gray-600">Notifications</span>
            </button>

            <button class="flex flex-col items-center gap-1 rounded-lg p-3 hover:bg-gray-50">
              <FeatherIcon name="settings" class="h-6 w-6 text-gray-500" />
              <span class="text-xs text-gray-600">Settings</span>
            </button>
          </div>
        </div>

        <!-- Mobile User Profile -->
        <div class="border-t bg-white p-4">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img
                v-if="userAvatar"
                :src="userAvatar"
                alt="User"
                class="h-10 w-10 rounded-full bg-gray-200 object-cover"
              />
              <div 
                v-else
                class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600"
              >
                {{ userInitials }}
              </div>
              <div class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-400"></div>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-gray-900">{{ userName }}</h3>
              <p class="text-xs text-gray-500">{{ userEmail }}</p>
            </div>
            <div class="flex items-center gap-3">
              <button 
                class="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                @click="session.logout.submit"
              >
                <FeatherIcon name="log-out" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div 
      class="transition-all duration-300 md:ml-64"
      :class="{'md:ml-16': isCollapsed}"
    >
      <!-- Header -->
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between bg-white px-4 shadow-sm">
        <!-- Left side with menu button and title -->
        <div class="flex items-center gap-4">
          <button 
            class="rounded-lg p-1.5 hover:bg-gray-100 md:hidden"
            @click="isMobileMenuOpen = true"
          >
            <FeatherIcon name="menu" class="h-6 w-6 text-gray-500" />
          </button>
          <h1 class="text-xl font-semibold text-gray-900">
            {{ pageTitle }}
          </h1>
        </div>

        <!-- Dynamic Header Actions Slot -->
        <div class="flex items-center gap-4">
          <component :is="headerAction" v-if="headerAction" />
        </div>
      </header>

      <!-- Page Content -->
      <main>
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </main>
    </div>
  </div>

  <!-- Dialogs -->
  <WhatsNewDialog v-model="showWhatsNew" />
  <IssueReportDialog v-model="showIssueReport" />
</template>

<script setup>
import { ref, computed, provide, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { FeatherIcon, Tooltip } from 'frappe-ui'
import WhatsNewDialog from '@/pages/WhatsNewDialog.vue'
import IssueReportDialog from '@/pages/IssueReportDialog.vue'
import { session } from '@/data/session'
import { updateResource } from '@/data/update'

// State
const isCollapsed = ref(false)
const isMobileMenuOpen = ref(false)
const showWhatsNew = ref(false)
const showIssueReport = ref(false)
const headerAction = ref(null)

// User data from session
const userName = ref(session.employee_name)
const userEmail = ref(session.employee)
const userAvatar = ref(session.employee_image)
const userInitials = computed(() => {
  if (!session.employee_name) return ''
  return session.employee_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
})

const latestVersion = computed(() => {
  if (!updateResource.data?.length) return null
  return [...updateResource.data]
    .sort((a, b) => b.version.localeCompare(a.version))[0]?.version
})

const hasUnreadUpdates = computed(() => {
  // implement logic to check for unread updates
  return false
})

// Provide header action setter
provide('setHeaderAction', (action) => {
  headerAction.value = action
})

// Navigation and routing
const route = useRoute()
const pageTitle = computed(() => {
  const matchedRoute = navigation.find(item => item.to === route.path)
  return matchedRoute ? matchedRoute.name : ''
})

const navigation = [
  { name: 'Home', to: '/', icon: 'home' },
  { name: 'Projects', to: '/projects', icon: 'briefcase' },
  { name: 'Inventory', to: '/inventory', icon: 'box' },
  { name: 'Employees', to: '/employees', icon: 'users' },
  { name: 'Parties', to: '/parties', icon: 'truck' },
  { name: 'Tasks', to: '/tasks', icon: 'check-square' },
]

// Keyboard shortcuts and shake detection
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      showIssueReport.value = true
    }
    if (e.altKey && e.key.toLowerCase() === 'h') {
      e.preventDefault()
      showIssueReport.value = true
    }
    if (e.ctrlKey && e.altKey && e.shiftKey) {
      e.preventDefault()
      showIssueReport.value = true
    }
  })

  if ('DeviceMotionEvent' in window) {
    initializeShakeDetection()
  }
})

function initializeShakeDetection() {
  const shakeConfig = {
    threshold: 15,
    timeWindow: 200,
    minShakes: 3
  }

  const shakeState = {
    count: 0,
    lastShake: 0
  }

  function handleMotion(event) {
    const acceleration = event.acceleration
    if (!acceleration) return

    const now = Date.now()
    const magnitude = Math.sqrt(
      Math.pow(acceleration.x, 2) +
      Math.pow(acceleration.y, 2) +
      Math.pow(acceleration.z, 2)
    )

    if (magnitude > shakeConfig.threshold) {
      if (now - shakeState.lastShake < shakeConfig.timeWindow) {
        shakeState.count++
        if (shakeState.count >= shakeConfig.minShakes) {
          showIssueReport.value = true
          shakeState.count = 0
        }
      } else {
        shakeState.count = 1
      }
      shakeState.lastShake = now
    }
  }

  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', handleMotion)
        }
      })
      .catch(console.error)
  } else {
    window.addEventListener('devicemotion', handleMotion)
  }
}
</script>

<style scoped>
.sparkle-animation {
  position: relative;
  width: 24px;
  height: 24px;
}

.sparkle-animation svg {
  position: absolute;
  top: 0;
  left: 0;
}

.star {
  transform-origin: center;
  animation: glow 2s ease-in-out infinite;
}

.dot-1,
.dot-2,
.dot-3,
.dot-4 {
  transform-origin: center;
  opacity: 0;
  filter: blur(0.5px);
}

.dot-1 { animation: blink 2s ease-in-out infinite; }
.dot-2 { animation: blink 2s ease-in-out infinite 0.5s; }
.dot-3 { animation: blink 2s ease-in-out infinite 1s; }
.dot-4 { animation: blink 2s ease-in-out infinite 1.5s; }

@keyframes glow {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 1px #a855f7);
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 2px #a855f7);
  }
}

@keyframes blink {
  0%, 100% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1);
    opacity: 0.8;
  }
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
</style>