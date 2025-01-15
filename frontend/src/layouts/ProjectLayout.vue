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
          :image="projectData?.image"
          :label="projectData?.project_name?.substring(0, 2)"
          size="md"
          class="flex-shrink-0"
        />
        <div class="flex items-center gap-3 min-w-0">
          <h1 class="text-xl font-bold text-gray-900 truncate">{{ projectData?.project_name }}</h1>
          <div 
            class="flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium"
            :class="{
              'bg-purple-100 text-purple-800': projectData?.status === 'Tender',
              'bg-blue-100 text-blue-800': projectData?.status === 'Job In Hand',
              'bg-yellow-100 text-yellow-800': projectData?.status === 'In Progress',
              'bg-green-100 text-green-800': projectData?.status === 'Completed',
              'bg-red-100 text-red-800': projectData?.status === 'Cancelled'
            }"
          >
            {{ projectData?.status }}
          </div>
        </div>
      </div>
    </header>

    <div class="flex-1 flex pt-16"> <!-- Account for fixed header -->
      <!-- Sidebar for desktop -->
      <aside class="hidden md:block md:fixed md:inset-y-16 md:w-64 bg-white border-r md:h-full relative">
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
        
        <!-- Sidebar Map -->
        <div class="px-4 pb-4 mt-auto absolute bottom-20 w-full">
          <ProjectMap
            :coords="projectData?.coords"
            :is-manager="isManager"
            :mini-map="true"
            @update:coords="updateProjectCoords"
          />
          <div v-if="isManager" class="mt-2">
            <Button
              :variant="'solid'"
              :ref_for="true"
              theme="red"
              size="lg"
              label="Delete Project"
              :loading="false"
              :loadingText="null"
              :disabled="false"
              @click="showDeleteDialog = true"
              class="w-full"
            >
              Delete Project
            </Button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 md:ml-64 pb-20 md:pb-0 relative">
        <router-view 
          :projectResource="projectResource"
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

  <Dialog
    v-model="showDeleteDialog"
    :options="dialogOptions"
    style="z-index: 99999 !important;"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Avatar, FeatherIcon, Button, Dialog } from 'frappe-ui'
import { createDocumentResource } from 'frappe-ui'
import { session } from '../data/session'
import ProjectMap from '../pages/ProjectMap.vue'
import { inject } from 'vue'
const $socket = inject('$socket')

const router = useRouter()
const route = useRoute()
const showDeleteDialog = ref(false)
const confirmProjectName = ref('')
const deleteError = ref('')
const projectResource = ref(null)
const isLoading = ref(true)

// Wait for socket to be available before creating the resource
// In the script setup section
onMounted(() => {
  const initializeResource = () => {
    console.log('Checking for injected $socket:', $socket)
    if ($socket?.connected) {
      console.log('Socket is connected, initializing project resource')
      try {
        projectResource.value = createDocumentResource({
          doctype: 'RUA Project',
          name: route.params.id,
          auto: true,
          realtime: true,
        }, 
        { $socket } // Pass vm context with socket
        )
        console.log('Project resource created:', projectResource.value)
        isLoading.value = false
      } catch (error) {
        console.error('Error creating project resource:', error)
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

const projectData = computed(() => projectResource.value?.doc)

// Role-based access control
const isManager = computed(() => {
  return session.userRoles?.some(role => ['RUA Manager', 'RUA Project Manager'].includes(role))
})

// Handle map coordinate updates
async function updateProjectCoords(newCoords) {
  if (!projectResource.value) return
  try {
    await projectResource.value.setValue.submit({
      coords: JSON.stringify(newCoords)
    })
    await projectResource.value.reload()
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
  message: 'This action cannot be undone. Please type "' + projectData.value?.project_name + '" to confirm.',
  actions: [
    {
      label: 'Delete Project',
      variant: 'solid',
      theme: 'red',
      loading: projectResource.value?.delete.loading,
      onClick: deleteProject
    }
  ]
}))

async function deleteProject() {
  if (!projectResource.value) return
  if (confirmProjectName.value !== projectData.value?.project_name) {
    deleteError.value = 'Project name does not match'
    return
  }
  
  try {
    await projectResource.value.delete.submit()
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
</style>