<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div 
      v-if="isLoading" 
      class="flex items-center justify-center min-h-[400px]"
    >
      <LoadingIndicator />
    </div>

    <!-- Board View -->
    <div v-else-if="viewMode === 'board'" class="px-4 sm:px-6 py-4">
      <div 
        class="grid grid-cols-1 gap-4 md:gap-6"
        :class="{
          'md:grid-cols-2 lg:grid-cols-4': visibleSections.length === 4,
          'md:grid-cols-2 lg:grid-cols-3': visibleSections.length === 3,
          'md:grid-cols-2': visibleSections.length <= 2
        }"
      >
        <template v-for="section in TASK_STATUSES" :key="section">
          <div
            v-if="!hiddenSections[section]"
            class="flex flex-col bg-gray-50/50 rounded-xl p-4"
          >
            <!-- Column Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-blue-600 text-white': section === 'Open',
                    'bg-orange-600 text-white': section === 'Delayed',
                    'bg-green-600 text-white': section === 'Completed',
                    'bg-red-600 text-white': section === 'Cancelled'
                  }"
                >
                  {{ section }}
                  <span class="ml-1 text-white bg-white/20 w-[20px] h-[20px] rounded-full flex items-center justify-center">
                    {{ getTasksByStatus(section).length }}
                  </span>
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <button 
                  v-if="['Completed', 'Cancelled'].includes(section)"
                  class="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  @click.stop="toggleSectionVisibility(section)"
                >
                  <FeatherIcon name="x" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Add Task Button (only for Open section) -->
            <button 
              v-if="section === 'Open'"
              class="mb-3 w-full p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all"
              @click="showNewTaskModal = true"
            >
              <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
                <FeatherIcon name="plus" class="w-4 h-4" />
                <span>Add Task</span>
              </div>
            </button>

            <!-- Tasks -->
            <div class="space-y-3">
              <div 
                v-for="task in getTasksByStatus(section)"
                :key="task.name"
                class="group bg-white rounded-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer p-4"
                @click="showTaskDetails(task)"
              >
                <!-- Task Header -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div 
                      class="shrink-0 rounded-lg p-1.5"
                      :class="getPriorityClass(task.priority, task.status)"
                    >
                      <FeatherIcon 
                        :name="getIconByDoctype(task.related_doctype)" 
                        class="w-4 h-4"
                        :class="getPriorityIconClass(task.priority, task.status)"
                      />
                    </div>
                    <span 
                      v-if="task.related_docname"
                      class="text-xs font-medium text-gray-500"
                    >
                      {{ task.related_docname }}
                    </span>
                  </div>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="{
  'bg-red-50 text-red-700': task.priority === 'High' && task.status !== 'Completed' && task.status !== 'Cancelled',
  'bg-orange-50 text-orange-700': task.priority === 'Medium' && task.status !== 'Completed' && task.status !== 'Cancelled',
  'bg-green-50 text-green-700': task.priority === 'Low' && task.status !== 'Completed' && task.status !== 'Cancelled',
  'bg-gray-50 text-gray-700': !task.priority || task.status === 'Completed' || task.status === 'Cancelled'
}"
                  >
                    {{ task.priority }}
                  </span>
                </div>

                <!-- Task Content -->
                <p class="text-sm text-gray-900 mb-4">{{ task.details }}</p>

                <!-- Task Footer -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Avatar
                      :image="getUserAvatar(task.assigned_to)"
                      :label="getAssigneeName(task.assigned_to)?.substring(0, 2)"
                      size="sm"
                    />
                    <span 
                      class="text-xs"
                      :class="isOverdue(task.due_date) ? 'text-red-500' : 'text-gray-500'"
                    >
                      {{ getDueStatus(task.due_date) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- List View -->
<div v-else class="px-4 sm:px-6 py-4">
  <!-- Add Task Button (for list view) -->
  <button 
    class="w-full mb-4 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all"
    @click="showNewTaskModal = true"
  >
    <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
      <FeatherIcon name="plus" class="w-4 h-4" />
      <span>Add Task</span>
    </div>
  </button>

  <div class="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
    <div
      v-for="task in filteredTasks.filter(task => 
        !hiddenSections[task.status] || 
        (task.status === 'Completed' && !hiddenSections.Completed) || 
        (task.status === 'Cancelled' && !hiddenSections.Cancelled)
      )"
      :key="task.name"
      class="p-4 hover:bg-gray-50 transition-all cursor-pointer group"
      @click="showTaskDetails(task)"
    >
          <div class="flex items-start gap-4">
            <div 
              class="shrink-0 rounded-lg p-2"
              :class="getPriorityClass(task.priority, task.status)"
            >
              <FeatherIcon 
                :name="getIconByDoctype(task.related_doctype)" 
                class="w-5 h-5"
                :class="getPriorityIconClass(task.priority, task.status)"
              />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ task.details }}
                  </p>
                  <div class="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span v-if="task.related_docname">{{ task.related_docname }}</span>
                    <span 
                      :class="isOverdue(task.due_date) ? 'text-red-500' : ''"
                    >
                      {{ getDueStatus(task.due_date) }}
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="{
  'bg-red-50 text-red-700': task.priority === 'High' && task.status !== 'Completed' && task.status !== 'Cancelled',
  'bg-orange-50 text-orange-700': task.priority === 'Medium' && task.status !== 'Completed' && task.status !== 'Cancelled',
  'bg-green-50 text-green-700': task.priority === 'Low' && task.status !== 'Completed' && task.status !== 'Cancelled',
  'bg-gray-50 text-gray-700': !task.priority || task.status === 'Completed' || task.status === 'Cancelled'
}"
                  >
                    {{ task.priority }}
                  </span>
                  <span
  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
  :class="{
    'bg-blue-600 text-white': task.status === 'Open',
    'bg-orange-600 text-white': task.status === 'Delayed',
    'bg-green-600 text-white': task.status === 'Completed',
    'bg-red-600 text-white': task.status === 'Cancelled'
  }"
