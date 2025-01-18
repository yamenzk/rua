# LPODetails.vue
<template>
  <!-- Loading State -->
  <div v-if="!lpoResource?.doc || lpoResource?.loading" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else-if="lpoResource.error" class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <FeatherIcon name="alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p class="text-gray-600">Failed to load LPO details</p>
    </div>
  </div>

  <div v-else>
    <!-- Document Actions -->
    <div class="sticky top-0 z-10 bg-white border-b">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-4">
          <!-- Back Button -->
          <Button @click="router.push(`/project/${projectResource.doc.name}/invoicing/purchase-orders`)">
            <template #prefix>
              <FeatherIcon name="arrow-left" class="w-4 h-4" />
            </template>
            <span class="hidden md:inline">Back to Purchase Orders</span>
          </Button>

          <!-- Document Info -->
          <div class="flex flex-col">
            <h1 class="text-xl font-bold text-gray-900">
              {{ lpoResource.doc.name }}
            </h1>
            <p class="text-sm text-gray-600">
              Created on {{ formatDate(lpoResource.doc.creation) }} by
              {{ lpoResource.doc.owner }}
            </p>
          </div>
        </div>

        <!-- Status and Actions -->
        <div class="flex items-center gap-3">
          <!-- Status Badge -->
          <Badge
            :variant="lpoResource.doc.status === 'Final' ? 'solid' : 'subtle'"
            :theme="getStatusVariant(lpoResource.doc.status)"
            class="cursor-pointer"
            @click="showStatusDialog = true"
          >
            {{ lpoResource.doc.status }}
          </Badge>

          <Badge
            v-if="lpoResource.doc.status === 'Final'"
            :variant="getPaymentStatusVariant(lpoResource.doc.payment_status) === 'gray' ? 'solid' : 'subtle'"
            :theme="getPaymentStatusVariant(lpoResource.doc.payment_status)"
          >
            {{ lpoResource.doc.payment_status }}
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
          <h2 class="text-xl font-semibold">Purchase Order Details</h2>
          <div class="text-sm text-gray-600">
            Last modified: {{ formatDate(lpoResource.doc.modified) }} by
            {{ lpoResource.doc.modified_by }}
          </div>
        </div>

        <!-- Details Card -->
        <div class="bg-white border rounded-lg shadow-sm">
          <!-- Party Information -->
          <div class="p-6 border-b">
            <div class="flex items-start space-x-4">
              <!-- Party Image -->
              <div class="flex-shrink-0">
                <img
                  v-if="partyData?.image"
                  :src="partyData.image"
                  :alt="lpoResource.doc.party"
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
                      {{ lpoResource.doc.party }}
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">
                      LPO Date: {{ formatDate(lpoResource.doc.date, true) }}
                    </p>
                    <p class="mt-1 text-sm text-gray-500">
                      Type: {{ lpoResource.doc.type }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Metrics Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            <div class="p-6">
              <label class="text-sm font-medium text-gray-600">Total Items</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ lpoResource.doc.total_items }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <label class="text-sm font-medium text-gray-600">Net Total</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(lpoResource.doc.total_amount) }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <label class="text-sm font-medium text-gray-600">Grand Total</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(lpoResource.doc.grand_total) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Cancellation Notice -->
          <div
            v-if="lpoResource.doc.status === 'Cancelled'"
            class="p-6 bg-red-50 border-t"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <FeatherIcon name="alert-circle" class="w-5 h-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Cancellation Remarks</h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ lpoResource.doc.remarks }}
                </div>
              </div>
            </div>
          </div>

          <!-- Final LPO Preview -->
          <div
            v-if="lpoResource.doc.status === 'Final' && lpoResource.doc.final_lpo"
            class="border-t"
          >
          <div class="p-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">LPO Document</h3>
              <iframe
                v-if="isPDF"
                :src="lpoResource.doc.final_lpo"
                class="w-full h-[1200px] border rounded-lg"
                frameborder="0"
              ></iframe>
              <div v-else class="text-center py-8">
                <a 
                  :href="lpoResource.doc.final_lpo" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  class="text-gray-600 hover:text-gray-800"
                >
                  <FeatherIcon name="download" class="w-8 h-8 mx-auto mb-2" />
                  <span>Download LPO File</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items List -->
      <LPOItems 
  :items="lpoResource.doc.items"
  :type="lpoResource.doc.type"
  :status="lpoResource.doc.status"
  :lpo-name="lpoResource.doc.name"
  :totals="{
    net: lpoResource.doc.total_amount,
    vat: lpoResource.doc.vat_amount,
    grand: lpoResource.doc.grand_total
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
            {{ lpoResource.doc.remarks }}
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

          <!-- Status Update Error -->
          <div v-if="statusError" class="text-sm text-red-500 mt-1">
            {{ statusError }}
          </div>
        </div>

        <!-- Final LPO Upload -->
        <div v-if="newStatus === 'Final'" class="space-y-4">
          <div class="text-sm font-medium text-gray-700">Final LPO Document</div>
          <FileUploader
            v-model="finalLPO"
            :accept="['application/pdf']"
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
  @drop.prevent="handleDrop($event)"
  @dragenter.prevent
>
              <div class="flex flex-col items-center justify-center space-y-2">
                <div v-if="!file" class="text-center">
                  <FeatherIcon name="upload-cloud" class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div class="text-sm font-medium text-gray-900">Click to upload PDF</div>
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
                      @click.stop="finalLPO = null"
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
            Maximum file size: 5MB. Supported format: PDF
          </div>
        </div>
      </div>
    </template>
  </Dialog>
  <CreatePaymentDialog
  v-if="lpoResource?.doc"
  v-model="showCreatePaymentDialog"
  :source-doc="lpoResource.doc"
  source-type="RUA LPO"
