<template>
  <div class="space-y-6">
    <!-- Search and Filters Section -->
    <div class="flex items-center gap-2 overflow-x-auto p-2">
      <!-- Search -->
      <FormControl
        type="search"
        :ref_for="true"
        size="sm"
        variant="subtle"
        placeholder="Search.."
        :modelValue="searchQuery"
        @update:modelValue="handleSearch"
        class="w-40 min-w-[8rem] rua-project-search"
      />

      <!-- Sort Fields Dropdown -->
      <FormControl
        type="select"
        :options="sortFieldOptions"
        size="sm"
        variant="subtle"
        placeholder="Sort"
        :modelValue="sortField"
        @update:modelValue="handleSortFieldChange"
        class="w-32 min-w-[6rem] flex-shrink-0"
      />

      <!-- Sort Direction Button -->
      <Button
        variant="subtle"
        size="sm"
        @click="toggleSortDirection"
        class="flex-shrink-0"
      >
        <FeatherIcon
          :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
          class="w-4 h-4"
        />
      </Button>

      <!-- Add Filter Button -->
      <Button
        variant="subtle"
        size="sm"
        @click="showFilterDialog = true"
        class="flex-shrink-0"
      >
        <FeatherIcon name="filter" class="w-4 h-4" />
      </Button>

      <!-- Active Filters Display -->
      <div v-if="activeFilters.length" class="flex gap-1 overflow-x-auto flex-shrink-0">
        <div
          v-for="(filter, index) in activeFilters"
          :key="index"
          class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs whitespace-nowrap"
        >
          <span>{{ getFieldLabel(filter.field) }}: {{ filter.value }}</span>
          <button
            class="text-gray-500 hover:text-gray-700"
            @click="removeFilter(index)"
          >
            <FeatherIcon name="x" class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Project Cards Grid -->
    <div v-if="list.list.loading" class="flex justify-center">
      <LoadingIndicator />
    </div>

    <div v-else-if="!list.data?.length" class="text-center py-8">
      <div class="text-gray-600">No projects found</div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      <div
        v-for="project in list.data"
        :key="project.name"
        class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden cursor-pointer"
        @click="router.push(`/project/${project.name}/overview`)"
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
              :variant="'subtle'"
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
              <span class="font-medium">{{ Math.round(project.completion || 0)}}%</span>
            </div>
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full transition-all duration-300"
                :style="{ width: (Math.round(project.completion || 0)) + '%' }"
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

    <!-- Filter Dialog -->
    <Dialog
      v-model="showFilterDialog"
      :options="{
        title: 'Add Filter',
        icon: {
          name: 'filter',
          appearance: 'primary'
        },
        size: 'sm',
        actions: [
          {
            label: 'Apply',
            variant: 'solid',
            onClick: () => {
              addFilter()
              showFilterDialog = false
            }
          }
        ]
      }"
    >
      <template #body-content>
        <div class="space-y-4">
          <FormControl
            type="select"
            :options="filterFieldOptions"
            label="Field"
            required
            v-model="newFilter.field"
          />
          
          <FormControl
            type="select"
            :options="operatorOptions"
            label="Operator"
            required
            v-model="newFilter.operator"
          />
          
          <FormControl
            v-if="newFilter.field === 'status'"
            type="select"
            :options="statusOptions"
            label="Value"
            required
            v-model="newFilter.value"
          />
          <FormControl
            v-else-if="newFilter.field === 'completion'"
            type="number"
            label="Value"
            required
            v-model="newFilter.value"
          />
          <FormControl
            v-else
            type="text"
            label="Value"
            required
            v-model="newFilter.value"
          />
        </div>
      </template>
    </Dialog>

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
            label: 'Create',
            variant: 'solid',
            loading: list.insert.loading,
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
          <Input
            v-model="newProject.location"
            label="Location"
            required
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, inject, h, onMounted } from 'vue'
import { Button, Input, Dialog, Badge, FeatherIcon, LoadingIndicator, FormControl, debounce } from 'frappe-ui'
import { useRouter } from 'vue-router'
import { projectResource } from '@/data/project'
import { hasRole } from '@/data/roles'

