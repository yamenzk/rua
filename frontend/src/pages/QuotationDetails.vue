# QuotationDetails.vue
<template>
  <!-- Loading State -->
  <div v-if="!quotationResource?.doc || quotationResource?.loading" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else>
    <!-- Document Actions -->
    <div class="sticky top-0 z-10 bg-white border-b">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-4">
          <!-- Back Button -->
          <Button @click="router.push(`/project/${projectResource.doc.name}/documents/quotations`)">
            <template #prefix>
              <FeatherIcon name="arrow-left" class="w-4 h-4" />
            </template>
            <span class="hidden md:inline">Back to Quotations</span>
          </Button>

          <!-- Document Info -->
          <div class="flex flex-col">
            <h1 class="text-xl font-bold text-gray-900">
              {{ quotationResource.doc.name }}
            </h1>
            <p class="text-sm text-gray-600">
              Created on {{ formatDate(quotationResource.doc.creation) }} by
              {{ quotationResource.doc.owner }}
            </p>
          </div>
        </div>

        <!-- Status and Actions -->
        <div class="flex items-center gap-3">
          <!-- Status Badge -->
          <Badge
            :variant="quotationResource.doc.status === 'Final' ? 'solid' : 'subtle'"
            :theme="getStatusVariant(quotationResource.doc.status)"
            class="cursor-pointer"
            @click="showStatusDialog = true"
          >
            {{ quotationResource.doc.status }}
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
          <h2 class="text-xl font-semibold">Quotation Details</h2>
          <div class="text-sm text-gray-600">
            Last modified: {{ formatDate(quotationResource.doc.modified) }} by
            {{ quotationResource.doc.modified_by }}
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
                  :alt="quotationResource.doc.party"
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
                      {{ quotationResource.doc.party }}
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">
                      Quotation Date:
                      {{ formatDate(quotationResource.doc.date, true) }}
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
                  {{ quotationResource.doc.total_items }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <label class="text-sm font-medium text-gray-600">Net Total</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(quotationResource.doc.total) }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <label class="text-sm font-medium text-gray-600">Grand Total</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(quotationResource.doc.grand_total) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Rejection Notice -->
          <div
            v-if="quotationResource.doc.status === 'Rejected'"
            class="p-6 bg-red-50 border-t"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <FeatherIcon name="alert-circle" class="w-5 h-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Rejection Reason</h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ quotationResource.doc.reject_reason }}
                </div>
              </div>
            </div>
          </div>

          <!-- Signed Document Preview -->
          <div
            v-if="quotationResource.doc.status === 'Final' && quotationResource.doc.signed_document"
            class="border-t"
          >
          <div class="p-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">Signed Quotation</h3>
              <iframe
                v-if="isPDF"
                :src="quotationResource.doc.signed_document"
                class="w-full h-[1200px] border rounded-lg"
                frameborder="0"
              ></iframe>
              <div v-else class="text-center py-8">
                <a 
                  :href="quotationResource.doc.signed_document" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  class="text-gray-600 hover:text-gray-800"
                >
                  <FeatherIcon name="download" class="w-8 h-8 mx-auto mb-2" />
                  <span>Download Signed Quotation</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items List -->
      <QuotationItems 
        :items="quotationResource.doc.items"
        :totals="{
          net: quotationResource.doc.total,
          vat: quotationResource.doc.vat_amount,
          grand: quotationResource.doc.grand_total
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
            {{ hasAvailableStatuses ? 'Change Status' : 'Status' }}
          </label>

          <div v-if="!hasAvailableStatuses" class="text-sm text-gray-600 italic">
            Reason: {{ quotationResource.doc.reject_reason }}.
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

          <!-- Rejection Reason -->
          <div v-if="newStatus === 'Rejected'" class="mt-4">
            <Textarea
              v-model="rejectReason"
              label="Rejection Reason"
              placeholder="Please provide a reason for rejection"
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

        <!-- Signed Document Upload -->
        <div v-if="newStatus === 'Final'" class="space-y-4">
          <div class="text-sm font-medium text-gray-700">Signed Document</div>
          <FileUploader
            v-model="signedDocument"
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
                      @click.stop="signedDocument = null"
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
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createDocumentResource } from 'frappe-ui'
import {
  Button,
  Badge,
  FeatherIcon,
  Tooltip,
  Dropdown,
  Dialog,
  FormControl,
  Textarea,
  FileUploader,
  LoadingIndicator
} from 'frappe-ui'
import { inject } from 'vue'
import { partyResource } from '@/data/party'
import QuotationItems from './QuotationItems.vue'
import { formatDate, formatCurrency, formatNumber } from '@/utils/format'

