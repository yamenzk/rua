<template>
    <Dialog v-model="show" :options="dialogOptions">
      <template #body-content>
        <div v-if="!task" class="py-8 text-center text-gray-500">Loading...</div>
        <div v-else>
          <!-- Header with Status and Priority -->
          <div class="relative pb-6 mb-6 border-b">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div 
                  class="p-2 rounded-lg"
                  :class="getPriorityClass(task.priority)"
                >
                  <FeatherIcon 
                    name="alert-circle" 
                    class="w-5 h-5"
                    :class="getPriorityIconClass(task.priority)"
                  />
                </div>
                <div>
                  <Badge
                    size="lg"
                    :variant="getStatusTheme(task.status) === 'gray' ? 'solid' : 'subtle'"
                    :theme="getStatusTheme(task.status)"
                  >
                    {{ task.status }}
                  </Badge>
                  <div class="mt-1 text-xs text-gray-500">
                    Created {{ formatDate(task.creation) }}
                  </div>
                </div>
              </div>
              <Badge
                size="lg"
                :variant="getPriorityTheme(task.priority) === 'gray' ? 'solid' : 'subtle'"
                :theme="getPriorityTheme(task.priority)"
              >
                {{ task.priority }}
              </Badge>
            </div>
          </div>
  
          <div class="grid grid-cols-3 gap-6">
            <!-- Left Column: Task Details and Dates -->
            <div class="col-span-2 space-y-6">
              <!-- Task Description -->
              <div class="space-y-2">
                <h3 class="text-sm font-medium text-gray-900">Task Description</h3>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <div class="text-sm text-gray-900 whitespace-pre-wrap">{{ task.details }}</div>
                </div>
              </div>
  
              <!-- Due Date Info -->
              <div v-if="task.due_date" class="space-y-2">
                <h3 class="text-sm font-medium text-gray-900">Due Date</h3>
                <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div class="p-2 rounded-lg bg-white">
                    <FeatherIcon 
                      name="calendar" 
                      class="w-4 h-4 text-gray-400"
                    />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ formatDate(task.due_date) }}
                    </div>
                    <div 
                      class="text-xs mt-0.5"
                      :class="isOverdue(task.due_date) ? 'text-red-500' : 'text-gray-500'"
                    >
                      {{ getDueStatus(task.due_date) }}
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- Related Document -->
              <div v-if="task.related_doctype && task.related_docname" class="space-y-2">
                <h3 class="text-sm font-medium text-gray-900">Related Document</h3>
                <Button
                  variant="subtle"
                  class="w-full justify-start p-4 hover:bg-gray-100"
                  @click="navigateToDocument(task.related_doctype, task.related_docname, task.project)"
                >
                  <div class="flex items-center">
                    <div class="p-2">
                      <FeatherIcon 
                        :name="getIconByDoctype(task.related_doctype)" 
                        class="w-4 h-4 text-gray-800"
                      />
                    </div>
                    <div class="flex flex-col">
                      <div class="text-xs text-gray-800">{{ task.related_docname }}</div>
                    </div>

                  </div>
                </Button>
              </div>
            </div>
  
            <!-- Right Column: Assignment Info -->
            <div class="space-y-6">
              <!-- Assignee Card -->
              <div class="space-y-2">
                <h3 class="text-sm font-medium text-gray-900">Assigned To</h3>
                <div class="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div class="flex items-center gap-3">
                    <Avatar
                      :image="getUserAvatar(task.assigned_to)"
                      :label="getAssigneeName(task.assigned_to)?.substring(0, 2)"
                      size="lg"
                    />
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ getAssigneeName(task.assigned_to) }}
                      </div>
                      <div class="text-xs text-gray-500 mt-0.5">Assignee</div>
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- Project Card -->
              <div v-if="task.project" class="space-y-2">
                <h3 class="text-sm font-medium text-gray-900">Project</h3>
                <div class="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg bg-white">
                      <FeatherIcon 
                        name="briefcase" 
                        class="w-4 h-4 text-gray-400"
                      />
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ getProjectName(task.project) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- Status Timeline -->
              <div class="space-y-2">
                <h3 class="text-sm font-medium text-gray-900">Status</h3>
                <div class="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div 
                    v-for="(status, index) in ['Open', 'Delayed', 'Completed']"
                    :key="status"
                    class="flex items-center gap-3"
                  >
                    <div 
                      class="w-2 h-2 rounded-full"
                      :class="[
                        task.status === status ? 'bg-gray-900' : 'bg-gray-300',
                        index === 2 ? '' : 'relative after:absolute after:top-2 after:left-1 after:w-px after:h-4 after:bg-gray-200'
                      ]"
                    ></div>
                    <div class="text-sm" :class="task.status === status ? 'text-gray-900 font-medium' : 'text-gray-500'">
                      {{ status }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
  
      <template #actions>
        <div class="flex justify-between w-full">
          <div class="flex gap-2">
            <Button
              v-if="task?.status !== 'Cancelled'"
              variant="subtle"
              theme="red"
              :loading="updating"
              @click="updateTaskStatus('Cancelled')"
            >
              <template #prefix>
                <FeatherIcon name="x" class="w-4 h-4" />
              </template>
              Cancel Task
            </Button>
          </div>
          <div class="flex gap-2">
            <Button
              v-if="task?.status === 'Open'"
              variant="subtle"
              theme="orange"
              :loading="updating"
              @click="updateTaskStatus('Delayed')"
            >
              <template #prefix>
                <FeatherIcon name="clock" class="w-4 h-4" />
              </template>
              Mark Delayed
            </Button>
            <Button
              v-if="['Open', 'Delayed'].includes(task?.status)"
              variant="solid"
              theme="green"
              :loading="updating"
              @click="updateTaskStatus('Completed')"
            >
              <template #prefix>
                <FeatherIcon name="check" class="w-4 h-4" />
              </template>
              Complete Task
            </Button>
          </div>
        </div>
      </template>
    </Dialog>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { Dialog, Button, Badge, Avatar, FeatherIcon } from 'frappe-ui'
  import { useRouter } from 'vue-router'
  import { todoResource } from '@/data/todo'
  import { projectResource } from '@/data/project'
  import { userDetails } from '@/data/roles'
  import { employeeResource } from '@/data/employee'
  import { formatDate, getDueStatus, isBeforeToday } from '@/utils/format'
  
  const router = useRouter()
  
  const props = defineProps({
    modelValue: Boolean,
    task: {
      type: Object,
      default: null
    }
  })
  
  const emit = defineEmits(['update:modelValue', 'taskUpdated'])
  
  // State
  const updating = ref(false)
  const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  const dialogOptions = computed(() => ({
    title: 'Task Details',
    size: 'xl'
  }))
  
  // Methods
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

  function getProjectName(projectId) {
    return projectResource.data?.find(p => p.name === projectId)?.project_name || projectId
  }
  
  function isOverdue(dueDate) {
  if (!dueDate) return false
  return isBeforeToday(dueDate)
}
  
  function getAssigneeName(userId) {
    const employee = employeeResource.data?.find(employee => employee.user === userId)
    return employee?.employee_name
  }
  
  function getUserAvatar(userId) {
    const employee = employeeResource.data?.find(employee => employee.user === userId)
    return employee?.image
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
  
  async function updateTaskStatus(status) {
    if (!props.task) return
    
    updating.value = true
    try {
      await todoResource.setValue.submit({
        name: props.task.name,
        status: status
      })
      emit('taskUpdated')
      show.value = false
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      updating.value = false
    }
  }
  
  function navigateToDocument(doctype, docName, projectName) {
    switch (doctype) {
      case 'RUA Purchase Receipt':
        router.push(`/project/${projectName}/invoicing/receipt/${docName}`)
        break
      case 'RUA Payment':
        router.push(`/project/${projectName}/invoicing/payment/${docName}`)
        break
      case 'RUA Invoice':
        router.push(`/project/${projectName}/invoicing/invoice/${docName}`)
        break
      case 'RUA LPO':
        router.push(`/project/${projectName}/invoicing/lpo/${docName}`)
        break
    case 'RUA RFQ':
      router.push(`/project/${projectName}/invoicing/rfq/${docName}`)
      break
    case 'RUA Quotation':
      router.push(`/project/${projectName}/invoicing/quotation/${docName}`)
      break
    case 'RUA Project':
      router.push(`/project/${projectName}`)
      break
    case 'RUA Employee':
      router.push(`/employee/${docName}`)
      break
  }
  show.value = false
}
</script>