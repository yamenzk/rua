<template>
  <Dialog v-model="show" :options="dialogOptions">
    <template #body-content>
      <div class="space-y-6">
        <!-- Multi-step indicator -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-around">
            <div 
              v-for="(step, index) in ['Basic Info', 'Details', 'Review']" 
              :key="step"
              class="flex items-center space-x-2"
              :class="currentStep === index ? 'text-gray-900' : 'text-gray-500'"
            >
              <span 
                class="relative flex h-7 w-7 items-center justify-center rounded-full border-2"
                :class="currentStep === index ? 'border-gray-900 bg-gray-200' : 'border-gray-300 bg-white'"
              >
                {{ index + 1 }}
              </span>
              <span class="font-medium text-sm">{{ step }}</span>
            </div>
          </div>
        </div>

        <!-- Step 1: Basic Info -->
        <div v-if="currentStep === 0" class="space-y-6">
          <!-- Project Selection with Autocomplete -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-900">Project</label>
            <CustomAutocomplete
              v-model="formData.project"
              :options="projectOptions"
              placeholder="Select project..."
            >
              <template #prefix>
                <FeatherIcon name="briefcase" class="w-4 h-4 text-gray-400 mr-2" />
              </template>
              <template #item-prefix="{ option }">
                <FeatherIcon name="briefcase" class="w-4 h-4 text-gray-400 mr-2" />
              </template>
            </CustomAutocomplete>
          </div>

          <!-- Assignee with Autocomplete -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-900">Assignee</label>
            <CustomAutocomplete
              v-model="formData.assigned_to"
              :options="assigneeOptions"
              placeholder="Select assignee..."
            >
              <template #prefix v-if="selectedAssigneeAvatar">
                <Avatar
                  :image="selectedAssigneeAvatar"
                  :label="getAssigneeName(formData.assigned_to)?.substring(0, 2)"
                  size="sm"
                  class="mr-2"
                />
              </template>
              <template #item-prefix="{ option }">
                <Avatar
                  :image="option.image"
                  :label="option.label.substring(0, 2)"
                  size="sm"
                  class="mr-2"
                />
              </template>
            </CustomAutocomplete>
          </div>

          <!-- Priority Selection with Colored Buttons -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-900">Priority Level</label>
            <div class="flex gap-3">
              <button
                v-for="priority in ['High', 'Medium', 'Low']"
                :key="priority"
                type="button"
                class="flex-1 px-4 py-2.5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2"
                :class="[
                  formData.priority === priority ? 
                    getPriorityActiveClass(priority) : 
                    'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                ]"
                @click="formData.priority = priority"
              >
                <FeatherIcon 
                  :name="getPriorityIcon(priority)" 
                  class="w-4 h-4"
                  :class="formData.priority === priority ? 'text-white' : getPriorityIconColor(priority)"
                />
                <span>{{ priority }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2: Task Details -->
        <div v-if="currentStep === 1" class="space-y-6">
          <!-- Task Description -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-900">Task Description</label>
            <textarea
              v-model="formData.details"
              rows="4"
              class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
              placeholder="Describe the task in detail..."
            />
          </div>

          <!-- Due Date with Calendar -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-900">Due Date</label>
            <div class="relative">
              <input
  type="date"
  v-model="formData.due_date"
  :min="getServerDate()"
  class="block w-full rounded-lg border-gray-300 pl-10 focus:border-gray-900 focus:ring-gray-900"
/>
              <FeatherIcon 
                name="calendar" 
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />
            </div>
          </div>

          <!-- Related Document Selection with Autocomplete -->
          <div class="space-y-4">
            <label class="block text-sm font-medium text-gray-900">Related Document</label>
            <div class="space-y-3">
              <CustomAutocomplete
                v-model="formData.related_doctype"
                :options="doctypeOptions"
                placeholder="Select document type..."
              >
                <template #prefix>
                  <FeatherIcon 
                    :name="getIconByDoctype(formData.related_doctype || '')" 
                    class="w-4 h-4 text-gray-400 mr-2"
                  />
                </template>
                <template #item-prefix="{ option }">
                  <FeatherIcon 
                    :name="getIconByDoctype(option.value)" 
                    class="w-4 h-4 text-gray-400 mr-2"
                  />
                </template>
              </CustomAutocomplete>

              <div v-if="formData.related_doctype">
                <CustomAutocomplete
                  v-model="formData.related_docname"
                  :options="documentOptions"
                  placeholder="Select document..."
                >
                  <template #item="{ option }">
                    <div class="flex flex-col">
                      <span>{{ option.label }}</span>
                      <span v-if="option.description" class="text-xs text-gray-500">
                        {{ option.description }}
                      </span>
                    </div>
                  </template>
                </CustomAutocomplete>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Review -->
        <div v-if="currentStep === 2" class="space-y-6">
          <div class="bg-gray-50 rounded-lg p-4 space-y-4">
            <!-- Basic Info Review -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-500">Project</div>
                <div class="text-sm font-medium text-gray-900">
                  {{ getProjectName(formData.project) }}
                </div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Assignee</div>
                <div class="flex items-center gap-2">
                  <Avatar
                    :image="selectedAssigneeAvatar"
                    :label="getAssigneeName(formData.assigned_to)?.substring(0, 2)"
                    size="sm"
                  />
                  <span class="text-sm font-medium text-gray-900">
                    {{ getAssigneeName(formData.assigned_to) }}
                  </span>
                </div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Priority</div>
                <Badge
                  :variant="getPriorityTheme(formData.priority) === 'gray' ? 'solid' : 'subtle'"
                  :theme="getPriorityTheme(formData.priority)"
                >
                  {{ formData.priority }}
                </Badge>
              </div>
              <div>
                <div class="text-sm text-gray-500">Due Date</div>
                <div class="text-sm font-medium text-gray-900">
                  {{ formData.due_date ? formatDate(formData.due_date, DATE_FORMATS.SHORT) : '—' }}
                </div>
              </div>
            </div>

            <!-- Task Details Review -->
            <div class="pt-4 border-t border-gray-200">
              <div class="text-sm text-gray-500">Task Description</div>
              <div class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {{ formData.details }}
              </div>
            </div>

            <!-- Related Document Review -->
            <div v-if="formData.related_doctype && formData.related_docname" class="pt-4 border-t border-gray-200">
              <div class="text-sm text-gray-500">Related Document</div>
              <div class="mt-1 flex items-center gap-2">
                <FeatherIcon 
                  :name="getIconByDoctype(formData.related_doctype)" 
                  class="w-4 h-4 text-gray-400"
                />
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ formData.related_doctype.replace('RUA ', '') }}
                  </div>
                  <div class="text-sm text-gray-500">{{ formData.related_docname }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #actions>
      <div class="flex justify-between w-full">
        <Button
          v-if="currentStep > 0"
          variant="subtle"
          @click="currentStep--"
        >
          Back
        </Button>
        <div class="flex gap-2">
          <Button
            variant="subtle"
            @click="closeModal"
          >
            Cancel
          </Button>
          <Button
            v-if="currentStep < 2"
            variant="solid"
            :disabled="!canProceed"
            @click="currentStep++"
          >
            Continue
          </Button>
          <Button
            v-else
            variant="solid"
            theme="green"
            :loading="creating"
            :disabled="!isFormValid"
            @click="createTask"
          >
            Create Task
          </Button>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import {
  Dialog,
  Button,
  Avatar,
  Badge,
  FeatherIcon,
} from 'frappe-ui'
import CustomAutocomplete from './CustomAutocomplete.vue'
import { todoResource } from '@/data/todo'
import { userDetails } from '@/data/roles'
import { employeeResource } from '@/data/employee'
import { purchaseReceiptResource } from '@/data/purchaseReceipt'
import { paymentResource } from '@/data/payment'
import { invoiceResource } from '@/data/invoice'
import { lpoResource } from '@/data/lpo'
import { rfqResource } from '@/data/rfq'
import { quotationResource } from '@/data/quotation'
import { projectResource } from '@/data/project'
import { formatDate, getServerDate, DATE_FORMATS } from '@/utils/format'

const props = defineProps({
  modelValue: Boolean,
  projectOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

// State
const currentStep = ref(0)
const creating = ref(false)
const formData = ref({
  project: '',
  assigned_to: '',
  priority: '',
  details: '',
  due_date: '',
  related_doctype: '',
  related_docname: ''
})

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogOptions = computed(() => ({
  title: 'Create New Task',
  size: 'xl',
}))

const assigneeOptions = computed(() => {
  return employeeResource.data
    ?.filter(employee => employee.user)
    .map(employee => ({
      label: employee.employee_name,
      value: employee.user,
      image: employee.image
    })) || []
})

const selectedAssigneeAvatar = computed(() => {
  const employee = employeeResource.data?.find(
    employee => employee.user === formData.value.assigned_to
  )
  return employee?.image
})

const doctypeOptions = computed(() => [
  { label: 'None', value: '' },
  { label: 'Purchase Receipt', value: 'RUA Purchase Receipt' },
  { label: 'Payment', value: 'RUA Payment' },
  { label: 'Invoice', value: 'RUA Invoice' },
  { label: 'LPO', value: 'RUA LPO' },
  { label: 'RFQ', value: 'RUA RFQ' },
  { label: 'Quotation', value: 'RUA Quotation' },
  { label: 'Project', value: 'RUA Project' },
  { label: 'Employee', value: 'RUA Employee' }
])

const documentOptions = computed(() => {
  const doctype = formData.value.related_doctype
  if (!doctype) return []

  switch (doctype) {
    case 'RUA Purchase Receipt':
      return purchaseReceiptResource.data?.map(doc => ({
        label: doc.name,
        value: doc.name,
        description: doc.party ? `Supplier: ${doc.party}` : 'No Supplier'
      })) || []
    
    case 'RUA Payment':
      return paymentResource.data?.map(doc => ({
        label: doc.name,
        value: doc.name,
        description: `Amount: ${formatCurrency(doc.amount)}`
      })) || []
    
    case 'RUA Invoice':
      return invoiceResource.data?.map(doc => ({
        label: doc.name,
        value: doc.name,
        description: `${doc.party} (${formatCurrency(doc.amount)})`
      })) || []
    
    case 'RUA LPO':
      return lpoResource.data?.map(doc => ({
        label: doc.name,
        value: doc.name,
        description: doc.party
      })) || []
    
    case 'RUA RFQ':
      return rfqResource.data?.map(doc => ({
        label: doc.name,
        value: doc.name,
        description: doc.party || 'Multiple Suppliers'
      })) || []
    
    case 'RUA Quotation':
      return quotationResource.data?.map(doc => ({
        label: doc.name,
        value: doc.name,
        description: doc.party
      })) || []
    
    case 'RUA Project':
      return projectResource.data?.filter(proj => !proj.is_child).map(doc => ({
        label: doc.project_name,
        value: doc.name,
        description: doc.serial_number ? `#${doc.serial_number}` : ''
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

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return formData.value.project && 
           formData.value.assigned_to && 
           formData.value.priority
  }
  if (currentStep.value === 1) {
    return formData.value.details
  }
  return true
})

const isFormValid = computed(() => {
  return formData.value.project && 
         formData.value.assigned_to && 
         formData.value.priority &&
         formData.value.details
})

// Watch for changes in doctype to reset docname
watchEffect(() => {
  if (formData.value.related_doctype) {
    formData.value.related_docname = ''
  }
})

// Methods
function getPriorityIcon(priority) {
  switch (priority) {
    case 'High':
      return 'alert-circle'
    case 'Medium':
      return 'alert-triangle'
    case 'Low':
      return 'info'
    default:
      return 'flag'
  }
}

function getPriorityActiveClass(priority) {
  switch (priority) {
    case 'High':
      return 'border-red-600 bg-red-600 text-white'
    case 'Medium':
      return 'border-orange-500 bg-orange-500 text-white'
    case 'Low':
      return 'border-green-600 bg-green-600 text-white'
    default:
      return 'border-gray-300 bg-white text-gray-700'
  }
}

function getPriorityIconColor(priority) {
  switch (priority) {
    case 'High':
      return 'text-red-600'
    case 'Medium':
      return 'text-orange-500'
    case 'Low':
      return 'text-green-600'
    default:
      return 'text-gray-400'
  }
}

function getProjectName(projectId) {
  const project = props.projectOptions.find(p => p.value === projectId)
  return project?.label || projectId
}



function closeModal() {
  currentStep.value = 0
  formData.value = {
    project: '',
    assigned_to: '',
    priority: '',
    details: '',
    due_date: '',
    related_doctype: '',
    related_docname: ''
  }
  show.value = false
}

async function createTask() {
  if (!isFormValid.value) return
  
  creating.value = true
  try {
    const response = await todoResource.insert.submit({
      project: formData.value.project,
      assigned_to: formData.value.assigned_to,
      priority: formData.value.priority,
      details: formData.value.details,
      due_date: formData.value.due_date,
      related_doctype: formData.value.related_doctype,
      related_docname: formData.value.related_docname,
      status: 'Open'
    })
    
    emit('created', response)
    closeModal()
  } catch (error) {
    console.error('Failed to create task:', error)
  } finally {
    creating.value = false
  }
}

function getAssigneeName(userId) {
  return userDetails.data?.[userId]?.full_name || userId
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

function formatCurrency(value) {
  if (!value) return 'AED 0'
  return `AED ${Math.floor(value).toLocaleString()}`
}
</script>