>
  {{ task.status }}
</span>
                  <Avatar
                    :image="getUserAvatar(task.assigned_to)"
                    :label="getAssigneeName(task.assigned_to)?.substring(0, 2)"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
    <div
      v-if="!filteredTasks.filter(task => 
        !hiddenSections[task.status] || 
        (task.status === 'Completed' && !hiddenSections.Completed) || 
        (task.status === 'Cancelled' && !hiddenSections.Cancelled)
      ).length"
      class="flex flex-col items-center justify-center py-12"
    >
      <FeatherIcon name="check-square" class="mb-4 h-12 w-12 text-gray-400" />
      <p class="text-base font-medium text-gray-900">No tasks found</p>
      <p class="text-sm text-gray-600">
        {{ filters.search ? 'Try adjusting your search or filters' : 'Get started by creating a new task' }}
      </p>
      <Button
        v-if="!filters.search"
        variant="solid"
        size="sm"
        class="mt-3"
        @click="showNewTaskModal = true"
      >
        Create Task
      </Button>
    </div>
  </div>
</div>

    <!-- Filter Dialogs -->
    <Dialog
      v-model="showAssigneeFilter"
      :options="{
        title: 'Filter by Assignee',
        size: 'sm'
      }"
    >
      <template #body-content>
        <div class="space-y-4 p-4">
          <FormControl
            type="select"
            :options="userOptions"
            v-model="filters.assignedTo"
            placeholder="Select Assignee"
          />
          <div class="flex justify-end gap-2">
            <Button
              variant="subtle"
              @click="clearAssigneeFilter"
            >
              Clear
            </Button>
            <Button
              variant="solid"
              @click="showAssigneeFilter = false"
            >
              Apply
            </Button>
          </div>
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model="showProjectFilter"
      :options="{
        title: 'Filter by Project',
        size: 'sm'
      }"
    >
      <template #body-content>
        <div class="space-y-4 p-4">
          <FormControl
            type="select"
            :options="projectOptions"
            v-model="filters.project"
            placeholder="Select Project"
          />
          <div class="flex justify-end gap-2">
            <Button
              variant="subtle"
              @click="clearProjectFilter"
            >
              Clear
            </Button>
            <Button
              variant="solid"
              @click="showProjectFilter = false"
            >
              Apply
            </Button>
          </div>
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model="showPriorityFilter"
      :options="{
        title: 'Filter by Priority',
        size: 'sm'
      }"
    >
      <template #body-content>
        <div class="space-y-4 p-4">
          <FormControl
            type="select"
            :options="priorityOptions"
            v-model="filters.priority"
            placeholder="Select Priority"
          />
          <div class="flex justify-end gap-2">
            <Button
              variant="subtle"
              @click="clearPriorityFilter"
            >
              Clear
            </Button>
            <Button
              variant="solid"
              @click="showPriorityFilter = false"
            >
              Apply
            </Button>
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Task Details Dialog -->
    <TaskDetailsDialog
      v-model="showTaskDetailsDialog"
      :task="selectedTask"
      @task-updated="todoResource.reload()"
    />

    <!-- New Task Modal -->
    <NewTaskModal
      v-model="showNewTaskModal"
      :project-options="projectOptions"
      @created="todoResource.reload()"
    />
  </div>
