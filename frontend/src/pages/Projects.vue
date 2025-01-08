<template>
  <div class="space-y-6">
    <div v-if="isFetching" class="flex justify-center">
      <LoadingIndicator />
    </div>

    <div v-else-if="!projects.length" class="text-center py-8">
      <div class="text-gray-600">No projects found</div>
    </div>

    <div v-else class="grid gap-4">
      <div
        v-for="project in projects"
        :key="project.name"
        class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium text-lg text-gray-900">
              {{ project.project_name }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ project.description }}
            </p>
          </div>
          <Badge :variant="getStatusVariant(project.status)">
            {{ project.status }}
          </Badge>
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
import { Button, Input, Textarea, Dialog, Badge, LoadingIndicator } from 'frappe-ui'
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
  const fields = ['name', 'project_name', 'description', 'status']
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
  console.log('Raw response:', projectsResponse.value)
  return projectsResponse.value || []
})

// Watch for debugging
watch(projectsResponse, (newData) => {
  console.log('Projects response changed:', newData)
}, { immediate: true })

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

function getStatusVariant(status) {
  const variants = {
    'Not Started': 'gray',
    'In Progress': 'blue',
    'Completed': 'green',
    'On Hold': 'orange',
    'Cancelled': 'red',
    'Tender': 'purple',
  }
  return variants[status] || 'gray'
}
</script>
