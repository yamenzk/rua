# InvoiceDetails.vue
<template>
  <!-- Loading State -->
  <div v-if="!invoiceResource?.doc || invoiceResource?.loading" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else>
    <!-- Document Actions -->
    <div class="sticky top-0 z-10 bg-white border-b">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-4">
          <!-- Back Button -->
          <Button @click="router.push(`/project/${projectResource.doc.name}/invoicing/invoices`)">
            <template #prefix>
              <FeatherIcon name="arrow-left" class="w-4 h-4" />
            </template>
            <span class="hidden md:inline">Back to Invoices</span>
          </Button>

          <!-- Document Info -->
          <div class="flex flex-col">
            <h1 class="text-xl font-bold text-gray-900">
              {{ invoiceResource.doc.name }} <span v-if="invoiceResource.doc.serial_number">(#{{ invoiceResource.doc.serial_number }})</span>
            </h1>
            <p class="text-sm text-gray-600 hidden md:inline">
              Created on {{ formatDate(invoiceResource.doc.creation) }} by
              {{ invoiceResource.doc.owner }}
            </p>
          </div>
        </div>

        <!-- Status and Actions -->
        <div class="flex items-center gap-3">
          <!-- Document Status Badge -->
          <Badge
            :variant="invoiceResource.doc.status === 'Final' ? 'solid' : 'subtle'"
            :theme="getStatusVariant(invoiceResource.doc.status)"
            class="cursor-pointer"
            @click="showStatusDialog = true"
          >
            {{ invoiceResource.doc.status }}
          </Badge>

          <!-- Payment Status Badge (only for Tax Invoice) -->
          <Badge
            v-if="invoiceResource.doc.type === 'Tax Invoice' && invoiceResource.doc.status === 'Final'"
            :variant="getPaymentStatusVariant(invoiceResource.doc.payment_status) === 'gray' ? 'solid' : 'subtle'"
            :theme="getPaymentStatusVariant(invoiceResource.doc.payment_status)"
          >
            {{ invoiceResource.doc.payment_status }}
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
          <h2 class="text-xl font-semibold">Invoice Details</h2>
          <div class="text-sm text-gray-600 hidden md:inline">
            Last modified: {{ formatDate(invoiceResource.doc.modified) }} by
            {{ invoiceResource.doc.modified_by }}
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
                  :alt="invoiceResource.doc.party"
                  class="w-16 h-16 rounded-lg object-cover"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center"
                >
                  <FeatherIcon name="user" class="w-8 h-8 text-gray-400" />
                </div>
              </div>

              <!-- Party Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">
                      {{ invoiceResource.doc.party }}
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">
                      <span class="hidden md:inline">Invoice Date:</span>{{ formatDate(invoiceResource.doc.date, true) }}
                    </p>
                    <p class="mt-1 text-sm text-gray-500">
                      Type: {{ invoiceResource.doc.type }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Amount Information -->
          <div class="p-6">
            <div class="grid grid-cols-2 gap-6">
              <!-- Column 1 -->
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-600">Amount</label>
                  <div class="mt-1">
                    <span class="text-2xl font-semibold text-gray-900">
                      {{ formatCurrency(invoiceResource.doc.amount) }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Amount After Retention</label>
                  <div class="mt-1">
                    <span class="text-2xl font-semibold text-gray-900">
                      {{ formatCurrency(invoiceResource.doc.amount_after_retention) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Column 2 -->
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-600">VAT After Retention</label>
                  <div class="mt-1">
                    <span class="text-2xl font-semibold text-gray-900">
                      {{ formatCurrency(invoiceResource.doc.vat_after_retention) }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-600">Grand Total</label>
                  <div class="mt-1">
                    <span class="text-2xl font-semibold text-gray-900">
                      {{ formatCurrency(invoiceResource.doc.grand_total) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cancellation Notice -->
          <div
            v-if="invoiceResource.doc.status === 'Cancelled'"
            class="p-6 bg-red-50 border-t"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <FeatherIcon name="alert-circle" class="w-5 h-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Cancellation Remarks</h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ invoiceResource.doc.remarks }}
                </div>
              </div>
            </div>
          </div>

          <!-- Invoice Preview -->
          <div
            v-if="invoiceResource.doc.status === 'Final' && invoiceResource.doc.invoice_file"
            class="border-t"
          >
            <div class="p-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">Invoice Document</h3>
              <iframe
                v-if="isPDF"
                :src="invoiceResource.doc.invoice_file"
                class="w-full h-[1200px] border rounded-lg"
                frameborder="0"
              ></iframe>
              <div v-else class="text-center py-8">
                <a 
                  :href="invoiceResource.doc.invoice_file" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  class="text-gray-600 hover:text-gray-800"
                >
                  <FeatherIcon name="download" class="w-8 h-8 mx-auto mb-2" />
                  <span>Download Invoice File</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        {{ hasAvailableStatuses ? 'Change Status' : 'Status' }}
      </label>

      <div 
        v-if="invoiceResource.doc.payment_linked" 
        class="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg"
      >
        This invoice has linked payments and cannot be modified. You must first cancel all related payments before changing the invoice status.
      </div>

      <div v-else-if="!hasAvailableStatuses" class="text-sm text-gray-600 italic">
        {{ invoiceResource.doc.remarks }}
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

          <!-- Invoice File Upload -->
          <div v-if="newStatus === 'Final'" class="space-y-4">
            <div class="text-sm font-medium text-gray-700">Invoice File</div>
            <FileUploader
              v-model="invoiceFile"
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
                @drop.prevent="handleDrop($event, openFileSelector)"
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
                        @click.stop="invoiceFile = null"
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

          <!-- Status Update Error -->
          <div v-if="statusError" class="text-sm text-red-500 mt-1">
            {{ statusError }}
          </div>
        </div>
      </div>
    </template>
  </Dialog>
  <CreatePaymentDialog
  v-if="invoiceResource?.doc"
  v-model="showCreatePaymentDialog"
  :source-doc="invoiceResource.doc"
  source-type="RUA Invoice"
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
  Tooltip,
  Dropdown,
  Dialog,
  Textarea,
  FileUploader,
  LoadingIndicator
} from 'frappe-ui'
import { formatDate, formatCurrency } from '@/utils/format'
import { createInvoiceResource } from '@/data/invoice'
import CreatePaymentDialog from './CreatePaymentDialog.vue'

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
const invoiceResource = ref(null)
const showStatusDialog = ref(false)
const newStatus = ref('')
const statusError = ref('')
const invoiceFile = ref(null)
const uploadedResult = ref(null)
const isUpdatingStatus = ref(false)
const remarks = ref('')
const showCreatePaymentDialog = ref(false)

// Computed Properties
const partyData = computed(() => {
  return partyResource.data?.find(p => p.name === invoiceResource.value?.doc?.party)
})

const isPDF = computed(() => {
  const file = invoiceResource.value?.doc?.invoice_file
  return file?.toLowerCase().endsWith('.pdf')
})

const availableStatuses = computed(() => 
  getAvailableStatuses(
    invoiceResource.value?.doc?.status,
    invoiceResource.value?.doc?.payment_linked
  )
)

const hasAvailableStatuses = computed(() => 
  availableStatuses.value.length > 0
)

const actionDropdownOptions = computed(() => {
  const doc = invoiceResource.value?.doc
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
      onClick: printInvoice
    }
  ]

  // Only show create payment option for Final Tax Invoices that aren't fully paid
  if (doc.status === 'Final' && 
      doc.type === 'Tax Invoice' && 
      doc.payment_status !== 'Paid') {
    options.push({
      label: 'Create Payment',
      icon: 'credit-card',
      onClick: () => showCreatePaymentDialog.value = true
    })
  }

  return options
})

const statusDialogOptions = computed(() => ({
  title: hasAvailableStatuses.value ? 'Update Invoice Status' : 'Invoice Status',
  size: 'sm',
  actions: hasAvailableStatuses.value ? [
    {
      label: 'Update Status',
      variant: 'solid',
      loading: isUpdatingStatus.value,
      disabled: newStatus.value === 'Final' && !uploadedResult.value?.file_url,
      onClick: updateStatus
    }
  ] : []
}))

const uploadArgs = computed(() => ({
  doctype: 'RUA Invoice',
  docname: invoiceResource.value?.doc?.name,
  fieldname: 'invoice_file',
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
      return 'green'
    case 'final':
      return 'gray'
    case 'cancelled':
      return 'red'
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

function getAvailableStatuses(currentStatus, paymentLinked) {
  // If payment is linked, prevent status changes
  if (paymentLinked) {
    return []
  }

  // Regular status flow if no payments are linked
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
  invoiceFile.value = null
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
    statusError.value = 'Please upload the invoice file'
    return
  }

  try {
    isUpdatingStatus.value = true
    const updateData = {
      name: invoiceResource.value.doc.name,
      status: newStatus.value,
    }

    if (newStatus.value === 'Final') {
      updateData.invoice_file = uploadedResult.value.file_url
    }

    if (newStatus.value === 'Cancelled') {
      updateData.remarks = remarks.value
    }

    await invoiceResource.value.setValue.submit(updateData)
    await invoiceResource.value.reload()
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
        doctype: 'RUA Invoice',
        name: invoiceResource.value.doc.name,
        format: 'Standard',
        no_letterhead: 0,
      }),
    })

    if (!response.ok) throw new Error('Failed to download PDF')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoiceResource.value.doc.name}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
  }
}

function printInvoice() {
  let baseUrl = window.location.origin

  if (window.location.hostname === 'localhost' && window.location.port === '8080') {
    baseUrl = `http://${window.location.hostname}:8000`
  }

  const url = `${baseUrl}/printview?doctype=RUA Invoice&name=${invoiceResource.value.doc.name}&format=Standard&no_letterhead=0&_lang=en`
  window.open(url, '_blank')
}

// Initialize and watch resources
onMounted(() => {
  initializeInvoiceResource()
})

function initializeInvoiceResource() {
  if (route.params.invoiceId) {
    invoiceResource.value = createInvoiceResource(route.params.invoiceId)
  }
}

// Watch for route changes
watch(() => route.params.invoiceId, (newId) => {
  if (newId) {
    invoiceResource.value = createInvoiceResource(newId)
  }
})
</script>