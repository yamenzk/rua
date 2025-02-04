<template>
  <div class="min-h-[calc(100vh-4rem)]">
    <!-- Scrollable Table Container -->
    <div class="relative overflow-x-auto">
      <div class="min-w-[1200px]">
        <!-- Loading Overlay -->
        <div 
          v-if="isLoading" 
          class="absolute inset-0 flex items-center justify-center bg-white/75 z-10"
        >
          <LoadingIndicator />
        </div>

        <!-- Table Header -->
        <div class="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div class="flex">
            <!-- Details -->
            <div class="w-[30%] px-6 py-3">
              <button 
                class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                @click="toggleSortColumn('details')"
              >
                <FeatherIcon name="check-square" class="h-4 w-4" />
                Details
                <FeatherIcon 
                  :name="getSortIcon('details')" 
                  class="h-3 w-3"
                  :class="{'invisible': sortColumn !== 'details'}"
                />
              </button>
            </div>

            <!-- Assignee -->
            <div class="w-[12%] px-4 py-3">
              <button 
                class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                @click="openAssigneeFilter"
              >
                <FeatherIcon name="user" class="h-4 w-4" />
                Assignee
                <div 
                  v-if="filters.assignedTo" 
                  class="h-1.5 w-1.5 rounded-full bg-gray-900"
                />
              </button>
            </div>

            <!-- Project -->
            <div class="w-[12%] px-4 py-3">
              <button 
                class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                @click="openProjectFilter"
              >
                <FeatherIcon name="briefcase" class="h-4 w-4" />
                Project
                <div 
                  v-if="filters.project" 
                  class="h-1.5 w-1.5 rounded-full bg-gray-900"
                />
              </button>
            </div>

            <!-- Related To -->
            <div class="w-[15%] px-4 py-3">
              <button 
                class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <FeatherIcon name="file" class="h-4 w-4" />
                Related To
              </button>
            </div>

            <!-- Due Date -->
            <div class="w-[15%] px-4 py-3">
              <button 
                class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                @click="toggleSortColumn('due_date')"
              >
                <FeatherIcon name="calendar" class="h-4 w-4" />
                Due Date
                <FeatherIcon 
                  :name="getSortIcon('due_date')" 
                  class="h-3 w-3"
                  :class="{'invisible': sortColumn !== 'due_date'}"
                />
              </button>
            </div>

            <!-- Priority -->
            <div class="w-[12%] px-4 py-3">
              <button 
                class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                @click="openPriorityFilter"
              >
                <FeatherIcon name="flag" class="h-4 w-4" />
                Priority
                <div 
                  v-if="filters.priority" 
                  class="h-1.5 w-1.5 rounded-full bg-gray-900"
                />
              </button>
            </div>

            <!-- Actions -->
            <div class="w-[4%] px-4 py-3" />
          </div>
        </div>

        <!-- Table Body -->
        <div class="divide-y divide-gray-200">
          <template v-for="status in ['Open', 'Delayed', 'Completed', 'Cancelled']" :key="status">
            <template v-if="getTasksByStatus(status)?.length">
              <!-- Status Group Header -->
              <div
                class="group cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                @click="toggleStatusCollapse(status)"
              >
                <div class="flex items-center gap-2 px-6 py-2">
                  <FeatherIcon
                    :name="statusCollapsed[status] ? 'chevron-right' : 'chevron-down'"
                    class="h-4 w-4 text-gray-500"
                  />
                  <Badge
                    :variant="getStatusTheme(status) === 'gray' ? 'solid' : 'subtle'"
                    :theme="getStatusTheme(status)"
                  >
                    {{ status }}
                  </Badge>
                  <span class="text-sm text-gray-600">
                    ({{ getTasksByStatus(status)?.length || 0 }})
                  </span>
                </div>
              </div>

              <!-- Tasks in this status -->
              <template v-if="!statusCollapsed[status]">
                <div
                  v-for="task in getTasksByStatus(status)"
                  :key="task.name"
                  class="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                  @click="showTaskDetails(task)"
                >
                  <div class="flex">
                    <!-- Details -->
                    <div class="w-[30%] px-6 py-3">
                      <div class="flex items-start gap-2">
                        <div class="shrink-0 rounded-lg p-1.5" :class="getPriorityClass(task.priority)">
                          <FeatherIcon 
                            :name="getIconByDoctype(task.related_doctype)" 
                            class="h-4 w-4"
                            :class="getPriorityIconClass(task.priority)"
                          />
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="break-words text-sm text-gray-900">{{ task.details }}</div>
                          <div class="text-xs text-gray-500">Created {{ formatDate(task.creation) }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Assignee -->
                    <div class="w-[12%] px-4 py-3">
                      <div class="flex items-center gap-2">
                        <Avatar
                          :image="getUserAvatar(task.assigned_to)"
                          :label="getAssigneeName(task.assigned_to)?.substring(0, 2)"
                          size="sm"
                        />
                        <div class="min-w-0 flex-1">
                          <span class="truncate text-sm text-gray-900 block">
                            {{ getAssigneeName(task.assigned_to) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Project -->
                    <div class="w-[12%] px-4 py-3">
                      <div v-if="task.project" class="min-w-0">
                        <div class="truncate text-sm text-gray-900">{{ getProjectName(task.project) }}</div>
                      </div>
                      <div v-else class="text-sm text-gray-500">—</div>
                    </div>

                    <!-- Related To -->
                    <div class="w-[15%] px-4 py-3">
                      <div v-if="task.related_doctype && task.related_docname" class="min-w-0">
                        <div class="text-sm text-gray-900">{{ task.related_doctype.replace('RUA ', '') }}</div>
                        <div class="truncate text-xs text-gray-500">{{ task.related_docname }}</div>
                      </div>
                      <div v-else class="text-sm text-gray-500">—</div>
                    </div>

                    <!-- Due Date -->
                    <div class="w-[15%] px-4 py-3">
                      <div v-if="task.due_date" class="text-sm">
                        <div class="text-gray-900">{{ formatDate(task.due_date) }}</div>
                        <div 
                          class="text-xs"
                          :class="isOverdue(task.due_date) ? 'text-red-500' : 'text-gray-500'"
                        >
                          {{ getDueStatus(task.due_date) }}
                        </div>
                      </div>
                      <div v-else class="text-sm text-gray-500">—</div>
                    </div>

                    <!-- Priority -->
                    <div class="w-[12%] px-4 py-3">
                      <Badge
                        :variant="getPriorityTheme(task.priority) === 'gray' ? 'solid' : 'subtle'"
                        :theme="getPriorityTheme(task.priority)"
                      >
                        {{ task.priority }}
                      </Badge>
                    </div>

                    <!-- Actions -->
                    <div class="w-[4%] px-4 py-3">
                      <button 
                        class="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-gray-100 transition-opacity"
                        @click.stop="openTaskMenu(task)"
                      >
                        <FeatherIcon name="more-vertical" class="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </template>

          <!-- Empty State -->
          <div
            v-if="!filteredTasks.length"
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
import { ref, computed, inject, h, onMounted } from 'vue'
import { 
  FeatherIcon, 
  Avatar, 
  Badge, 
  Button, 
  FormControl,
  LoadingIndicator,
  Dialog,
  dayjs
} from 'frappe-ui'
import { todoResource } from '@/data/todo'
import { projectResource } from '@/data/project'
import { employeeResource } from '@/data/employee'
import TaskDetailsDialog from './TaskDetailsDialog.vue'
import NewTaskModal from './NewTaskModal.vue'
import { getServerDate, getDueStatus, isBeforeToday, formatDate } from '@/utils/format'

// Inject header actions
const setHeaderAction = inject('setHeaderAction')

// Setup header search and button
onMounted(() => {
  setHeaderAction(() => h('div', { 
    class: 'flex items-center justify-between gap-4 flex-1 px-2' 
  }, [
    // Search Field
    h('div', { 
      class: 'relative flex-1 max-w-2xl'
    }, [
      h('div', {
        class: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'
      }, [
        h(FeatherIcon, {
          name: 'search',
          class: 'h-4 w-4 text-gray-400'
        })
      ]),
      h('input', {
        type: 'text',
        placeholder: 'Search tasks...',
        value: filters.value.search,
        onInput: (e) => filters.value.search = e.target.value,
        class: `
          block w-[180px] lg:w-full rounded-xl border-0 py-2 pl-10 pr-4 
          text-gray-900 ring-1 ring-inset ring-gray-200 
          placeholder:text-gray-400 
          focus:ring-2 focus:ring-inset focus:ring-gray-900
          transition-all duration-200
          bg-white/50 hover:bg-white
          sm:text-sm sm:leading-6
        `
      })
    ]),

    // New Task Button
    h('button', {
  class: `
    inline-flex items-center gap-2 
    rounded-xl px-4 py-2.5
    text-sm font-semibold text-white
    bg-gray-900 hover:bg-gray-800
    transition duration-200 ease-in-out
    shadow-sm hover:shadow
    focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
  `,
  onClick: () => showNewTaskModal.value = true
}, [
  h(FeatherIcon, {
    name: 'plus',
    class: 'h-4 w-4'
  }),
  h('span', {
    class: 'hidden sm:inline' // Only show text on screens sm (small) and larger
  }, 'New Task')
])
  ]))
})

// State
const isLoading = ref(false)
const showNewTaskModal = ref(false)
const showTaskDetailsDialog = ref(false)
const selectedTask = ref(null)
const statusCollapsed = ref({
  Open: false,
  Delayed: false,
  Completed: true,
  Cancelled: true
})

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

// Sorting state
const sortColumn = ref('')
const sortDirection = ref('asc')

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

// Computed
const filteredTasks = computed(() => {
  let tasks = todoResource.data || []

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

  // Apply sorting
  if (sortColumn.value) {
    tasks = [...tasks].sort((a, b) => {
      let aVal = a[sortColumn.value]
      let bVal = b[sortColumn.value]

      // Handle special cases
      if (sortColumn.value === 'due_date') {
        aVal = aVal ? new Date(aVal) : new Date(0)
        bVal = bVal ? new Date(bVal) : new Date(0)
      }

      if (sortDirection.value === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  } else {
    // Default sort by creation date
    tasks = tasks.sort((a, b) => dayjs(b.creation).diff(dayjs(a.creation)))
  }

  return tasks
})

// Helper functions
function toggleSortColumn(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

function getSortIcon(column) {
  if (sortColumn.value !== column) return 'chevron-down'
  return sortDirection.value === 'asc' ? 'chevron-up' : 'chevron-down'
}

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

function getPriorityClass(priority) {
  switch (priority) {
    case 'High':
      return 'bg-red-100'
    case 'Medium':
      return 'bg-orange-100'
    case 'Low':
      return 'bg-green-100'
    default:
      return 'bg-gray-100'
  }
}

function getPriorityIconClass(priority) {
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

function getPriorityTheme(priority) {
  switch (priority) {
    case 'High':
      return 'red'
    case 'Medium':
      return 'orange'
    case 'Low':
      return 'green'
    default:
      return 'gray'
  }
}

function getStatusTheme(status) {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'Open':
      return 'blue'
    case 'Delayed':
      return 'orange'
    case 'Cancelled':
      return 'red'
    default:
      return 'gray'
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

function getTasksByStatus(status) {
  return filteredTasks.value?.filter(task => task.status === status) || []
}

function toggleStatusCollapse(status) {
  statusCollapsed.value[status] = !statusCollapsed.value[status]
}

function showTaskDetails(task) {
  selectedTask.value = task
  showTaskDetailsDialog.value = true
}

function openTaskMenu(task) {
  // Implement task menu logic here
}
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