</template>

<script setup>
import { ref, computed, inject, h, onMounted, watch } from 'vue'
import { 
  FeatherIcon, 
  Avatar, 
  Button, 
  FormControl,
  LoadingIndicator,
  Dialog
} from 'frappe-ui'
import { todoResource } from '@/data/todo'
import { projectResource } from '@/data/project'
import { employeeResource } from '@/data/employee'
import TaskDetailsDialog from '@/components/task/TaskDetailsDialog.vue'
import NewTaskModal from '@/components/task/NewTaskModal.vue'
import { getDueStatus, formatDate, isBeforeToday } from '@/utils/format'

// Inject header actions
const setHeaderAction = inject('setHeaderAction')

// State
const viewMode = ref('board')
const isLoading = ref(false)
const showNewTaskModal = ref(false)
const showTaskDetailsDialog = ref(false)
const selectedTask = ref(null)
const hiddenSections = ref({
  Open: false,
  Delayed: false,
  Completed: true,
  Cancelled: true
})

const TASK_STATUSES = ['Open', 'Delayed', 'Completed', 'Cancelled']

// Watch for loading state
watch(todoResource, (newValue) => {
  isLoading.value = newValue.loading
}, { immediate: true })


const visibleSections = computed(() => 
  TASK_STATUSES.filter(status => !hiddenSections.value[status])
)

const getTaskStatus = (task) => {
  if (task.status) return task.status
  if (task.completed_at) return 'Completed'
  if (task.cancelled_at) return 'Cancelled'
  if (isOverdue(task.due_date)) return 'Delayed'
  return 'Open'
}



// Computed for hidden sections state
const areHiddenSectionsCollapsed = computed(() => 
  visibleSections.value.length <= 2 && 
  !visibleSections.value.includes('Completed') && 
  !visibleSections.value.includes('Cancelled')
)

// Filter states
const filters = ref({
  search: '',
  status: '',
  priority: '',
  assignedTo: '',
  project: ''
})

// Filter dialogs state
const showAssigneeFilter = ref(false)
const showProjectFilter = ref(false)
const showPriorityFilter = ref(false)

// Options for filters
const priorityOptions = [
  { label: '', value: '' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' }
]

const userOptions = computed(() => {
  return employeeResource.data
    ?.filter(employee => employee.user)
    .map(employee => ({
      label: employee.employee_name,
      value: employee.user,
      image: employee.image
    })) || []
})

const projectOptions = computed(() => {
  return projectResource.data?.filter(project => 
    !project.is_child && project.status !== 'Cancelled'
  ).map(project => ({
    label: project.project_name,
    value: project.name
  })) || []
})

// Computed properties
const filteredTasks = computed(() => {
  let tasks = todoResource.data || []

  // Map status to each task if not already present
  tasks = tasks.map(task => ({
    ...task,
    status: getTaskStatus(task)
  }))

  // Apply filters
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    tasks = tasks.filter(task => 
      task.details.toLowerCase().includes(searchTerm) ||
      task.related_docname?.toLowerCase().includes(searchTerm)
    )
  }

  if (filters.value.priority) {
    tasks = tasks.filter(task => task.priority === filters.value.priority)
  }

  if (filters.value.assignedTo) {
    tasks = tasks.filter(task => task.assigned_to === filters.value.assignedTo)
  }

  if (filters.value.project) {
    tasks = tasks.filter(task => task.project === filters.value.project)
  }

  return tasks.sort((a, b) => new Date(b.creation) - new Date(a.creation))
})


