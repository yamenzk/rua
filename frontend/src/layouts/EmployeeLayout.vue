<template>
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-gray-600">Loading employee...</div>
    </div>
    
    <div v-else class="min-h-screen flex flex-col">
      <!-- Header -->
      <header class="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b">
        <div class="flex items-center gap-3 overflow-hidden">
          <button @click="router.push('/employees')" class="flex-shrink-0 text-gray-500 hover:text-gray-700">
            <FeatherIcon name="arrow-left" class="w-5 h-5" />
          </button>
          <Avatar
            :shape="'square'"
            :ref_for="true"
            :image="employeeData?.image"
            :label="employeeData?.employee_name?.substring(0, 2)"
            size="md"
            class="flex-shrink-0"
          />
          <div class="flex items-center gap-3 min-w-0">
            <h1 class="text-xl font-bold text-gray-900 truncate">{{ employeeData?.employee_name }}</h1>
            <div 
              class="flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {{ employeeData?.position }}
            </div>
          </div>
        </div>
      </header>
  
      <div class="flex-1 flex pt-16">
        <!-- Sidebar for desktop -->
        <aside class="hidden md:block md:fixed md:inset-y-16 md:w-64 bg-white border-r md:h-full">
          <nav class="flex-1 px-4 py-4 space-y-1">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              class="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
              :class="{ 'bg-gray-100': route.path === item.to }"
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
        <main class="flex-1 overflow-y-auto bg-gray-50 md:ml-64 pb-20 md:pb-0">
          <router-view 
            :employee="employeeData"
            :employeeResource="employeeResource"
          ></router-view>
        </main>
  
        <!-- Bottom navigation for mobile -->
        <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t px-4 py-2">
          <div class="flex justify-around">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              class="flex flex-col items-center px-2 py-1 text-gray-700"
              :class="{ 'text-blue-600': route.path === item.to }"
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
  import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Avatar, FeatherIcon } from 'frappe-ui'
import { createDocumentResource } from 'frappe-ui'
import { session } from '../data/session'
import { inject } from 'vue'

const $socket = inject('$socket')
console.log('Injected socket in employee component:', $socket)
console.log('Socket ID:', $socket?.id)
console.log('Socket connected status:', $socket?.connected)

const router = useRouter()
const route = useRoute()
const employeeResource = ref(null)
const isLoading = ref(true)

// Add socket event listeners
$socket?.on('connect', () => {
  console.log('Socket connected in employee component')
  console.log('New socket ID:', $socket.id)
})

$socket?.on('disconnect', (reason) => {
  console.log('Socket disconnected in employee component:', reason)
})

  
onMounted(() => {
  const initializeResource = () => {
    console.log('Checking for injected $socket:', $socket)
    if ($socket?.connected) {
      console.log('Socket is connected, initializing employee resource')
      try {
        employeeResource.value = createDocumentResource({
          doctype: 'RUA Employee',
          name: route.params.id,
          auto: true,
          realtime: true,
        }, 
        { $socket } // Pass vm context with socket
        )
        console.log('Employee resource created:', employeeResource.value)
        isLoading.value = false
      } catch (error) {
        console.error('Error creating resource:', error)
      }
    } else {
      console.log('Socket not connected, retrying in 100ms')
      console.log('Current socket status:', {
        exists: !!$socket,
        connected: $socket?.connected,
        id: $socket?.id
      })
      setTimeout(initializeResource, 100)
    }
  }
  initializeResource()
})
  
  const employeeData = computed(() => employeeResource.value?.doc)
  
  // Role-based access control
  const isManager = computed(() => {
    return session.userRoles?.some(role => ['RUA Manager', 'HR Manager'].includes(role))
  })
  
  const navigation = computed(() => [
    { name: 'Overview', to: `/employee/${route.params.id}/overview`, icon: 'user' },
    { name: 'Attendance', to: `/employee/${route.params.id}/attendance`, icon: 'calendar' },
    { name: 'Files', to: `/employee/${route.params.id}/files`, icon: 'file' },
  ])
  </script>