const router = useRouter()
const isManager = hasRole('RUA Manager')
const setHeaderAction = inject('setHeaderAction')

if (isManager) {
  setHeaderAction(h(Button, {
    variant: 'solid',
    onClick: () => showNewProject.value = true,
  }, () => 'New Project'))
} else {
  setHeaderAction(null)
}

// State
const searchQuery = ref('')
const sortField = ref('project_name')
const sortDirection = ref('asc')
const activeFilters = ref([
  {
    field: 'status',
    operator: '=',
    value: 'In Progress'
  }
])
const showFilterDialog = ref(false)
const showNewProject = ref(false)
const newFilter = ref({
  field: '',
  operator: '=',
  value: ''
})
const newProject = ref({
  project_name: '',
  description: '',
})

// Field Options
const fieldOptions = [
  { label: 'Creation Date', value: 'creation', sortOnly: true },
  { label: 'Project Name', value: 'project_name' },
  { label: 'Status', value: 'status' },
  { label: 'Location', value: 'location' },
  { label: 'Completion', value: 'completion' },
  { label: 'Contract Value', value: 'contract_value' }
]

// Derived options for filters and sorting
const filterFieldOptions = fieldOptions.filter(field => !field.sortOnly)
const sortFieldOptions = fieldOptions

const operatorOptions = [
  { label: 'Equals', value: '=' },
  { label: 'Not Equals', value: '!=' },
  { label: 'Greater Than', value: '>' },
  { label: 'Less Than', value: '<' },
  { label: 'Greater or Equal', value: '>=' },
  { label: 'Less or Equal', value: '<=' },
  { label: 'Like', value: 'like' }
]

const statusOptions = [
  { label: 'Not Started', value: 'Not Started' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'On Hold', value: 'On Hold' },
  { label: 'Cancelled', value: 'Cancelled' }
]

const list = projectResource
onMounted(async () => {
  // Initialize with default filter to exclude child projects
  list.filters = [['is_child', '!=', 1]]
  await list.reload()  // Add await here
})


// Handlers
const handleSearch = debounce((value) => {
  searchQuery.value = value
  if (value) {
    activeFilters.value = activeFilters.value.filter(f => f.field !== 'project_name')
    activeFilters.value.push({
      field: 'project_name',
      operator: 'like',
      value: value
    })
  } else {
    activeFilters.value = activeFilters.value.filter(f => f.field !== 'project_name')
  }
  updateListFilters()
}, 300)

function handleSortFieldChange(value) {
  sortField.value = value
  list.orderBy = `${value} ${sortDirection.value}`
  list.reload()
}

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  list.orderBy = `${sortField.value} ${sortDirection.value}`
  list.reload()
}

function addFilter() {
  activeFilters.value.push({
    field: newFilter.value.field,
    operator: newFilter.value.operator,
    value: newFilter.value.value
  })
  updateListFilters()
  newFilter.value = { field: '', operator: '=', value: '' }
}

function removeFilter(index) {
  activeFilters.value.splice(index, 1)
  updateListFilters()
}

function updateListFilters() {
  const baseFilters = [['is_child', '!=', 1]]  // Always include this filter
  
  const userFilters = activeFilters.value.map(filter => {
    let value = filter.value
    if (filter.operator === 'like') {
      value = `%${value}%`
    }
    return [filter.field, filter.operator, value]
  })

  // Combine base filters with user filters
  list.filters = [...baseFilters, ...userFilters]
  list.reload()
}

function getFieldLabel(fieldValue) {
  return filterFieldOptions.find(option => option.value === fieldValue)?.label || fieldValue
}

import { generateProjectDescription } from '../utils/projectDescriptionGenerator'
async function createProject() {
  try {
    const description = await generateProjectDescription(
      newProject.value.project_name,
      newProject.value.location
    )
    await list.insert.submit({
      project_name: newProject.value.project_name,
      location: newProject.value.location,
      description: description
    })
    
    showNewProject.value = false
    newProject.value = {
      project_name: '',
      location: '',
    }
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

function formatCurrency(value) {
  if (!value) return '0'
  return `${Number(value).toLocaleString()}` // Changed from Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 }) to Number(value).toLocaleString()
}
</script>