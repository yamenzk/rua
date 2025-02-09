<template>
  <div class="p-6 space-y-6">
    <div v-if="!props.projectResource.doc" class="flex justify-center py-12">
      <LoadingIndicator />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Project Branches</h1>
        <Button 
          variant="solid" 
          theme="gray"
          @click="showNewBranch = true"
        >
          <template #prefix>
            <FeatherIcon name="plus" class="w-4 h-4" />
          </template>
          New Branch
        </Button>
      </div>

      <!-- Empty state -->
      <div v-if="!branches.length" class="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm">
        <div class="text-center max-w-md">
          <div class="bg-gray-100 rounded-full p-6 inline-block mb-6">
            <FeatherIcon name="git-branch" class="w-12 h-12 text-gray-900" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">No Branches Created</h3>
          <p class="text-gray-600 mb-6">
            This project doesn't have any branches yet. Create a new branch to expand your project.
          </p>
          <Button 
            variant="solid" 
            theme="gray"
            @click="showNewBranch = true"
          >
            Create First Branch
          </Button>
        </div>
      </div>

      <!-- Branches List -->
      <div v-else class="space-y-6 max-w-4xl mx-auto">
        <div 
          v-for="(project, index) in branches" 
          :key="project.name" 
          class="relative group"
        >
          <!-- Connecting Line -->
          <div
            v-if="index !== branches.length - 1"
            class="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 group-last:hidden"
          ></div>

          <!-- Project Card -->
          <div
  class="relative flex items-start p-6 bg-white rounded-lg transition-all border-2 border-white duration-300 ease-in-out hover:border-gray-900 cursor-pointer"
  @click="router.push(`/project/${project.name}/overview`)"
>
            <!-- Status Indicator -->
            <div
              class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 border border-gray-200"
              :class="{
                'bg-purple-50': project.status === 'Tender',
                'bg-blue-50': project.status === 'Job in Hand',
                'bg-yellow-50': project.status === 'In Progress',
                'bg-green-50': project.status === 'Completed',
                'bg-red-50': project.status === 'Cancelled',
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
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ project.project_name }}
                </h3>
                <span 
  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  :class="{
    'bg-purple-50 text-purple-800': project.status === 'Tender',
    'bg-blue-50 text-blue-800': project.status === 'Job in Hand',
    'bg-yellow-50 text-yellow-800': project.status === 'In Progress',
    'bg-green-50 text-green-800': project.status === 'Completed',
    'bg-red-50 text-red-800': project.status === 'Cancelled',
  }"
>
  {{ project.status }}
</span>
              </div>

              <!-- Progress and Value Row -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <!-- Progress -->
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Progress</span>
                    <span class="font-medium text-gray-900">
                      {{ Math.round(project.completion || 0) }}%
                    </span>
                  </div>
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
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
          title: 'Create New Branch',
          size: 'md',
          actions: [
            {
              label: 'Create Branch',
              variant: 'solid',
              theme: 'gray',
              loading: creating,
              onClick: createBranch,
              disabled: !newProject.additional_work || !props.projectResource.doc,
            },
          ],
        }"
      >
        <template #body-content>
          <div class="space-y-6">
            <!-- Parent project info -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div class="text-sm text-gray-500">Parent Project</div>
              <div class="font-semibold text-gray-900 mt-1">
                {{ props.projectResource.doc.project_name }}
              </div>
              <div class="text-sm text-gray-600 mt-1">
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
import { Button, FeatherIcon, LoadingIndicator, Dialog, FormControl } from 'frappe-ui'
import { projectResource } from '@/data/project'
import { formatCurrency } from '@/utils/format'

const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
  },
  isCollapsed: {
    type: Boolean,
    default: false
  }
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