<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-white border-b">
      <div class="flex items-center gap-3">
        <img src="/logo.png" alt="Logo" class="h-8 w-auto" @error="$event.target.style.display='none'" />
        <h1 class="text-xl font-bold text-gray-900">
          <template v-if="$route.path === '/'">Rua Company</template>
          <template v-else>{{ pageTitle }}</template>
        </h1>
      </div>
      <component v-if="headerAction" :is="headerAction" />
    </header>

    <div class="flex-1 flex pt-16">
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
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6 md:ml-64 pb-20 md:pb-6">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </main>

      <!-- Bottom navigation for mobile -->
      <nav class="overflow-x-auto md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t px-4 py-2 ">
        <div class="flex justify-around">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            class="flex flex-col items-center px-2 py-1"
            :class="{ 'text-gray-900': $route.path === item.to, 'text-gray-500': $route.path !== item.to }"
          >
            <FeatherIcon
              :name="item.icon"
              class="h-6 w-6"
            />
            <span class="text-xs mt-1">{{ item.name }}</span>
          </router-link>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { FeatherIcon } from 'frappe-ui'
import { computed, provide, ref } from 'vue'
import { useRoute } from 'vue-router'

const headerAction = ref(null)
provide('setHeaderAction', (action) => {
  headerAction.value = action
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
  { name: 'Settings', to: '/settings', icon: 'settings' },
]
</script>