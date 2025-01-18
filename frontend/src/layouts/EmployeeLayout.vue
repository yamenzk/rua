<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <div class="text-gray-600">Loading employee...</div>
  </div>

  <div v-else class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b">
      <div class="flex items-center gap-3 overflow-hidden">
        <button
          @click="router.push('/employees')"
          class="flex-shrink-0 text-gray-500 hover:text-gray-700"
        >
          <FeatherIcon name="arrow-left" class="w-5 h-5" />
        </button>
        <Avatar
          :shape="'square'"
          :ref_for="true"
          :image="selectedEmployee?.image"
          :label="selectedEmployee?.employee_name?.substring(0, 2)"
          size="md"
          class="flex-shrink-0"
        />
        <div class="flex items-center gap-3 min-w-0">
          <h1 class="text-xl font-bold text-gray-900 truncate">
            {{ selectedEmployee?.employee_name }}
          </h1>
          <div class="flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {{ selectedEmployee?.position }}
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 pt-16 pb-16 md:pb-0">
      <!-- Sidebar for desktop -->
      <aside class="hidden md:block md:fixed md:inset-y-16 md:w-64 bg-white border-r">
        <div class="flex flex-col h-full">
          <nav class="flex-1 px-4 py-4 space-y-1">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.to"
              class="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
              :class="{ 'bg-gray-100': route.path === item.to }"
            >
              <FeatherIcon :name="item.icon" class="h-5 w-5 mr-3 text-gray-500" />
              {{ item.name }}
            </router-link>
          </nav>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 md:ml-64">
        <router-view
          :employee="selectedEmployee"
          :employeeResource="selectedEmployeeResource"
        ></router-view>
      </main>

      <!-- Bottom navigation for mobile -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
        <div class="flex justify-around px-4 py-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            class="flex flex-col items-center px-2 py-1 min-w-[4rem]"
            :class="{ 'text-gray-900': route.path === item.to, 'text-gray-500': route.path !== item.to }"
          >
            <FeatherIcon :name="item.icon" class="h-6 w-6" />
            <span class="text-xs mt-1 whitespace-nowrap">{{ item.name }}</span>
          </router-link>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Avatar, FeatherIcon, createDocumentResource } from 'frappe-ui'
import { employeeResource } from '@/data/employee'
import { hasRole } from '@/data/roles'

const router = useRouter()
const route = useRoute()
const isLoading = ref(true)
const selectedEmployeeResource = ref(null)

// Get selected employee from the list resource
const selectedEmployee = computed(() => {
  return employeeResource.data?.find(emp => emp.name === route.params.id)
})

// Watch for changes in employee ID and recreate document resource
watch(() => route.params.id, (newId) => {
  if (newId && $socket?.connected) {
    initializeEmployeeResource(newId)
  }
})

// Initialize document resource for selected employee
function initializeEmployeeResource(employeeId) {
  try {
    selectedEmployeeResource.value = createDocumentResource({
      doctype: 'RUA Employee',
      name: employeeId,
      auto: true,
      realtime: true,
    }, { $socket })
    
    isLoading.value = false
  } catch (error) {
    console.error('Error creating employee resource:', error)
  }
}

onMounted(() => {
  // Check if we have both the list data and socket connection
  const initializeResource = () => {
    if ($socket?.connected && employeeResource.data?.length > 0) {
      if (selectedEmployee.value) {
        initializeEmployeeResource(route.params.id)
      } else {
        router.push('/employees')
      }
    } else {
      setTimeout(initializeResource, 100)
    }
  }

  initializeResource()

  // Cleanup timeout after 5 seconds
  setTimeout(() => {
    if (isLoading.value) {
      router.push('/employees')
    }
  }, 5000)
})

// Role-based access control
const isManager = hasRole('RUA Manager')

const navigation = computed(() => [
  { name: 'Overview', to: `/employee/${route.params.id}/overview`, icon: 'user' },
  { name: 'Attendance', to: `/employee/${route.params.id}/attendance`, icon: 'calendar' },
  { name: 'Documents', to: `/employee/${route.params.id}/documents`, icon: 'file' },
])
</script>