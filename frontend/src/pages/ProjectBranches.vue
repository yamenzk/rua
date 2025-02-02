<template>
    <div class="p-6 space-y-6">
      <div v-if="!props.projectResource.doc" class="flex justify-center py-12">
        <LoadingIndicator />
      </div>
  
      <template v-else>
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">Branches</h1>
          <Button variant="solid" @click="showNewBranch = true">
            <template #prefix>
              <FeatherIcon name="plus" class="w-4 h-4" />
            </template>
            New Branch
          </Button>
        </div>
  
        <!-- Empty state -->
        <div v-if="!branches.length" class="text-center py-12">
          <div class="max-w-sm mx-auto">
            <FeatherIcon name="git-branch" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Branches</h3>
            <p class="text-gray-500 mb-6">
              This project doesn't have any branches yet.
            </p>
            <Button variant="solid" @click="showNewBranch = true">
              Create Branch
            </Button>
          </div>
        </div>
  
        <!-- Branches List -->
        <div v-else class="space-y-4 max-w-4xl mx-auto">
          <div v-for="(project, index) in branches" :key="project.name" class="relative">
            <!-- Connecting Line -->
            <div
              v-if="index !== branches.length - 1"
              class="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200"
            ></div>
  
            <!-- Project Card -->
            <div
              class="relative flex items-start p-6 bg-white border rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
              @click="router.push(`/project/${project.name}/overview`)"
            >
              <!-- Status Circle -->
              <div
                class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4"
                :class="{
                  'bg-purple-100': project.status === 'Tender',
                  'bg-blue-100': project.status === 'Job in Hand',
                  'bg-yellow-100': project.status === 'In Progress',
                  'bg-green-100': project.status === 'Completed',
                  'bg-red-100': project.status === 'Cancelled',
                }"
              >
                <FeatherIcon
                  :name="getStatusIcon(project.status)"
                  class="w-6 h-6"
                  :class="{
                    'text-purple-600': project.status === 'Tender',
                    'text-blue-600': project.status === 'Job in Hand',
                    'text-yellow-600': project.status === 'In Progress',
                    'text-green-600': project.status === 'Completed',
                    'text-red-600': project.status === 'Cancelled',
                  }"
                />
              </div>
  
              <!-- Content -->
              <div class="flex-grow">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ project.project_name }}
                  </h3>
                  <Badge :variant="'subtle'" :theme="getStatusTheme(project.status)" size="sm">
                    {{ project.status }}
                  </Badge>
                </div>
  
                <!-- Progress and Value Row -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <!-- Progress -->
                  <div class="space-y-1">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Progress</span>
                      <span class="font-medium">{{ Math.round(project.completion || 0) }}%</span>
                    </div>
                    <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-300"
                        :class="{
                          'bg-purple-500': project.status === 'Tender',
                          'bg-blue-500': project.status === 'Job in Hand',
                          'bg-yellow-500': project.status === 'In Progress',
                          'bg-green-500': project.status === 'Completed',
                          'bg-red-500': project.status === 'Cancelled',
                        }"
                        :style="{
                          width: `${Math.round(project.completion || 0)}%`,
                        }"
                      ></div>
                    </div>
                  </div>
  
                  <!-- Contract Value -->
                  <div class="flex items-center justify-end">
                    <div class="text-right">
                      <div class="text-sm text-gray-600">Contract Value</div>
                      <div class="font-semibold text-gray-900">
                        {{ formatCurrency(project.contract_value) }}
                      </div>
                    </div>
                  </div>
                </div>
  
                <!-- Description -->
                <p class="text-sm text-gray-600 line-clamp-2">
                  {{ project.description || 'No description available' }}
                </p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- New Branch Dialog -->
        <Dialog
          v-model="showNewBranch"
          :options="{
            title: 'New Branch',
            size: 'md',
            actions: [
              {
                label: 'Create',
                variant: 'solid',
                loading: creating,
                onClick: createBranch,
                disabled: !newProject.additional_work || !props.projectResource.doc,
              },
            ],
          }"
        >
          <template #body-content>
            <div class="space-y-4">
              <!-- Parent project info -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">Parent Project</div>
                <div class="font-medium text-gray-900">
                  {{ props.projectResource.doc.project_name }}
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  {{ props.projectResource.doc.location }}
                </div>
              </div>
  
              <!-- Additional work input -->
              <FormControl
                type="text"
                label="Additional Work Name"
                v-model="newProject.additional_work"
                placeholder="e.g., Handrails for staircase"
                required
              />
            </div>
          </template>
        </Dialog>
      </template>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { Button, Badge, FeatherIcon, LoadingIndicator, Dialog, FormControl } from 'frappe-ui'
  import { projectResource } from '@/data/project'
  import { formatCurrency } from '@/utils/format'
  
  const props = defineProps({
    projectResource: {
      type: Object,
      required: true,
    },
  })
  
  const router = useRouter()
  const showNewBranch = ref(false)
  const creating = ref(false)
  const newProject = ref({
    additional_work: '',
  })
  
  
  // Compute branches directly from projectResource data
  const branches = computed(() => {
  // Ensure projectResource.data includes all projects, including child projects
  if (!props.projectResource.doc) return []
  
  // If data seems filtered, trigger a full reload
  if (projectResource.data.length === 0 || 
      !projectResource.data.some(project => project.is_child)) {
    projectResource.filters = [] // Remove any existing filters
    projectResource.reload()
    return []
  }
  
  return projectResource.data.filter(
    project => project.is_child && project.parent1 === props.projectResource.doc.name
  )
})

  
  async function createBranch() {
    if (!newProject.value.additional_work || !props.projectResource?.doc) return
  
    creating.value = true
    try {
      await projectResource.insert.submit({
        project_name: `${newProject.value.additional_work}: ${props.projectResource.doc.project_name}`,
        location: props.projectResource.doc.location || '',
        is_child: 1,
        parent1: props.projectResource.doc.name,
        retention_status: props.projectResource.doc.retention_status,
        retention_percentage: props.projectResource.doc.retention_percentage,
        enable_retention_invoicing: props.projectResource.doc.enable_retention_invoicing,
        coords: props.projectResource.doc.coords,
        parties: props.projectResource.doc.parties,
        description: `Additional work for ${props.projectResource.doc.project_name}`,
        status: 'Tender',
      })
  
      showNewBranch.value = false
      newProject.value = { additional_work: '' }
      
      // Reload project resource to refresh the list
      await projectResource.reload()
    } catch (error) {
      console.error('Error creating branch:', error)
    } finally {
      creating.value = false
    }
  }
  
  function getStatusTheme(status) {
    const themes = {
      'Tender': 'purple',
      'Job in Hand': 'blue',
      'In Progress': 'yellow',
      'Completed': 'green',
      'Cancelled': 'red',
    }
    return themes[status] || 'gray'
  }
  
  function getStatusIcon(status) {
    const icons = {
      'Tender': 'file-text',
      'Job in Hand': 'briefcase',
      'In Progress': 'clock',
      'Completed': 'check-circle',
      'Cancelled': 'x-circle',
    }
    return icons[status] || 'circle'
  }
  </script>