<template>
  <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
    <div class="text-gray-600">Loading employee...</div>
  </div>

  <div v-else class="min-h-screen bg-gray-50">
    <!-- Collapsible Sidebar for Desktop -->
    <aside 
      class="fixed inset-y-0 left-0 z-30 hidden flex-col transition-all duration-300 md:flex"
      :class="[isCollapsed ? 'w-16' : 'w-64']"
    >
      <!-- Header Section -->
      <div class="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
        <div class="flex items-center gap-3" v-show="!isCollapsed">
          <button
            @click="router.push('/employees')"
            class="flex items-center gap-2 text-gray-500 hover:text-gray-900"
          >
            <FeatherIcon name="arrow-left" class="h-5 w-5" />
            <span class="text-sm font-medium">Back</span>
          </button>
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

      <!-- Employee Info -->
      <div class="border-b bg-white p-4" v-show="!isCollapsed">
        <div class="flex items-center gap-3">
          <Avatar
            :shape="'square'"
            :ref_for="true"
            :image="selectedEmployee?.image"
            :label="selectedEmployee?.employee_name?.substring(0, 2)"
            size="lg"
            class="flex-shrink-0"
          />
          <div class="min-w-0 flex-1">
            <h2 class="truncate text-base font-semibold text-gray-900">
              {{ selectedEmployee?.employee_name }}
            </h2>
            <div class="mt-1 inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {{ selectedEmployee?.position }}
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 bg-white px-3 py-4">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
          :class="[
            route.path === item.to 
              ? 'bg-primary-50 text-primary-700' 
              : 'text-gray-700 hover:bg-gray-50'
          ]"
        >
          <div class="relative flex items-center gap-3">
            <FeatherIcon
              :name="item.icon"
              class="h-5 w-5"
              :class="[
                route.path === item.to 
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
            v-if="route.path === item.to"
            class="absolute inset-y-0 right-0 w-1 rounded-l-lg bg-primary-600"
          ></div>
        </router-link>
      </nav>
    </aside>

    <!-- Mobile Header -->
    <header class="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
      <div class="flex items-center gap-3 overflow-hidden">
        <button
          @click="router.push('/employees')"
          class="flex-shrink-0 text-gray-500 hover:text-gray-700"
        >
          <FeatherIcon name="arrow-left" class="h-5 w-5" />
        </button>
        <Avatar
          :shape="'square'"
          :ref_for="true"
          :image="selectedEmployee?.image"
          :label="selectedEmployee?.employee_name?.substring(0, 2)"
          size="md"
          class="flex-shrink-0"
        />
        <div class="flex min-w-0 items-center gap-2">
          <h1 class="truncate text-base font-semibold text-gray-900">
            {{ selectedEmployee?.employee_name }}
          </h1>
          <div class="flex-shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            {{ selectedEmployee?.position }}
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <div 
      class="transition-all duration-300 md:ml-64"
      :class="{ 'md:ml-16': isCollapsed }"
    >
      <main class="min-h-screen pt-16 md:pt-0 pb-16 md:pb-0">
        <router-view
          :employee="selectedEmployee"
          :employeeResource="selectedEmployeeResource"
        ></router-view>
      </main>
    </div>

    <!-- Bottom navigation for mobile -->
    <nav class="fixed bottom-0 left-0 right-0 z-20 border-t bg-white md:hidden">
      <div class="flex justify-around px-2 py-1">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="flex flex-col items-center rounded-lg px-3 py-2 transition-all duration-200"
          :class="[
            route.path === item.to 
              ? 'text-primary-600' 
              : 'text-gray-500 hover:text-gray-900'
          ]"
        >
          <FeatherIcon 
            :name="item.icon" 
            class="h-5 w-5"
            :class="[
              route.path === item.to 
                ? 'text-primary-600'
                : 'text-gray-400'
            ]"  
          />
          <span class="mt-1 text-xs">{{ item.name }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Avatar, FeatherIcon } from 'frappe-ui'
import { employeeResource, createEmployeeResource } from '@/data/employee'

const router = useRouter()
const route = useRoute()
const isLoading = ref(true)
const isCollapsed = ref(false)
const selectedEmployeeResource = ref(null)

// Get selected employee from the list resource
const selectedEmployee = computed(() => {
  return employeeResource.data?.find(emp => emp.name === route.params.id)
})

// Watch for changes in employee ID and recreate document resource
watch(() => route.params.id, (newId) => {
  if (newId) {
    initializeEmployeeResource(newId)
  }
})

// Initialize document resource for selected employee
function initializeEmployeeResource(employeeId) {
  try {
    selectedEmployeeResource.value = createEmployeeResource(employeeId)    
    isLoading.value = false
  } catch (error) {
    console.error('Error creating employee resource:', error)
  }
}

onMounted(() => {
  const initializeResource = () => {
    if (employeeResource.data?.length > 0) {
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

const navigation = computed(() => [
  { name: 'Overview', to: `/employee/${route.params.id}/overview`, icon: 'user' },
  { name: 'Attendance', to: `/employee/${route.params.id}/attendance`, icon: 'calendar' },
  { name: 'Documents', to: `/employee/${route.params.id}/documents`, icon: 'file' },
])
</script>