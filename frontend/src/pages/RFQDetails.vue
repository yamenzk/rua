# RFQDetails.vue
<template>
  <!-- Loading State -->
  <div v-if="!rfqResource?.doc || rfqResource?.loading" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else>
    <!-- Document Actions -->
    <div class="sticky top-0 z-10 bg-white border-b">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-4">
          <!-- Back Button -->
          <Button @click="router.push(`/project/${projectResource.doc.name}/invoicing/rfqs`)">
            <template #prefix>
              <FeatherIcon name="arrow-left" class="w-4 h-4" />
            </template>
            <span class="hidden md:inline">Back to RFQs</span>
          </Button>

          <!-- Document Info -->
          <div class="flex flex-col">
            <h1 class="text-xl font-bold text-gray-900">
              {{ rfqResource.doc.name }}
            </h1>
            <p class="text-sm text-gray-600 hidden md:inline">
              Created on {{ formatDate(rfqResource.doc.creation) }} by
              {{ rfqResource.doc.owner }}
            </p>
          </div>
        </div>

        <!-- Status and Actions -->
        <div class="flex items-center gap-3">
          <!-- Status Badge -->
          <Badge
            :variant="rfqResource.doc.status === 'Quotation Received' ? 'solid' : 'subtle'"
            :theme="getStatusVariant(rfqResource.doc.status)"
            class="cursor-pointer"
            @click="showStatusDialog = true"
          >
            {{ rfqResource.doc.status }}
          </Badge>

          <!-- Actions Dropdown -->
          <Dropdown :options="actionDropdownOptions">
            <Button>
              <template #icon>
                <FeatherIcon name="more-horizontal" class="h-4 w-4" />
              </template>
            </Button>
          </Dropdown>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-8 px-6 py-4">
      <!-- Summary Section -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">RFQ Details</h2>
          <div class="text-sm text-gray-600 hidden md:inline">
            Last modified: {{ formatDate(rfqResource.doc.modified) }} by
            {{ rfqResource.doc.modified_by }}
          </div>
        </div>

        <!-- Details Card -->
        <div class="bg-white border rounded-lg shadow-sm">
          <!-- Party Information -->
          <div class="p-6" :class="{ 'border-b': !isLinkType }">
            <div class="flex items-start space-x-4">
              <!-- Party Image -->
              <div class="flex-shrink-0">
                <img
                  v-if="partyData?.image"
                  :src="partyData.image"
                  :alt="rfqResource.doc.party"
                  class="w-16 h-16 rounded-lg object-cover"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center"
                >
                  <FeatherIcon name="briefcase" class="w-8 h-8 text-gray-400" />
                </div>
              </div>

              <!-- Party Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">
                      {{ rfqResource.doc.party }}
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">
                      <span class="hidden md:inline">RFQ Date: </span>{{ formatDate(rfqResource.doc.date, true) }}
                    </p>
                    <p class="mt-1 text-sm text-gray-500">
                      Type: {{ rfqResource.doc.type }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Link Section (only for Link type) -->
          <div v-if="isLinkType" class="p-6 border-b">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <FeatherIcon name="link" class="w-5 h-5 text-gray-400" />
              </div>
              <div class="ml-3 flex-1">
                <h3 class="text-sm font-medium text-gray-900">External Link</h3>
                <div class="mt-1">
                  <a 
                    :href="rfqResource.doc.link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-gray-600 hover:text-gray-800 break-all"
                  >
                    {{ rfqResource.doc.link }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Metrics Grid (only for non-Link types) -->
          <div v-if="!isLinkType" class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            <div class="p-6">
              <label class="text-sm font-medium text-gray-600">Total Items</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ rfqResource.doc.total_items }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <label class="text-sm font-medium text-gray-600">Net Total</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(rfqResource.doc.total_amount) }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <label class="text-sm font-medium text-gray-600">Grand Total</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(rfqResource.doc.grand_total) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Cancellation Notice -->
          <div
            v-if="rfqResource.doc.status === 'Cancelled'"
            class="p-6 bg-red-50 border-t"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <FeatherIcon name="alert-circle" class="w-5 h-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Cancellation Remarks</h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ rfqResource.doc.remarks }}
                </div>
              </div>
            </div>
          </div>

          <!-- Quotation File Preview -->
          <div
            v-if="rfqResource.doc.status === 'Quotation Received' && rfqResource.doc.quotation_file"
            class="border-t"
          >
            <div class="p-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">Quotation Document</h3>
              <iframe
                v-if="isPDF"
                :src="rfqResource.doc.quotation_file"
                class="w-full h-[1200px] border rounded-lg"
                frameborder="0"
              ></iframe>
              <div v-else class="text-center py-8">
                <a 
                  :href="rfqResource.doc.quotation_file" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  class="text-gray-600 hover:text-gray-800"
                >
                  <FeatherIcon name="download" class="w-8 h-8 mx-auto mb-2" />
                  <span>Download Quotation File</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items List (only for non-Link types) -->
      <RFQItems 
        v-if="!isLinkType"
        :items="rfqResource.doc.items"
        :type="rfqResource.doc.type"
        :status="rfqResource.doc.status"
        :rfq-name="rfqResource.doc.name"
        :totals="{
          net: rfqResource.doc.total_amount,
          vat: rfqResource.doc.vat_amount,
          grand: rfqResource.doc.grand_total
        }"
      />
    </div>
  </div>

  <!-- Status Update Dialog -->
  <Dialog
    v-model="showStatusDialog"
    :options="statusDialogOptions"
  >
    <template #body-content>
      <div class="space-y-4">
        <!-- Status Selection -->
        <div class="space-y-4">
          <label class="block text-sm font-medium text-gray-700">
            {{ hasAvailableStatuses ? 'Change Status' : 'Cancelled' }}
          </label>

          <div v-if="!hasAvailableStatuses" class="text-sm text-gray-600 italic">
            {{ rfqResource.doc.remarks }}
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="status in availableStatuses"
              :key="status"
              :class="radioClasses.container"
            >
              <input
                type="radio"
                :id="status"
                name="status"
                :value="status"
                v-model="newStatus"
                :class="radioClasses.input"
              />
              <div :class="radioClasses.radio"></div>
              <label :for="status" :class="radioClasses.label">
                {{ status }}
              </label>
            </div>
          </div>

          <!-- Cancellation Remarks -->
          <div v-if="newStatus === 'Cancelled'" class="mt-4">
            <Textarea
              v-model="remarks"
              label="Cancellation Remarks"
              placeholder="Please provide a reason for cancellation"
              variant="outline"
              size="sm"
              class="w-full"
            />
          </div>

          <!-- Quotation File Upload -->
          <div v-if="newStatus === 'Quotation Received'" class="space-y-4">
            <div class="text-sm font-medium text-gray-700">Quotation File</div>
            <FileUploader
              v-model="quotationFile"
              :accept="['application/pdf', 'image/*', '.doc', '.docx', '.xls', '.xlsx']"
              :max-size="5000000"
              :upload-args="uploadArgs"
              @success="handleUploadSuccess"
              v-slot="{ openFileSelector, file, uploading, progress, error }"
            >
              <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-900 transition-colors cursor-pointer"
                @click="openFileSelector"
                @dragover.prevent="$event.currentTarget.classList.add('border-gray-900')"
                @dragleave.prevent="$event.currentTarget.classList.remove('border-gray-900')"
                @drop.prevent="handleDrop($event, openFileSelector)"
              >
                <div class="flex flex-col items-center justify-center space-y-2">
                  <div v-if="!file" class="text-center">
                    <FeatherIcon name="upload-cloud" class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div class="text-sm font-medium text-gray-900">Click to upload file</div>
                    <div class="text-xs text-gray-500">or drag and drop</div>
                  </div>
                  <div v-else class="w-full">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <FeatherIcon name="file" class="w-4 h-4 text-gray-400" />
                        <span class="text-sm text-gray-900">{{ file.name }}</span>
                      </div>
                      <button
                        v-if="!uploading"
                        class="text-sm text-red-500 hover:text-red-700"
                        @click.stop="quotationFile = null"
                      >
                        Remove
                      </button>
                    </div>
                    <div v-if="uploading" class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-gray-900 h-2 rounded-full transition-all duration-300"
                        :style="{ width: progress + '%' }"
                      ></div>
                    </div>
                  </div>
                  <div v-if="error" class="text-sm text-red-500">{{ error }}</div>
                </div>
              </div>
            </FileUploader>
            <div class="text-sm text-gray-500">
              Maximum file size: 5MB. Supported formats: PDF, Images, Word, Excel
            </div>
          </div>

          <!-- Status Update Error -->
          <div v-if="statusError" class="text-sm text-red-500 mt-1">
            {{ statusError }}
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createRFQResource } from '@/data/rfq'
import { partyResource } from '@/data/party'
import {
  Button,
  Badge,
  FeatherIcon,
  Tooltip,
  Dropdown,
  Dialog,
  Textarea,
  FileUploader,
  LoadingIndicator
} from 'frappe-ui'
import RFQItems from './RFQItems.vue'
import { formatDate, formatCurrency } from '@/utils/format'