// Methods
function clearAssigneeFilter() {
  filters.value.assignedTo = ''
  showAssigneeFilter.value = false
}

function clearProjectFilter() {
  filters.value.project = ''
  showProjectFilter.value = false
}

function clearPriorityFilter() {
  filters.value.priority = ''
  showPriorityFilter.value = false
}

function openAssigneeFilter() {
  showAssigneeFilter.value = true
}

function openProjectFilter() {
  showProjectFilter.value = true
}

function openPriorityFilter() {
  showPriorityFilter.value = true
}

function getProjectName(projectId) {
  const project = projectResource.data?.find(p => p.name === projectId)
  return project?.project_name || projectId
}

function isOverdue(dueDate) {
  if (!dueDate) return false
  return isBeforeToday(dueDate)
}

function getPriorityClass(priority, status) {
  // If task is completed or cancelled, use a neutral gray background
  if (status === 'Completed' || status === 'Cancelled') {
    return 'bg-gray-50'
  }

  switch (priority) {
    case 'High':
      return 'bg-red-50'
    case 'Medium':
      return 'bg-orange-50'
    case 'Low':
      return 'bg-green-50'
    default:
      return 'bg-gray-50'
  }
}

function getPriorityIconClass(priority, status) {
  // If task is completed or cancelled, use a neutral gray icon
  if (status === 'Completed' || status === 'Cancelled') {
    return 'text-gray-500'
  }

  switch (priority) {
    case 'High':
      return 'text-red-500'
    case 'Medium':
      return 'text-orange-500'
    case 'Low':
      return 'text-green-500'
    default:
      return 'text-gray-500'
  }
}

function getIconByDoctype(doctype) {
  switch (doctype) {
    case 'RUA Invoice':
      return 'file-text'
    case 'RUA Payment':
      return 'credit-card'
    case 'RUA Project':
      return 'briefcase'
    case 'RUA LPO':
      return 'shopping-cart'
    case 'RUA RFQ':
      return 'clipboard'
    case 'RUA Purchase Receipt':
      return 'package'
    case 'RUA Quotation':
      return 'file'
    case 'RUA Employee':
      return 'user'
    default:
      return 'check-square'
  }
}

function getAssigneeName(userId) {
  const employee = employeeResource.data?.find(employee => employee.user === userId)
  return employee?.employee_name || userId
}

function getUserAvatar(userId) {
  const employee = employeeResource.data?.find(employee => employee.user === userId)
  return employee?.image
}

const tasksByStatus = computed(() => {
  const statusGroups = {}
  TASK_STATUSES.forEach(status => {
    statusGroups[status] = []
  })

  filteredTasks.value.forEach(task => {
    const status = task.status || getTaskStatus(task)
    if (statusGroups[status] && !hiddenSections.value[status]) {
      statusGroups[status].push(task)
    }
  })

  return statusGroups
})

function getTasksByStatus(status) {
  return tasksByStatus.value[status] || []
}

function showTaskDetails(task) {
  selectedTask.value = task
  showTaskDetailsDialog.value = true
}

function toggleSectionVisibility(section) {
  hiddenSections.value = {
    ...hiddenSections.value,
    [section]: !hiddenSections.value[section]
  }
}


function toggleHiddenSections() {
  const shouldShow = areHiddenSectionsCollapsed.value
  hiddenSections.value = {
    ...hiddenSections.value,
    Completed: !shouldShow,
    Cancelled: !shouldShow
  }
}