/>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { partyResource } from '@/data/party'
import {
  Button,
  Badge,
  FeatherIcon,
  Dropdown,
  Dialog,
  Textarea,
  FileUploader,
  LoadingIndicator
} from 'frappe-ui'
import LPOItems from './LPOItems.vue'
import { formatDate, formatCurrency } from '@/utils/format'
import CreatePaymentDialog from './CreatePaymentDialog.vue'
import { createLPOResource } from '@/data/lpo'

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
const lpoResource = ref(null)
const showStatusDialog = ref(false)
const newStatus = ref('')
const statusError = ref('')
const finalLPO = ref(null)
const uploadedResult = ref(null)
const isUpdatingStatus = ref(false)
const remarks = ref('')
const showCreatePaymentDialog = ref(false)

// Computed Properties
const partyData = computed(() => {
  return partyResource.data?.find(p => p.name === lpoResource.value?.doc?.party)
})

const availableStatuses = computed(() => 
  getAvailableStatuses(lpoResource.value?.doc?.status)
)

const hasAvailableStatuses = computed(() => 
  availableStatuses.value.length > 0
)

const actionDropdownOptions = computed(() => {
  const doc = lpoResource.value?.doc
  if (!doc) return []

  if (doc.status === 'Cancelled') {
    return []
  }

  const options = [
    {
      label: 'Download PDF',
      icon: 'file-text',
      onClick: downloadPDF
    },
    {
      label: 'Print',
      icon: 'printer',
      onClick: printLPO
    }
  ]

  // Only show create payment option for submitted LPOs
  if (doc.status === 'Final' && doc.payment_status !== 'Paid') {
    options.push({
      label: 'Create Payment',
      icon: 'credit-card',
      onClick: () => showCreatePaymentDialog.value = true
    })
  }

  return options
})

const statusDialogOptions = computed(() => ({
  title: hasAvailableStatuses.value ? 'Update LPO Status' : 'LPO Status',
  size: 'sm',
  actions: hasAvailableStatuses.value ? [
    {
      label: 'Update Status',
      variant: 'solid',
      loading: isUpdatingStatus.value,
      onClick: updateStatus
    }
  ] : []
}))

const uploadArgs = computed(() => ({
  doctype: 'RUA LPO',
  docname: lpoResource.value?.doc?.name,
  fieldname: 'final_lpo',
  private: true
}))

// Style Classes
const radioClasses = {
  container: 'relative flex items-center p-4 cursor-pointer rounded-lg border hover:border-gray-500 transition-colors',
  input: 'peer absolute opacity-0 w-full h-full cursor-pointer',
  radio: 'w-5 h-5 border-2 rounded-full peer-checked:border-gray-900 peer-checked:border-8 transition-all',
  label: 'ml-3 text-sm font-medium text-gray-900 peer-checked:text-gray-900',
}

// Methods
function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'submitted':
      return 'green'
    case 'cancelled':
      return 'red'
    case 'final':
      return 'gray'
    default:
      return 'gray'
  }
}

function getPaymentStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'green'
    case 'partially paid':
      return 'yellow'
    case 'unpaid':
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
      return ['Final', 'Cancelled']
    case 'final':
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

const isPDF = computed(() => {
  const file = lpoResource.value?.doc?.final_lpo
  return file?.toLowerCase().endsWith('.pdf')
})

function handleDrop(event) {
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type === 'application/pdf') {
    event.currentTarget.classList.remove('border-gray-900')
    const input = document.querySelector('input[type="file"]')
    if (input) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  } else {
    statusError.value = 'Please upload a PDF file'
  }
}

function resetStatusDialog() {
  showStatusDialog.value = false
  newStatus.value = ''
  statusError.value = ''
  finalLPO.value = null
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

  if (newStatus.value === 'Final' && !uploadedResult.value?.file_url) {
    statusError.value = 'Please upload the final LPO document'
    return
  }

  try {
    isUpdatingStatus.value = true
    const updateData = {
      name: lpoResource.value.doc.name,
      status: newStatus.value,
    }

    if (newStatus.value === 'Final') {
      updateData.final_lpo = uploadedResult.value.file_url
    }

    if (newStatus.value === 'Cancelled') {
      updateData.remarks = remarks.value
    }

    await lpoResource.value.setValue.submit(updateData)
    await lpoResource.value.reload()
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
        doctype: 'RUA LPO',
        name: lpoResource.value.doc.name,
        format: 'Standard',
        no_letterhead: 0,
      }),
    })

    if (!response.ok) throw new Error('Failed to download PDF')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${lpoResource.value.doc.name}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
  }
}

function printLPO() {
  let baseUrl = window.location.origin

  if (window.location.hostname === 'localhost' && window.location.port === '8080') {
    baseUrl = `http://${window.location.hostname}:8000`
  }

  const url = `${baseUrl}/printview?doctype=RUA LPO&name=${lpoResource.value.doc.name}&format=Standard&no_letterhead=0&_lang=en`
  window.open(url, '_blank')
}

function initializeLPOResource() {
  if (route.params.lpoId) {
    lpoResource.value = createLPOResource(route.params.lpoId)
  }
}

// Initialize and watch resources
onMounted(() => {
  initializeLPOResource()
})

// Watch for route changes
watch(() => route.params.lpoId, (newId) => {
  if (newId) {
    lpoResource.value = createLPOResource(newId)
  }
})
</script>