const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'doc' in value
    }
  }
})

const route = useRoute()
const router = useRouter()

// State Management
const rfqResource = ref(null)
const showStatusDialog = ref(false)
const newStatus = ref('')
const statusError = ref('')
const quotationFile = ref(null)
const uploadedResult = ref(null)
const isUpdatingStatus = ref(false)
const remarks = ref('')

// Computed Properties
const partyData = computed(() => {
  return partyResource.data?.find(p => p.name === rfqResource.value?.doc?.party)
})

const isLinkType = computed(() => {
  return rfqResource.value?.doc?.type === 'Link'
})

const isPDF = computed(() => {
  const file = rfqResource.value?.doc?.quotation_file
  return file?.toLowerCase().endsWith('.pdf')
})

const availableStatuses = computed(() => 
  getAvailableStatuses(rfqResource.value?.doc?.status)
)

const hasAvailableStatuses = computed(() => 
  availableStatuses.value.length > 0
)

const actionDropdownOptions = computed(() => {
  const options = []

  if (!isLinkType.value) {
    options.push(
      {
        label: 'Download PDF',
        icon: 'file-text',
        onClick: downloadPDF
      },
      {
        label: 'Print',
        icon: 'printer',
        onClick: printRFQ
      }
    )
  }

  return options
})

