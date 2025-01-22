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
    <!-- Document Header -->
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
            <p class="text-sm text-gray-600 hidden md:inline">
              Created on {{ formatDate(lpoResource.doc.creation) }} by {{ lpoResource.doc.owner }}
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
      <!-- Summary Card -->
      <div class="bg-white rounded-lg border shadow-sm">
        <!-- Party Information -->
        <div class="p-6 border-b">
          <div class="flex items-start space-x-4">
            <!-- Party Image -->
            <div class="flex-shrink-0 align-center align-middle self-center">
              <Avatar
                v-if="partyData?.image"
                :image="partyData.image"
                size="3xl"
                shape="square"
              />
              <div v-else class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <FeatherIcon name="user" class="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <!-- Details Grid -->
            <div class="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-600">Party</label>
                <p class="mt-1 text-sm text-gray-900">{{ lpoResource.doc.party }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Type</label>
                <p class="mt-1 text-sm text-gray-900">{{ lpoResource.doc.type }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Reference Number</label>
                <p class="mt-1 text-sm text-gray-900">{{ lpoResource.doc.supplier_reference_number }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Date</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(lpoResource.doc.date, true) }}</p>
              </div>
              
              <!-- Show remarks if cancelled -->
              <div v-if="lpoResource.doc.status === 'Cancelled'" class="col-span-2">
                <label class="text-sm font-medium text-red-600">Cancellation Remarks</label>
                <p class="mt-1 text-sm text-red-600">{{ lpoResource.doc.remarks }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b">
          <div class="p-6">
            <label class="text-sm font-medium text-gray-600">Total Items</label>
            <div class="mt-2">
              <span class="text-2xl font-semibold text-gray-900">
                {{ lpoResource.doc.total_items }}
              </span>
            </div>
          </div>
          <div class="p-6">
            <label class="text-sm font-medium text-gray-600">Total Amount</label>
            <div class="mt-2">
              <span class="text-2xl font-semibold text-gray-900">
                {{ formatCurrency(lpoResource.doc.total_amount) }}
              </span>
            </div>
          </div>
          <div class="p-6">
            <label class="text-sm font-medium text-gray-600">Grand Total (Inc. VAT)</label>
            <div class="mt-2">
              <span class="text-2xl font-semibold text-gray-900">
                {{ formatCurrency(lpoResource.doc.grand_total) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="lpoResource.doc.modified_by" class="px-6 py-3 bg-gray-50 text-sm text-gray-600">
          Last modified: {{ formatDate(lpoResource.doc.modified) }} by {{ lpoResource.doc.modified_by }}
        </div>
      </div>

      <!-- Items Table -->
      <div class="bg-white rounded-lg border shadow-sm">
        <div class="px-6 py-4 border-b">
          <h2 class="text-lg font-medium text-gray-900">Items</h2>
        </div>
        <LPOItems 
          :items="lpoResource.doc.items"
          :type="lpoResource.doc.type"
          :status="lpoResource.doc.status"
          :lpo-name="lpoResource.doc.name"
        />
      </div>

      <!-- Purchase Receipts Card -->
<div class="bg-white rounded-lg border shadow-sm">
  <div class="px-6 py-4 border-b">
    <h2 class="text-lg font-medium text-gray-900">Purchase Receipts</h2>
  </div>
  <div class="divide-y">
    <template v-if="linkedReceipts.length">
      <div 
        v-for="receipt in linkedReceipts" 
        :key="receipt.name"
        class="px-6 py-4 hover:bg-gray-50 cursor-pointer"
        @click="router.push(`/project/${projectResource.doc.name}/invoicing/receipt/${receipt.name}`)"
      >
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="text-sm font-medium text-gray-900">{{ receipt.name }}</div>
            <div class="text-sm text-gray-600">
              Supplier Delivery Note: {{ receipt.supplier_delivery_note }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Badge
              :variant="receipt.status === 'Received' ? 'solid' : 'subtle'"
              :theme="getDeliveryStatusVariant(receipt.status)"
            >
              {{ receipt.status }}
            </Badge>
            <FeatherIcon name="chevron-right" class="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </template>
    <div v-else class="px-6 py-8 text-center text-sm text-gray-600">
      No purchase receipts found
    </div>
  </div>
</div>

<!-- Payments Card -->
<div class="bg-white rounded-lg border shadow-sm">
  <div class="px-6 py-4 border-b">
    <h2 class="text-lg font-medium text-gray-900">Related Payments</h2>
  </div>
  <div class="divide-y">
    <template v-if="linkedPayments.length">
      <div 
        v-for="payment in linkedPayments" 
        :key="payment.name"
        class="px-6 py-4 hover:bg-gray-50 cursor-pointer"
        @click="router.push(`/project/${projectResource.doc.name}/invoicing/payment/${payment.name}`)"
      >
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="text-sm font-medium text-gray-900">{{ payment.name }}</div>
            <div class="text-sm text-gray-600">
              Date: {{ formatDate(payment.date, true) }}
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-sm font-medium text-gray-900">
              {{ formatCurrency(payment.amount) }}
            </div>
            <FeatherIcon name="chevron-right" class="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </template>
    <div v-else class="px-6 py-8 text-center text-sm text-gray-600">
      No payments found
    </div>
  </div>
</div>

      <!-- Final LPO Document -->
      <div 
        v-if="lpoResource.doc.status === 'Final' && lpoResource.doc.final_lpo" 
        class="bg-white rounded-lg border shadow-sm"
      >
        <div class="flex items-center justify-between border-b px-6 py-4">
          <h2 class="text-lg font-medium text-gray-900">Final LPO Document</h2>
          <a 
            :href="lpoResource.doc.final_lpo" 
            target="_blank"
            rel="noopener noreferrer" 
            class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <FeatherIcon name="external-link" class="w-4 h-4" />
            <span>Open in New Tab</span>
          </a>
        </div>
        <div class="p-6">
          <iframe
            v-if="isPDF"
            :src="lpoResource.doc.final_lpo"
            class="w-full h-[600px] border rounded-lg"
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
        v-if="lpoResource.doc.payment_linked" 
        class="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg"
      >
        This LPO has linked payments and cannot be modified. You must first cancel all related payments before changing the LPO status.
      </div>

      <div v-else-if="!hasAvailableStatuses" class="text-sm text-gray-600 italic">
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
<!-- New Item Receipt Dialog -->
<Dialog
      v-model="showItemReceiptDialog"
      :options="{
        title: 'Create Item Receipt',
        size: 'sm',
        actions: [
          {
            label: 'Create',
            loading: isCreatingReceipt,
            variant: 'solid',
            onClick: createItemReceipt,
            disabled: !supplierDeliveryNote.trim() || isCreatingReceipt
          }
        ]
      }"
    >
      <template #body-content>
        <div class="space-y-4">
          <div>
            <label for="delivery-note" class="block text-sm font-medium text-gray-700">
              Supplier Delivery Note Reference
            </label>
            <input
              id="delivery-note"
              type="text"
              v-model="supplierDeliveryNote"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              placeholder="Enter reference number"
              :disabled="isCreatingReceipt"
            />
          </div>
          <div v-if="receiptError" class="text-sm text-red-600">
            {{ receiptError }}
          </div>
        </div>
      </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { partyResource } from '@/data/party'
import { paymentResource } from '@/data/payment'
import { purchaseReceiptResource } from '@/data/purchaseReceipt'
import {
  Button,
  Badge,
  FeatherIcon,
  Dropdown,
  Dialog,
  Avatar,
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
const showItemReceiptDialog = ref(false)
const supplierDeliveryNote = ref('')
const isCreatingReceipt = ref(false)
const receiptError = ref('')
const showCreatePaymentDialog = ref(false)

// Computed Properties
const partyData = computed(() => {
  return partyResource.data?.find(p => p.name === lpoResource.value?.doc?.party)
})

// Purchase Receipt State
const linkedReceipts = computed(() => {
  return purchaseReceiptResource.data?.filter(receipt => 
    receipt.purchase_order === lpoResource.value?.doc?.name &&
    receipt.status !== 'Cancelled'
  ) || []
})

const linkedPayments = computed(() => {
  return paymentResource.data?.filter(payment => 
    payment.related_docname === lpoResource.value?.doc?.name &&
    payment.status === 'Submitted'
  ) || []
})

const availableStatuses = computed(() => 
  getAvailableStatuses(
    lpoResource.value?.doc?.status,
    lpoResource.value?.doc?.payment_linked
  )
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

  if (doc.status === 'Final') {
    if (doc.payment_status !== 'Paid') {
      options.push({
        label: 'Create Payment',
        icon: 'credit-card',
        onClick: () => showCreatePaymentDialog.value = true
      })
    }
    if (doc.all_items_received == 0){
    options.push({
      label: 'Create Item Receipt',
      icon: 'clipboard',
      onClick: () => {
        showItemReceiptDialog.value = true
        supplierDeliveryNote.value = ''
        receiptError.value = ''
      }
    })
  }
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

function getDeliveryStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'received':
      return 'green'
    case 'draft':
      return 'orange'
    default:
      return 'red'
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
  // If payment is linked, only allow viewing the status
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

async function createItemReceipt() {
  if (!supplierDeliveryNote.value.trim()) {
    receiptError.value = 'Please enter a supplier delivery note reference'
    return
  }

  try {
    isCreatingReceipt.value = true
    receiptError.value = ''

    // Insert the new purchase receipt and capture its name
    const newReceipt = await purchaseReceiptResource.insert.submit({
      purchase_order: lpoResource.value.doc.name,
      supplier_delivery_note: supplierDeliveryNote.value.trim(),
      doctype: 'RUA Purchase Receipt'
    })

    // Route to the newly created item receipt
    router.push({
      path: `/project/${props.projectResource.doc.name}/invoicing/receipt/${newReceipt.name}`
    })

    // Close the dialog
    showItemReceiptDialog.value = false
    supplierDeliveryNote.value = ''
  } catch (error) {
    receiptError.value = error.message || 'Failed to create item receipt'
  } finally {
    isCreatingReceipt.value = false
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