<template>
  <div class="bg-white rounded-lg border">
    <!-- Header -->
    <div class="flex items-center justify-between mt-6 mb-4 px-6">
      <div>
        <h2 class="text-lg font-medium text-gray-900">Tasks</h2>
        <p class="text-sm text-gray-500">Manage and track all tasks</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex overflow-x-auto items-center gap-2 px-6 pb-4">
      <!-- Search -->
      <FormControl
        type="search"
        size="sm"
        variant="subtle"
        placeholder="Search tasks.."
        v-model="filters.search"
        class="w-full sm:w-40 min-w-[8rem]"
      />

      <!-- Project Dropdown -->
      <FormControl
        v-if="projectOptions.length"
        type="select"
        :options="projectOptions"
        size="sm"
        variant="subtle"
        placeholder="Project"
        v-model="filters.project"
        class="w-full sm:w-40 min-w-[8rem]"
      />

      <!-- Assigned To Dropdown -->
      <FormControl
        type="select"
        :options="userOptions"
        size="sm"
        variant="subtle"
        placeholder="Assignee"
        v-model="filters.assignedTo"
        class="w-full sm:w-40 min-w-[8rem]"
      />

      <!-- Priority Dropdown -->
      <FormControl
        type="select"
        :options="priorityOptions"
        size="sm"
        variant="subtle"
        placeholder="Priority"
        v-model="filters.priority"
        class="w-full sm:w-32 min-w-[6rem]"
      />
    </div>

    <!-- Tasks Table -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <LoadingIndicator />
    </div>

    <div v-else class="overflow-x-auto min-h-[60vh]">
      <!-- Table Header -->
      <div class="border-b min-w-[800px]">
        <div class="flex items-center px-6 py-2">
          <div class="flex-1 grid grid-cols-12 gap-4">
            <div class="col-span-4 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="check-square" class="w-4 h-4" />
              Details
            </div>
            <div class="col-span-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="user" class="w-4 h-4" />
              Assignee
            </div>
            <div class="col-span-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="file" class="w-4 h-4" />
              Related To
            </div>
            <div class="col-span-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="calendar" class="w-4 h-4" />
              Due Date
            </div>
            <div class="col-span-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="flag" class="w-4 h-4" />
              Priority
            </div>
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="divide-y">
        <template v-for="status in ['Open', 'Delayed', 'Completed', 'Cancelled']" :key="status">
          <template v-if="getTasksByStatus(status)?.length">
            <!-- Status Group Header -->
            <div
              class="group bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer px-6 py-2 min-w-[800px]"
              @click="toggleStatusCollapse(status)"
            >
              <div class="flex items-center gap-2">
                <FeatherIcon
                  :name="statusCollapsed[status] ? 'chevron-right' : 'chevron-down'"
                  class="w-4 h-4 text-gray-500"
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
                class="hover:bg-gray-50 transition-colors cursor-pointer min-w-[800px]"
                @click="showTaskDetails(task)"
              >
                <div class="flex items-center px-6 py-3">
                  <div class="flex-1 grid grid-cols-12 gap-4">
                    <!-- Details -->
                    <div class="col-span-4">
                      <div class="flex items-start gap-2">
                        <div class="p-1.5 rounded-lg shrink-0" :class="getPriorityClass(task.priority)">
                          <FeatherIcon 
                            :name="getIconByDoctype(task.related_doctype)" 
                            class="w-4 h-4"
                            :class="getPriorityIconClass(task.priority)"
                          />
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="text-sm text-gray-900 break-words">{{ task.details }}</div>
                          <div class="text-xs text-gray-500">Created {{ formatDate(task.creation) }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Assignee -->
                    <div class="col-span-2">
                      <div class="flex items-center gap-2">
                        <Avatar
                          :image="getUserAvatar(task.assigned_to)"
                          :label="getAssigneeName(task.assigned_to)?.substring(0, 2)"
                          size="sm"
                        />
                        <div class="flex flex-col">
                          <span class="text-sm text-gray-900 truncate">
                            {{ getAssigneeName(task.assigned_to) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Related To -->
                    <div class="col-span-2">
                      <div v-if="task.related_doctype && task.related_docname" class="text-sm">
                        <div class="text-gray-900">{{ task.related_doctype.replace('RUA ', '') }}</div>
                        <div class="text-xs text-gray-500 truncate">{{ task.related_docname }}</div>
                      </div>
                      <div v-else class="text-sm text-gray-500">—</div>
                    </div>

                    <!-- Due Date -->
                    <div class="col-span-2">
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
                    <div class="col-span-2">
                      <Badge
                        :variant="getPriorityTheme(task.priority) === 'gray' ? 'solid' : 'subtle'"
                        :theme="getPriorityTheme(task.priority)"
                      >
                        {{ task.priority }}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </template>

        <!-- Empty State -->
        <div
          v-if="!filteredTasks.length"
          class="flex flex-col items-center justify-center py-12 min-w-[800px]"
        >
          <FeatherIcon name="check-square" class="w-12 h-12 text-gray-400 mb-4" />
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
import { ref, computed, watch, inject, h } from 'vue'
import { 
  FeatherIcon, 
  Avatar, 
  Badge, 
  Button, 
  Dialog, 
  FormControl,
  LoadingIndicator
} from 'frappe-ui'
import { todoResource } from '@/data/todo'
import { projectResource } from '@/data/project'
import { userDetails } from '@/data/roles'
import { employeeResource } from '@/data/employee'
import { quotationResource } from "@/data/quotation"
import { rfqResource } from "@/data/rfq"
import { lpoResource } from "@/data/lpo"
import { invoiceResource } from "@/data/invoice"
import { paymentResource } from "@/data/payment"
import { purchaseReceiptResource } from "@/data/purchaseReceipt"
import TaskDetailsDialog from './TaskDetailsDialog.vue'
import NewTaskModal from './NewTaskModal.vue'

// State
const isLoading = ref(false)
const showNewTaskModal = ref(false)
const creating = ref(false)
const setHeaderAction = inject('setHeaderAction')
const showTaskDetailsDialog = ref(false)
const selectedTask = ref(null)
const statusCollapsed = ref({
  Open: false,
  Delayed: false,
  Completed: false,
  Cancelled: false
})

  setHeaderAction(h(Button, {
    variant: 'solid',
    onClick: () => showNewTaskModal.value = true,
  }, () => 'New Task'))


  const filters = ref({
  search: '',
  status: '',
  priority: '',
  assignedTo: '',
  project: ''
})

// In the data section
const newTask = ref({
  details: '',
  assigned_to: '',
  project: '',
  priority: '',
  due_date: '',
  status: 'Open',
  related_doctype: '',
  related_docname: ''
})

// Document type options
const doctypeOptions = [
  { label: '', value: '' },
  { label: 'Purchase Receipt', value: 'RUA Purchase Receipt' },
  { label: 'Payment', value: 'RUA Payment' },
  { label: 'Invoice', value: 'RUA Invoice' },
  { label: 'LPO', value: 'RUA LPO' },
  { label: 'RFQ', value: 'RUA RFQ' },
  { label: 'Quotation', value: 'RUA Quotation' },
  { label: 'Project', value: 'RUA Project' },
  { label: 'Employee', value: 'RUA Employee' }
]

// Options for dropdowns
const statusOptions = [
  { label: '', value: '' },
  { label: 'Open', value: 'Open' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Delayed', value: 'Delayed' }
]

const priorityOptions = [
  { label: '', value: '' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' }
]

const userOptions = computed(() => {
  return employeeResource.data
    ?.filter(employee => employee.user) // Only employees with user accounts
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


const isNewTaskValid = computed(() => {
  return newTask.value.details &&
         newTask.value.assigned_to &&
         newTask.value.priority &&
         newTask.value.project
})

const documentOptions = computed(() => {
  if (!newTask.value.related_doctype) return []
  
  switch (newTask.value.related_doctype) {
    case 'RUA Purchase Receipt':
      return purchaseReceiptResource.data?.map(doc => ({
        label: `${doc.name} - ${doc.party || 'No Supplier'}`,
        value: doc.name
      })) || []
      
    case 'RUA Payment':
      return paymentResource.data?.map(doc => ({
        label: `${doc.name} - ${formatCurrency(doc.amount)}`,
        value: doc.name
      })) || []
      
    case 'RUA Invoice':
      return invoiceResource.data?.map(doc => ({
        label: `${doc.name} - ${doc.party} (${formatCurrency(doc.amount)})`,
        value: doc.name
      })) || []
      
    case 'RUA LPO':
      return lpoResource.data?.map(doc => ({
        label: `${doc.name} - ${doc.party}`,
        value: doc.name
      })) || []
      
    case 'RUA RFQ':
      return rfqResource.data?.map(doc => ({
        label: `${doc.name} - ${doc.party || 'Multiple Suppliers'}`,
        value: doc.name
      })) || []
      
    case 'RUA Quotation':
      return quotationResource.data?.map(doc => ({
        label: `${doc.name} - ${doc.party}`,
        value: doc.name
      })) || []
      
    case 'RUA Project':
      return projectResource.data?.filter(proj => !proj.is_child).map(doc => ({
        label: `${doc.project_name} ${doc.serial_number ? `#${doc.serial_number}` : ''}`,
        value: doc.name
      })) || []
      
    case 'RUA Employee':
      return employeeResource.data?.map(doc => ({
        label: doc.employee_name,
        value: doc.name
      })) || []
      
    default:
      return []
  }
})


// Helper functions

function formatCurrency(value) {
  if (!value) return 'AED 0'
  return `AED ${Math.floor(value).toLocaleString()}`
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

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

function getDueStatus(dueDate) {
  if (!dueDate) return ''
  
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} days`
  } else if (diffDays === 0) {
    return 'Due today'
  } else if (diffDays === 1) {
    return 'Due tomorrow'
  } else {
    return `Due in ${diffDays} days`
  }
}

function isOverdue(dueDate) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

function getAssigneeName(userId) {
  return userDetails.data?.[userId]?.full_name || userId
}

function getUserAvatar(userId) {
  // Check employees
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


function closeNewTaskModal() {
  showNewTaskModal.value = false
  newTask.value = {
    details: '',
    assigned_to: '',
    project: '',
    priority: '',
    due_date: '',
    status: 'Open'
  }
}

async function createTask() {
  if (!isNewTaskValid.value) return
  
  creating.value = true
  try {
    await todoResource.insert.submit({
      details: newTask.value.details,
      assigned_to: newTask.value.assigned_to,
      project: newTask.value.project,
      priority: newTask.value.priority,
      due_date: newTask.value.due_date,
      status: 'Open'
    })
    
    closeNewTaskModal()
  } catch (error) {
    console.error('Failed to create task:', error)
  } finally {
    creating.value = false
  }
}

watch(() => newTask.value.related_doctype, () => {
  newTask.value.related_docname = ''
})

</script>



<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>