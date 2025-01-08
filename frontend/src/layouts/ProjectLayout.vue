<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b">
      <div class="flex items-center gap-3 overflow-hidden">
        <button @click="router.back()" class="flex-shrink-0 text-gray-500 hover:text-gray-700">
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

    <div class="flex-1 flex pt-16"> <!-- Added pt-16 to account for fixed header -->
      <!-- Sidebar for desktop -->
      <aside class="hidden md:flex w-64 flex-col bg-white border-r">
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
<div class="px-4 pb-4 mt-auto">
  <ProjectMap
    :coords="projectData?.coords"
    :is-manager="isManager"
    :mini-map="true"
    @update:coords="updateProjectCoords"
  />
</div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <router-view 
          :project="projectData"
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Avatar, FeatherIcon } from 'frappe-ui'
import { createDocumentResource } from 'frappe-ui'
import { session } from '../data/session'
import ProjectMap from '../pages/ProjectMap.vue'

const router = useRouter()
const route = useRoute()

const projectResource = createDocumentResource({
  doctype: 'RUA Project',
  name: route.params.id,
  auto: true,
})

const projectData = computed(() => projectResource.doc)

// Role-based access control
const isManager = computed(() => {
  return session.userRoles.some(role => ['RUA Manager', 'RUA Project Manager'].includes(role))
})

// Handle map coordinate updates
async function updateProjectCoords(newCoords) {
  try {
    await projectResource.setValue.submit({
      coords: JSON.stringify(newCoords)
    })
    await projectResource.reload()
  } catch (error) {
    console.error('Failed to update coordinates:', error)
  }
}

const navigation = computed(() => [
  { name: 'Overview', to: `/project/${route.params.id}/overview`, icon: 'home' },
  { name: 'Tasks', to: `/project/${route.params.id}/tasks`, icon: 'check-square' },
  { name: 'Items', to: `/project/${route.params.id}/items`, icon: 'package' },
  { name: 'Transactions', to: `/project/${route.params.id}/transactions`, icon: 'dollar-sign' },
])
</script>

<style>
/* Ensure header stays above Leaflet controls */
.leaflet-control {
  z-index: 1000;
}
</style>