onMounted(() => {
  setHeaderAction(() => h('div', { 
    class: 'flex items-center gap-3' 
  }, [
    // View Toggle
    h('div', {
      class: 'bg-gray-50 rounded-lg p-1 shadow-sm hidden sm:flex'
    }, [
      h('button', {
        class: `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          viewMode.value === 'board'
            ? 'bg-gray-900 text-white'
            : 'text-gray-600 hover:text-gray-900'
        }`,
        onClick: () => viewMode.value = 'board'
      }, [
        h(FeatherIcon, {
          name: 'grid',
          class: 'w-4 h-4'
        }),
        h('span', 'Board')
      ]),
      h('button', {
        class: `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          viewMode.value === 'list'
            ? 'bg-gray-900 text-white'
            : 'text-gray-600 hover:text-gray-900'
        }`,
        onClick: () => viewMode.value = 'list'
      }, [
        h(FeatherIcon, {
          name: 'list',
          class: 'w-4 h-4'
        }),
        h('span', 'List')
      ])
    ]),

    // Mobile View Toggle
    h('button', {
      class: 'sm:hidden p-2 rounded-lg bg-gray-50 shadow-sm text-gray-600 hover:text-gray-900',
      onClick: () => viewMode.value = viewMode.value === 'board' ? 'list' : 'board'
    }, [
      h(FeatherIcon, {
        name: viewMode.value === 'board' ? 'grid' : 'list',
        class: 'w-4 h-4'
      })
    ]),

    // Filters
    h('div', { 
      class: 'flex items-center gap-2' 
    }, [
      // Assignee Filter
      h('button', {
        class: `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-sm text-sm font-medium transition-all ${
          filters.value.assignedTo 
            ? 'text-gray-900 ring-1 ring-gray-900' 
            : 'text-gray-600 hover:text-gray-900'
        }`,
        onClick: openAssigneeFilter
      }, [
        h(FeatherIcon, {
          name: 'user',
          class: 'w-4 h-4'
        }),
        h('span', {
          class: 'hidden sm:inline'
        }, 'Assignee'),
        filters.value.assignedTo && h('div', {
          class: 'h-1.5 w-1.5 rounded-full bg-gray-900'
        })
      ]),

      // Project Filter
      h('button', {
        class: `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-sm text-sm font-medium transition-all ${
          filters.value.project 
            ? 'text-gray-900 ring-1 ring-gray-900' 
            : 'text-gray-600 hover:text-gray-900'
        }`,
        onClick: openProjectFilter
      }, [
        h(FeatherIcon, {
          name: 'briefcase',
          class: 'w-4 h-4'
        }),
        h('span', {
          class: 'hidden sm:inline'
        }, 'Project'),
        filters.value.project && h('div', {
          class: 'h-1.5 w-1.5 rounded-full bg-gray-900'
        })
      ]),

      // Priority Filter
      h('button', {
        class: `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-sm text-sm font-medium transition-all ${
          filters.value.priority 
            ? 'text-gray-900 ring-1 ring-gray-900' 
            : 'text-gray-600 hover:text-gray-900'
        }`,
        onClick: openPriorityFilter
      }, [
        h(FeatherIcon, {
          name: 'flag',
          class: 'w-4 h-4'
        }),
        h('span', {
          class: 'hidden sm:inline'
        }, 'Priority'),
        filters.value.priority && h('div', {
          class: 'h-1.5 w-1.5 rounded-full bg-gray-900'
        })
      ])
    ]),

    // Add divider
    h('div', {
      class: 'h-5 w-px bg-gray-200 mx-2'
    }),

    // Show/Hide completed tasks toggle
    h('button', {
      class: `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg 
        text-sm font-medium transition-all
        ${areHiddenSectionsCollapsed.value 
          ? 'bg-white shadow-sm text-gray-600 hover:text-gray-900' 
          : 'bg-gray-900 text-white'
        }`,
      onClick: toggleHiddenSections
    }, [
      h(FeatherIcon, {
        name: areHiddenSectionsCollapsed.value ? 'eye' : 'eye-off',
        class: 'w-4 h-4'
      }),
      h('span', {
        class: 'hidden sm:inline'
      }, areHiddenSectionsCollapsed.value ? 'Show All' : 'Hide Completed')
    ])
  ]))
})
</script>

<style scoped>
/* Custom scrollbar styling */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #e9e9e9 transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #e9e9e9;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background-color: #e9e9e9;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>