const $socket = inject('$socket')
const props = defineProps({
  projectResource: { 
    type: Object,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const isPDF = computed(() => {
  const file = quotationResource.value?.doc?.signed_document
  return file?.toLowerCase().endsWith('.pdf')
})

// State Management
const quotationResource = ref(null)
const showStatusDialog = ref(false)
const newStatus = ref('')
const statusError = ref('')
const signedDocument = ref(null)
const uploadedResult = ref(null)
const isUpdatingStatus = ref(false)
const rejectReason = ref('')

// Computed Properties
const partyData = computed(() => {
  return partyResource.data?.find(p => p.name === quotationResource.value?.doc?.party)
})

const availableStatuses = computed(() => 
  getAvailableStatuses(quotationResource.value?.doc?.status)
)

const hasAvailableStatuses = computed(() => 
  availableStatuses.value.length > 0
)

const actionDropdownOptions = computed(() => [
  {
    label: 'Download PDF',
    icon: 'file-text',
    onClick: downloadPDF
  },
  {
    label: 'Print',
    icon: 'printer',
    onClick: printQuotation
  }
])

const statusDialogOptions = computed(() => ({
  title: hasAvailableStatuses.value ? 'Update Quotation Status' : 'Quotation Status',
  size: 'sm',
  actions: hasAvailableStatuses.value ? [
    {
      label: 'Update Status',
      loading: isUpdatingStatus.value,
      variant: 'solid',
      onClick: updateStatus
    }
  ] : []
}))

const uploadArgs = computed(() => ({
  doctype: 'RUA Quotation',
  docname: quotationResource.value?.doc?.name,
  fieldname: 'signed_document',
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
    case 'rejected':
      return 'red'
    case 'final':
      return 'gray'
    default:
      return 'gray'
  }
}

function getAvailableStatuses(currentStatus) {
  switch (currentStatus?.toLowerCase()) {
    case 'draft':
      return ['Submitted']
    case 'submitted':
      return ['Final', 'Rejected']
    case 'final':
      return ['Rejected']
    case 'rejected':
      return [] // No transitions allowed from rejected
    default:
      return []
  }
}

function handleUploadSuccess(result) {
  uploadedResult.value = result
}

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
  } else if (file) {
    statusError.value = 'Please upload a PDF file'
  }
}

function resetStatusDialog() {
  showStatusDialog.value = false
  newStatus.value = ''
  statusError.value = ''
  signedDocument.value = null
  uploadedResult.value = null
  rejectReason.value = ''
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

  if (newStatus.value === 'Rejected' && !rejectReason.value.trim()) {
    statusError.value = 'Please provide a rejection reason'
    return
  }

  if (newStatus.value === 'Final' && !uploadedResult.value?.file_url) {
    statusError.value = 'Please upload the signed document'
    return
  }

  try {
    isUpdatingStatus.value = true
    const updateData = {
      name: quotationResource.value.doc.name,
      status: newStatus.value,
    }

    if (newStatus.value === 'Final') {
      updateData.signed_document = uploadedResult.value.file_url
    }

    if (newStatus.value === 'Rejected') {
      updateData.reject_reason = rejectReason.value
    }

    await quotationResource.value.setValue.submit(updateData)
    await quotationResource.value.reload()
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
        doctype: 'RUA Quotation',
        name: quotationResource.value.doc.name,
        format: 'Standard',
        no_letterhead: 0,
      }),
    })

    if (!response.ok) throw new Error('Failed to download PDF')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quotationResource.value.doc.name}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
  }
}

function printQuotation() {
  let baseUrl = window.location.origin

  if (window.location.hostname === 'localhost' && window.location.port === '8080') {
    baseUrl = `http://${window.location.hostname}:8000`
  }

  const url = `${baseUrl}/printview?doctype=RUA Quotation&name=${quotationResource.value.doc.name}&format=Standard&no_letterhead=0&_lang=en`
  window.open(url, '_blank')
}

// Initialize and watch resources
onMounted(() => {
  if (route.params.quotationId) {
    quotationResource.value = createDocumentResource({
      doctype: 'RUA Quotation',
      name: route.params.quotationId,
      auto: true
    })
  }
})

// Watch for route changes
watch(() => route.params.quotationId, (newId) => {
  if (newId) {
    quotationResource.value = createDocumentResource({
      doctype: 'RUA Quotation', 
      name: newId,
      auto: true
    })
  }
})

</script>