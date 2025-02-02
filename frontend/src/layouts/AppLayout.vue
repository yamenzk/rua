<template>
  <div class="min-h-screen flex flex-col relative">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-white border-b">
      <div class="flex items-center gap-3">
        <img src="/logo.png" alt="Logo" class="h-8 w-auto" @error="$event.target.style.display='none'" />
        <h1 class="text-xl font-bold text-gray-900">
          <template v-if="$route.path === '/'">Rua Company</template>
          <template v-else>{{ pageTitle }}</template>
        </h1>
      </div>
      
      <!-- Right side of header with conditional rendering -->
      <div class="flex items-center gap-4">
        <!-- What's New Button -->
        <button 
          @click="showWhatsNew = true"
          class="whats-new-btn relative flex items-center gap-2 px-4 py-1.5 text-sm 
                font-medium rounded-full overflow-hidden group hidden md:flex"
        >
          <!-- Animated border -->
          <div class="absolute inset-0 border-2 rounded-full border-transparent
                    bg-clip-border animate-gradient-border"></div>

          <!-- Content container -->
          <div class="relative z-10 flex items-center gap-2">
            <span class="text-gray-700">What's New</span>
            <!-- Custom Sparkle Icon -->
            <div class="relative">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                class="sparkle-group"
              >
                <!-- Large sparkle -->
                <path 
                  d="M16 8L19 9L16 10L15 13L14 10L11 9L14 8L15 5L16 8Z" 
                  class="sparkle large-sparkle"
                  style="--delay: 0s;"
                />
                <!-- Medium sparkle -->
                <path 
                  d="M8.5 14L10.5 14.75L8.5 15.5L7.75 17.5L7 15.5L5 14.75L7 14L7.75 12L8.5 14Z"
                  class="sparkle medium-sparkle"
                  style="--delay: 0.2s;"
                />
                <!-- Small sparkle -->
                <path 
                  d="M19 13.5L20 14L19 14.5L18.5 15.5L18 14.5L17 14L18 13.5L18.5 12.5L19 13.5Z"
                  class="sparkle small-sparkle"
                  style="--delay: 0.4s;"
                />
              </svg>
            </div>
          </div>
        </button>

        <component v-if="headerAction" :is="headerAction" />
      </div>
    </header>

    <!-- Main container with proper spacing -->
    <div class="flex flex-1 pt-16 pb-16 md:pb-0">
      <!-- Sidebar for desktop -->
      <aside class="hidden md:block md:fixed md:inset-y-16 md:w-64 bg-white border-r">
        <nav class="flex-1 px-4 py-4 space-y-1">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            class="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            :class="{ 'bg-gray-100': $route.path === item.to }"
          >
            <FeatherIcon
              :name="item.icon"
              class="h-5 w-5 mr-3 text-gray-500"
            />
            {{ item.name }}
          </router-link>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 md:ml-64">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </main>
    </div>

    <!-- Bottom navigation for mobile -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
      <div class="flex justify-around px-4 py-2">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="flex flex-col items-center px-2 py-1 min-w-[4rem]"
          :class="{ 'text-gray-900': $route.path === item.to, 'text-gray-500': $route.path !== item.to }"
        >
          <FeatherIcon
            :name="item.icon"
            class="h-6 w-6"
          />
          <span class="text-xs mt-1 whitespace-nowrap">{{ item.name }}</span>
        </router-link>
      </div>
    </nav>
  </div>
  <!-- What's New Dialog -->
  <WhatsNewDialog v-model="showWhatsNew" />
  <!-- Issue Report Dialog -->
  <IssueReportDialog v-model="showIssueReport" />
</template>

<style scoped>
.whats-new-btn {
  background: transparent;
  transition: all 0.3s ease;
}

.whats-new-btn::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    115deg,
    #FF1B6B,
    #45CAFF,
    #FF1B6B,
    #FF9FDB,
    #45CAFF
  );
  background-size: 300% 300%;
  border-radius: 9999px;
  animation: borderAnimation 3s linear infinite;
  z-index: 0;
}

.whats-new-btn::after {
  content: '';
  position: absolute;
  inset: 1px;
  background: white;
  border-radius: 9999px;
  z-index: 1;
}

.whats-new-btn:hover {
  transform: translateY(-1px);
}

.whats-new-btn:hover::before {
  animation: borderAnimation 2s linear infinite;
}

/* Sparkle animations */
.sparkle {
  fill: currentColor;
  transform-origin: center;
  animation: sparkleAnimation 2s ease-in-out infinite;
  animation-delay: var(--delay);
}

.large-sparkle {
  color: #FF1B6B;
}

.medium-sparkle {
  color: #45CAFF;
}

.small-sparkle {
  color: #FF9FDB;
}

.sparkle-group:hover .sparkle {
  animation-duration: 1.5s;
}

@keyframes borderAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes sparkleAnimation {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2) rotate(20deg);
    opacity: 1;
  }
}
</style>

<script setup>
import { FeatherIcon, Dialog } from 'frappe-ui'
import { computed, provide, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import WhatsNewDialog from '@/pages/WhatsNewDialog.vue'
import IssueReportDialog from '@/pages/IssueReportDialog.vue'

const headerAction = ref(null)
provide('setHeaderAction', (action) => {
  headerAction.value = action
})

const showWhatsNew = ref(false)
const showIssueReport = ref(false)

// Shake detection configuration
const shakeConfig = {
  threshold: 15,
  timeWindow: 200,
  minShakes: 3
}

// Shake detection state
const shakeState = {
  count: 0,
  lastShake: 0
}

// Handle device motion
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

// Initialize shake detection
function initializeShakeDetection() {
  console.log('Initializing shake detection...')
  
  if ('DeviceMotionEvent' in window) {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+ requires explicit user permission
      DeviceMotionEvent.requestPermission()
        .then(response => {
          console.log('Motion permission response:', response)
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion)
            console.log('Shake detection enabled for iOS')
          }
        })
        .catch(error => {
          console.error('Error requesting motion permission:', error)
        })
    } else {
      // Non-iOS devices
      window.addEventListener('devicemotion', handleMotion)
      console.log('Shake detection enabled for non-iOS')
    }
  } else {
    console.log('DeviceMotion is not supported on this device/browser')
  }
}

onMounted(() => {
  // Initialize shake detection
  initializeShakeDetection()
  
  // Keyboard shortcuts for desktop
  window.addEventListener('keydown', (e) => {
    // Alt + I
    if (e.altKey && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      showIssueReport.value = true
      return
    }
    
    // Alt + H
    if (e.altKey && e.key.toLowerCase() === 'h') {
      e.preventDefault()
      showIssueReport.value = true
      return
    }
    
    // Ctrl + Alt + Shift
    if (e.ctrlKey && e.altKey && e.shiftKey) {
      e.preventDefault()
      showIssueReport.value = true
      return
    }
  })
})

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
</script>