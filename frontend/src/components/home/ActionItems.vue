<template>
  <div class="rounded-lg bg-white">
    <!-- Task List -->
    <div v-if="pendingTodos.length" class="min-h-[75px] max-h-[400px] divide-y divide-gray-100 overflow-y-auto">
      <div 
        v-for="todo in sortedTodos" 
        :key="todo.name"
        class="group cursor-pointer p-4 rounded-lg transition-colors hover:bg-gray-50"
        @click="showTaskDetails(todo)"
      >
        <div class="flex gap-3">
          <!-- Priority Indicator -->
          <div class="relative mt-1">
            <div 
              class="h-2 w-2 rounded-full"
              :class="{
                'bg-red-500': todo.priority === 'High',
                'bg-orange-400': todo.priority === 'Medium',
                'bg-green-400': todo.priority === 'Low',
              }"
            />
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between">
              <p class="text-sm font-medium text-gray-900">{{ todo.details }}</p>
              <div 
                v-if="todo.due_date"
                class="ml-2 shrink-0 text-xs"
                :class="isOverdue(todo.due_date) ? 'text-red-500' : 'text-gray-500'"
              >
                {{ getDueStatus(todo.due_date) }}
              </div>
            </div>

            <!-- Context -->
            <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <!-- Priority -->
              <div class="flex items-center gap-1.5">
                <FeatherIcon name="flag" class="h-3 w-3" />
                {{ todo.priority }}
              </div>

              <!-- Project -->
              <div v-if="getProjectName(todo.project)" class="flex items-center gap-1.5">
                <FeatherIcon name="briefcase" class="h-3 w-3" />
                {{ getProjectName(todo.project) }}
              </div>

              <!-- Document -->
              <div v-if="todo.related_doctype" class="flex items-center gap-1.5">
                <FeatherIcon :name="getIconByDoctype(todo.related_doctype)" class="h-3 w-3" />
                {{ todo.related_doctype.replace('RUA ', '') }}{{ todo.related_docname ? `: ${todo.related_docname}` : '' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center py-12 text-center">
      <div class="mb-3 rounded-full bg-green-50 p-3">
        <FeatherIcon name="check" class="h-5 w-5 text-green-500" />
      </div>
      <p class="text-sm font-medium text-gray-900">All Caught Up!</p>
      <p class="mt-1 text-sm text-gray-500">You've completed all your tasks.</p>
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
import TaskDetailsDialog from '@/components/task/TaskDetailsDialog.vue'
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