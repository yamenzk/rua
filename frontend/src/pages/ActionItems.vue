# PendingTasks.vue
<template>
  <div class="bg-white rounded-lg border">
    <!-- Header -->
    <div class="p-6 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-red-50 rounded-lg">
            <FeatherIcon name="alert-circle" class="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 class="text-lg font-medium text-gray-900">Action Required</h2>
            <p class="text-sm text-gray-500 mt-1">
              {{ pendingTodos.length ? `${pendingTodos.length} tasks need your attention` : 'No pending tasks' }}
            </p>
          </div>
        </div>
        <Badge 
          v-if="pendingTodos.length" 
          variant="solid" 
          theme="gray"
          size="lg"
        >
          {{ pendingTodos.length }}
        </Badge>
      </div>
    </div>

    <!-- Task List -->
    <div v-if="pendingTodos.length">
      <div class="divide-y max-h-[480px] overflow-y-auto">
        <div 
          v-for="todo in sortedTodos" 
          :key="todo.name"
          class="hover:bg-gray-50 transition-colors cursor-pointer"
          @click="showTaskDetails(todo)"
        >
          <div class="p-4">
            <!-- Task Header -->
            <div class="flex items-start gap-3 mb-3">
              <div 
                class="p-2 rounded-lg shrink-0 mt-0.5"
                :class="getPriorityClass(todo.priority)"
              >
                <FeatherIcon 
                  :name="getIconByDoctype(todo.related_doctype)" 
                  class="w-4 h-4"
                  :class="getPriorityIconClass(todo.priority)"
                />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-sm text-gray-900 font-medium break-words">
                  {{ todo.details }}
                </div>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                  <Badge
                    size="sm"
                    :variant="getPriorityTheme(todo.priority) === 'gray' ? 'solid' : 'subtle'"
                    :theme="getPriorityTheme(todo.priority)"
                  >
                    {{ todo.priority }}
                  </Badge>
                  <span v-if="todo.due_date" 
                    class="text-xs"
                    :class="isOverdue(todo.due_date) ? 'text-red-500' : 'text-gray-500'"
                  >
                    {{ getDueStatus(todo.due_date) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Task Context -->
            <div class="flex items-center gap-4 ml-11">
              <!-- Project Info -->
              <div v-if="getProjectName(todo.project)" class="flex items-center gap-2">
                <FeatherIcon name="briefcase" class="w-3 h-3 text-gray-400" />
                <span class="text-xs text-gray-500">
                  {{ getProjectName(todo.project) }}
                </span>
              </div>

              <!-- Document Info -->
              <div v-if="todo.related_doctype" class="flex items-center gap-2">
                <FeatherIcon :name="getIconByDoctype(todo.related_doctype)" class="w-3 h-3 text-gray-400" />
                <span class="text-xs text-gray-500">
                  {{ todo.related_doctype.replace('RUA ', '') }}{{ todo.related_docname ? `: ${todo.related_docname}` : '' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-12">
      <div class="flex flex-col items-center justify-center">
        <div class="p-3 bg-green-50 rounded-full mb-4">
          <FeatherIcon name="check" class="w-6 h-6 text-green-500" />
        </div>
        <h3 class="text-sm font-medium text-gray-900">All Caught Up!</h3>
        <p class="text-sm text-gray-500 mt-1">No pending tasks at the moment.</p>
      </div>
    </div>

    <!-- Task Details Dialog -->
    <TaskDetailsDialog
      v-model="showTaskDetailsDialog"
      :task="selectedTask"
      @task-updated="todoResource.reload()"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FeatherIcon, Badge, dayjs } from 'frappe-ui'
import { todoResource } from '@/data/todo'
import { session } from '@/data/session'
import { projectResource } from '@/data/project'
import TaskDetailsDialog from './TaskDetailsDialog.vue'
import { getRelativeTime, isBeforeToday } from '@/utils/format'

// State
const showTaskDetailsDialog = ref(false)
const selectedTask = ref(null)

// Computed
const pendingTodos = computed(() => {
  return todoResource.data?.filter(todo => 
    todo.assigned_to === session.user &&
    todo.status !== 'Completed' &&
    todo.status !== 'Cancelled'
  ) || []
})

const sortedTodos = computed(() => {
  return [...pendingTodos.value].sort((a, b) => {
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
    
    // First sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    // Then by due date if exists
    if (a.due_date && b.due_date) {
      return dayjs(a.due_date).diff(dayjs(b.due_date))
    }
    
    // Put tasks with due dates before those without
    if (a.due_date) return -1
    if (b.due_date) return 1
    
    // Finally sort by creation date
    return dayjs(b.creation).diff(dayjs(a.creation))
  })
})

// Methods
function showTaskDetails(task) {
  selectedTask.value = task
  showTaskDetailsDialog.value = true
}

function getPriorityClass(priority) {
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

function getProjectName(projectId) {
  return projectResource.data?.find(p => p.name === projectId)?.project_name || projectId
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

function getDueStatus(dueDate) {
  if (!dueDate) return ''
  return getRelativeTime(dueDate)
}

function isOverdue(dueDate) {
  if (!dueDate) return false
  return isBeforeToday(dueDate)
}

</script>