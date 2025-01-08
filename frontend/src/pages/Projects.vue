<template>
  <div class="space-y-6">
    <div v-if="isFetching" class="flex justify-center">
      <LoadingIndicator />
    </div>

    <div v-else-if="!projects.length" class="text-center py-8">
      <div class="text-gray-600">No projects found</div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in projects"
        :key="project.name"
        class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden"
      >
        <!-- Image Section with Overlay Content -->
        <div class="relative h-48">
          <img
            v-if="project.image"
            :src="project.image"
            :alt="project.project_name"
            class="h-full w-full object-cover"
            @error="$event.target.style.display='none'"
          />
          <div v-else class="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
            <FeatherIcon name="image" class="w-12 h-12" />
          </div>

          <!-- Dark Gradient -->
          <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 pointer-events-none"></div>

          <!-- Status Badge -->
          <div class="absolute top-3 right-3 z-10">
            <Badge
              :variant="'solid'"
              :ref_for="true"
              :theme="getStatusTheme(project.status)"
              size="sm"
              :label="project.status"
            >
              {{ project.status }}
            </Badge>
          </div>

          <!-- Project Info -->
          <div class="absolute top-0 left-0 right-0 bottom-0 p-4 flex flex-col justify-between">
            <h3 class="font-semibold text-lg text-white line-clamp-1 relative z-10">
              {{ project.project_name }}
            </h3>
            <p class="text-sm text-gray-200 line-clamp-2 relative z-10">
              {{ project.description || 'No description available' }}
            </p>
          </div>
        </div>

        <!-- Details Section -->
        <div class="p-4 space-y-3">
          <!-- Progress Bar -->
          <div class="space-y-1">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-600">Completion</span>
              <span class="font-medium">{{ project.completion || 0 }}%</span>
            </div>
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full transition-all duration-300"
                :style="{ width: (project.completion || 0) + '%' }"
              ></div>
            </div>
          </div>

          <!-- Location and Value -->
          <div class="flex items-center justify-between text-xs text-gray-600 gap-2">
            <div class="flex items-center min-w-0">
              <FeatherIcon name="map-pin" class="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              <span class="truncate">{{ project.location || 'Location not specified' }}</span>
            </div>
            <div class="flex items-center flex-shrink-0">
              <FeatherIcon name="dollar-sign" class="w-3.5 h-3.5 mr-1" />
              {{ formatCurrency(project.contract_value) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="projects.length" class="flex justify-between items-center">
      <!-- Pagination buttons removed as they are not implemented with useFrappeFetch -->
    </div>

    <!-- New Project Dialog -->
    <Dialog
      v-model="showNewProject"
      :options="{
        title: 'New Project',
        icon: {
          name: 'briefcase',
          appearance: 'primary'
        },
        size: 'md',
        actions: [
          {
            label: 'Cancel',
            variant: 'subtle',
            onClick: () => {
              showNewProject.value = false
            }
          },
          {
            label: 'Create',
            variant: 'solid',
            loading: isFetching,
            onClick: () => {
              return createProject()
            }
          }
        ]
      }"
    >
      <template #body-content>
        <div class="space-y-4">
          <Input
            v-model="newProject.project_name"
            label="Project Name"
            required
          />
          <Textarea
            v-model="newProject.description"
            label="Description"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, h } from 'vue'
import { Button, Input, Textarea, Dialog, Badge, FeatherIcon, LoadingIndicator } from 'frappe-ui'
import { useFrappeFetch } from 'frappe-ui'

const setHeaderAction = inject('setHeaderAction')
setHeaderAction(h(Button, {
  variant: 'solid',
  onClick: () => showNewProject.value = true,
}, () => 'New Project'))

const showNewProject = ref(false)
const newProject = ref({
  project_name: '',
  description: '',
})

const url = computed(() => {
  const fields = ['name', 'project_name', 'description', 'status', 'image', 'completion', 'location', 'contract_value']
  const params = new URLSearchParams({
    fields: JSON.stringify(fields),
    order_by: 'creation desc',
    start: '0',
    limit: '10'
  })
  return `http://localhost:8080/api/v2/document/RUA Project?${params}`
})

const { data: projectsResponse, error, isFetching } = useFrappeFetch(url).get()

const projects = computed(() => {
  return projectsResponse.value || []
})

async function createProject() {
  try {
    const response = await useFrappeFetch('/api/v2/document/RUA Project')
      .post({
        project_name: newProject.value.project_name,
        description: newProject.value.description,
      })
    
    showNewProject.value = false
    newProject.value = {
      project_name: '',
      description: '',
    }
    
    // Refetch projects
    projectsResponse.value = await useFrappeFetch(url.value).get().json()
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

function getStatusTheme(status) {
  const themes = {
    'Not Started': 'gray',
    'In Progress': 'blue',
    'Completed': 'green',
    'On Hold': 'orange',
    'Cancelled': 'red'
  }
  return themes[status] || 'gray'
}

// Format currency in AED
function formatCurrency(value) {
  if (!value) return '0'
  return `${Number(value).toLocaleString()}`
}
</script>
