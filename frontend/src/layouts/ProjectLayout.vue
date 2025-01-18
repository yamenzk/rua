<!-- ProjectLayout.vue -->
<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <div class="text-gray-600">Loading project...</div>
  </div>
  
  <div v-else class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b">
      <div class="flex items-center gap-3 overflow-hidden">
        <button @click="router.push('/projects')" class="flex-shrink-0 text-gray-500 hover:text-gray-700">
          <FeatherIcon name="arrow-left" class="w-5 h-5" />
        </button>
        <Avatar
          :shape="'square'"
          :ref_for="true"
          :image="selectedProject?.image"
          :label="selectedProject?.project_name?.substring(0, 2)"
          size="md"
          class="flex-shrink-0"
        />
        <div class="flex items-center gap-3 min-w-0">
          <h1 class="text-xl font-bold text-gray-900 truncate">{{ selectedProject?.project_name }}</h1>
          <div 
            class="flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium"
            :class="{
              'bg-purple-100 text-purple-800': selectedProject?.status === 'Tender',
              'bg-blue-100 text-blue-800': selectedProject?.status === 'Job In Hand',
              'bg-yellow-100 text-yellow-800': selectedProject?.status === 'In Progress',
              'bg-green-100 text-green-800': selectedProject?.status === 'Completed',
              'bg-red-100 text-red-800': selectedProject?.status === 'Cancelled'
            }"
          >
            {{ selectedProject?.status }}
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 pt-16 pb-16 md:pb-0">
      <!-- Sidebar for desktop -->
      <aside class="hidden md:block md:fixed md:w-64 bg-white border-r flex flex-col justify-between h-full pb-16">
        <div class="flex flex-col h-full justify-between">
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
          
          <!-- Sidebar Map -->
          <div class="px-4 pb-4 mt-auto">
            <ProjectMap
              :coords="selectedProject?.coords"
              :is-manager="isManager"
              :mini-map="true"
              @update:coords="updateProjectCoords"
            />
            <div v-if="isManager" class="mt-2">
              <Button
                :variant="'solid'"
                theme="red"
                size="lg"
                label="Delete Project"
                :loading="false"
                :disabled="false"
                @click="showDeleteDialog = true"
                class="w-full"
              >
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main content with chat layout support -->
      <main 
        class="flex-1 overflow-y-auto bg-gray-50 md:ml-64"
        :class="{'chat-layout': isChatRoute}"
      >
        <router-view 
          v-if="selectedProjectResource"
          :projectResource="selectedProjectResource"
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

  <!-- Delete Dialog -->
  <Dialog
    v-model="showDeleteDialog"
    :options="dialogOptions"
  >
    <template #body-content>
      <div class="mt-4">
        <input
          type="text"
          v-model="confirmProjectName"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Type project name to confirm"
        />
        <p v-if="deleteError" class="mt-1 text-sm text-red-600">{{ deleteError }}</p>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Avatar, FeatherIcon, Button, Dialog } from 'frappe-ui'
import { projectResource, createProjectResource } from '@/data/project'
import { hasRole } from '@/data/roles'
import ProjectMap from '../pages/ProjectMap.vue'
import { inject } from 'vue'

const $socket = inject('$socket')
const router = useRouter()
const route = useRoute()

// State
const isLoading = ref(true)
const showDeleteDialog = ref(false)
const confirmProjectName = ref('')
const deleteError = ref('')
const selectedProjectResource = ref(null)
const initializationTimeout = ref(null)

// Get selected project from the list resource
const selectedProject = computed(() => {
  return projectResource.data?.find(proj => proj.name === route.params.id)
})

// Detect if current route is chat
const isChatRoute = computed(() => {
  return route.path.includes('/chat')
})

// Watch for changes in project ID and recreate document resource
watch(() => route.params.id, (newId) => {
  if (newId && $socket?.connected) {
    initializeProjectResource(newId)
  }
})

// Initialize document resource for selected project
async function initializeProjectResource(projectId) {
  try {
    selectedProjectResource.value = await createProjectResource(projectId, $socket)
    isLoading.value = false
  } catch (error) {
    console.error('Error creating project resource:', error)
    router.push('/projects')
  }
}

// Handle initialization with timeout
async function waitForInitialization() {
  const maxAttempts = 50 // 5 seconds with 100ms intervals
  let attempts = 0

  while (attempts < maxAttempts) {
    if ($socket?.connected && projectResource.data?.length > 0) {
      if (selectedProject.value) {
        await initializeProjectResource(route.params.id)
        return true
      } else {
        router.push('/projects')
        return false
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }

  return false
}

onMounted(async () => {
  try {
    // Set a timeout for the entire initialization process
    const timeoutPromise = new Promise((_, reject) => {
      initializationTimeout.value = setTimeout(() => {
        reject(new Error('Initialization timeout'))
      }, 5000)
    })

    // Race between initialization and timeout
    await Promise.race([
      waitForInitialization(),
      timeoutPromise
    ])
  } catch (error) {
    console.error('Failed to initialize project:', error)
    router.push('/projects')
  } finally {
    if (initializationTimeout.value) {
      clearTimeout(initializationTimeout.value)
    }
  }
})

// Role-based access control
const isManager = hasRole('RUA Project Manager')

// Handle map coordinate updates
async function updateProjectCoords(newCoords) {
  if (!selectedProjectResource.value) return
  try {
    await selectedProjectResource.value.setValue.submit({
      coords: JSON.stringify(newCoords)
    })
    await selectedProjectResource.value.reload()
  } catch (error) {
    console.error('Failed to update coordinates:', error)
  }
}

const navigation = computed(() => [
  { name: 'Overview', to: `/project/${route.params.id}/overview`, icon: 'home' },
  { name: 'Chat', to: `/project/${route.params.id}/chat`, icon: 'message-square' },
  { name: 'Items', to: `/project/${route.params.id}/items`, icon: 'package' },
  { name: 'Documents', to: `/project/${route.params.id}/documents`, icon: 'file-text' },
])

const dialogOptions = computed(() => ({
  title: 'Delete Project',
  size: 'md',
  icon: {
    name: 'alert-triangle',
    appearance: 'danger'
  },
  message: 'This action cannot be undone. Please type "' + selectedProject.value?.project_name + '" to confirm.',
  actions: [
    {
      label: 'Delete Project',
      variant: 'solid',
      theme: 'red',
      loading: selectedProjectResource.value?.delete.loading,
      onClick: deleteProject
    }
  ]
}))

async function deleteProject() {
  if (!selectedProjectResource.value) return
  if (confirmProjectName.value !== selectedProject.value?.project_name) {
    deleteError.value = 'Project name does not match'
    return
  }
  
  try {
    await selectedProjectResource.value.delete.submit()
    router.push('/projects')
  } catch (error) {
    deleteError.value = error.message || 'Failed to delete project'
  }
}
</script>

<style>
/* Ensure header stays above Leaflet controls */
.leaflet-control {
  z-index: 1000;
}

/* Chat-specific layout styles */
.chat-layout {
  @apply relative overflow-hidden;
  height: calc(100vh - 4rem); /* 4rem = h-16 of header */
}

@media (min-width: 768px) {
  .chat-layout {
    height: calc(100vh - 4rem);
  }
}
</style>