const statusDialogOptions = computed(() => ({
  title: hasAvailableStatuses.value ? 'Update RFQ Status' : 'RFQ Status',
  size: 'sm',
  actions: hasAvailableStatuses.value ? [
    {
      label: 'Update Status',
      variant: 'solid',
      loading: isUpdatingStatus.value,
      disabled: newStatus.value === 'Quotation Received' && !uploadedResult.value?.file_url,
      onClick: updateStatus
    }
  ] : []
}))

const uploadArgs = computed(() => ({
  doctype: 'RUA RFQ',
  docname: rfqResource.value?.doc?.name,
  fieldname: 'quotation_file',
  private: true
}))

// Style Classes
const radioClasses = {
  container: 'relative flex items-center p-4 cursor-pointer rounded-lg border hover:border-gray-500 transition-colors',
  input: 'peer absolute opacity-0 w-full h-full cursor-pointer',
  radio: 'w-5 h-5 border-2 rounded-full peer-checked:border-gray-900 peer-checked:border-8 transition-all',
  label: 'ml-3 text-sm font-medium text-gray-900 peer-checked:text-gray-900'
}

// Methods
function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'submitted':
      return 'blue'
    case 'quotation received':
      return 'green'
    case 'cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

function getAvailableStatuses(currentStatus) {
  switch (currentStatus?.toLowerCase()) {
    case 'draft':
      return ['Submitted', 'Cancelled']
    case 'submitted':
      return ['Quotation Received', 'Cancelled']
    case 'quotation received':
      return ['Cancelled']
    case 'cancelled':
      return []
    default:
      return []
  }
}

function handleUploadSuccess(result) {
  uploadedResult.value = result
}

function handleDrop(event) {
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (acceptedTypes.includes(file.type)) {
      event.currentTarget.classList.remove('border-gray-900')
      const input = document.querySelector('input[type="file"]')
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    } else {
      statusError.value = 'Please upload a supported file type (PDF, Images, Word, or Excel)'
    }
  }
}

function resetStatusDialog() {
  showStatusDialog.value = false
  newStatus.value = ''
  statusError.value = ''
  quotationFile.value = null
  uploadedResult.value = null
  remarks.value = ''
}

async function updateStatus() {
  statusError.value = ''

  // Validate status change
  if (!availableStatuses.value.includes(newStatus.value)) {
    statusError.value = 'Invalid status transition'
    return
  }

  if (!newStatus.value) {
    statusError.value = 'Please select a status'
    return
  }

  if (newStatus.value === 'Cancelled' && !remarks.value.trim()) {
    statusError.value = 'Please provide cancellation remarks'
    return
  }

  if (newStatus.value === 'Quotation Received' && !uploadedResult.value?.file_url) {
    statusError.value = 'Please upload the quotation file'
    return
  }

  try {
    isUpdatingStatus.value = true
    const updateData = {
      name: rfqResource.value.doc.name,
      status: newStatus.value,
    }

    if (newStatus.value === 'Quotation Received') {
      updateData.quotation_file = uploadedResult.value.file_url
    }

    if (newStatus.value === 'Cancelled') {
      updateData.remarks = remarks.value
    }

    await rfqResource.value.setValue.submit(updateData)
    await rfqResource.value.reload()
    resetStatusDialog()
  } catch (error) {
    statusError.value = 'Failed to update status'
  } finally {
    isUpdatingStatus.value = false
  }
}

async function downloadPDF() {
  try {
    const response = await fetch(`/api/method/frappe.utils.print_format.download_pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctype: 'RUA RFQ',
        name: rfqResource.value.doc.name,
        format: 'Standard',
        no_letterhead: 0,
      }),
    })

    if (!response.ok) throw new Error('Failed to download PDF')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${rfqResource.value.doc.name}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
  }
}

function printRFQ() {
  let baseUrl = window.location.origin

  if (window.location.hostname === 'localhost' && window.location.port === '8080') {
    baseUrl = `http://${window.location.hostname}:8000`
  }

  const url = `${baseUrl}/printview?doctype=RUA RFQ&name=${rfqResource.value.doc.name}&format=Standard&no_letterhead=0&_lang=en`
  window.open(url, '_blank')
}

// Initialize and watch resources
onMounted(() => {
    initializeRFQResource()
})

function initializeRFQResource() {
  if (route.params.rfqId) {
    rfqResource.value = createRFQResource(route.params.rfqId)
  }
}

// Watch for route changes
watch(() => route.params.rfqId, (newId) => {
  if (newId) {
    rfqResource.value = createRFQResource(newId)
  }
})
</script>