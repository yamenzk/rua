# InvoiceDetails.vue
<template>
  <!-- Loading State -->
  <div v-if="!invoiceResource?.doc || invoiceResource?.loading" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else-if="invoiceResource.error" class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <FeatherIcon name="alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p class="text-gray-600">Failed to load invoice details</p>
    </div>
  </div>

  <div v-else>
    <!-- Document Header -->
    <div class="sticky top-0 z-10 bg-white border-b">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-4">
          <!-- Back Button -->
          <Button
						:variant="'solid'"
						:ref_for="true"
						theme="gray"
						size="sm"
						icon="arrow-left"
						@click="
							router.push(
								`/project/${projectResource.doc.name}/invoicing/invoices`,
							)
						"
					></Button>

          <!-- Document Info -->
          <div class="flex flex-col">
            <h1 class="text-xl font-bold text-gray-900">
              {{ invoiceResource.doc.name }} 
              <span v-if="invoiceResource.doc.serial_number" class="text-gray-600">(#{{ invoiceResource.doc.serial_number }})</span>
            </h1>
            <p class="text-sm text-gray-600 hidden md:inline">
              Created on {{ formatDate(invoiceResource.doc.creation) }} by {{ invoiceResource.doc.owner }}
            </p>
          </div>
        </div>

        <!-- Status and Actions -->
        <div class="flex items-center gap-3">
          <!-- Document Status Badge -->
          <Badge
            :variant="invoiceResource.doc.status === 'Final' ? 'solid' : 'subtle'"
            :theme="getStatusVariant(invoiceResource.doc.status)"
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

    <!-- Add these status banners after the header section -->
<div v-if="invoiceResource.doc.status === 'Draft'" class="bg-orange-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="alert-triangle" class="h-5 w-5 text-orange-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-orange-800">
        {{ invoiceResource.doc.status }} Invoice
      </h3>
      <div class="mt-2 text-sm text-orange-700">
        Invoice is still in Draft status. Please submit to {{ invoiceResource.doc.party }}.
      </div>
      <div class="mt-4">
        <Button variant="solid" size="sm" @click="showSubmitDialog = true">
          Mark as Submitted
        </Button>
      </div>
    </div>
  </div>
</div>

<div v-if="invoiceResource.doc.status === 'Submitted'" class="bg-blue-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="info" class="h-5 w-5 text-blue-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-blue-800">
        {{ invoiceResource.doc.status }} Invoice
      </h3>
      <div class="mt-2 text-sm text-blue-700">
        Invoice submitted to {{ invoiceResource.doc.party }}. Please request their signature to finalize. For any adjustments, kindly cancel this invoice and create a new one.
      </div>
      <div class="mt-4 flex gap-3">
        <Button variant="solid" size="sm" @click="showFinalizeDialog = true">
          Finalize Invoice
        </Button>
        <Button variant="solid" theme="red" size="sm" @click="showCancelDialog = true">
          Cancel
        </Button>
      </div>
    </div>
  </div>
</div>

<div v-if="invoiceResource.doc.status === 'Cancelled'" class="bg-red-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="x-circle" class="h-5 w-5 text-red-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">
        {{ invoiceResource.doc.status }} Invoice
      </h3>
      <div class="mt-2 text-sm text-red-700">
        This invoice has been cancelled and cannot be processed further.
      </div>
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
                <p class="mt-1 text-sm text-gray-900">{{ invoiceResource.doc.party }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Type</label>
                <p class="mt-1 text-sm text-gray-900">{{ invoiceResource.doc.type }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Invoice Number</label>
                <p class="mt-1 text-sm text-gray-900">{{ invoiceResource.doc.serial_number || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Date</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(invoiceResource.doc.date) }}</p>
              </div>
              
              <!-- Show remarks if cancelled -->
              <div v-if="invoiceResource.doc.status === 'Cancelled'" class="col-span-2">
                <label class="text-sm font-medium text-red-600">Cancellation Remarks</label>
                <p class="mt-1 text-sm text-red-600">{{ invoiceResource.doc.remarks }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Amount Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
          <!-- Left Column -->
          <div class="p-6 space-y-6">
            <div>
              <label class="text-sm font-medium text-gray-600">Amount</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(invoiceResource.doc.amount) }}
                </span>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Amount After Retention</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(invoiceResource.doc.amount_after_retention) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="p-6 space-y-6">
            <div>
              <label class="text-sm font-medium text-gray-600">VAT After Retention</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(invoiceResource.doc.vat_after_retention) }}
                </span>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Grand Total</label>
              <div class="mt-2">
                <span class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(invoiceResource.doc.grand_total) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="invoiceResource.doc.modified_by" class="px-6 py-3 bg-gray-50 text-sm text-gray-600">
          Last modified: {{ formatDate(invoiceResource.doc.modified, DATE_FORMATS.FULL_DATE_TIME) }} by {{ invoiceResource.doc.modified_by }}
        </div>
      </div>

      <!-- Payments Card -->
<div class="bg-white rounded-lg border shadow-sm" v-if="linkedPayments.length">
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
              Date: {{ formatDate(payment.date) }}
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

      <!-- Invoice Document -->
      <div 
        v-if="invoiceResource.doc.status === 'Final' && invoiceResource.doc.invoice_file" 
        class="bg-white rounded-lg border shadow-sm"
      >
        <div class="flex items-center justify-between border-b px-6 py-4">
          <h2 class="text-lg font-medium text-gray-900">Invoice Document</h2>
          <a 
            :href="invoiceResource.doc.invoice_file" 
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
            :src="invoiceResource.doc.invoice_file"
            class="w-full h-[600px] border rounded-lg"
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

  <!-- Status Update Dialog -->
<!-- Submit Dialog -->
<Dialog
  v-model="showSubmitDialog"
  :options="{
    title: 'Submit Invoice',
    size: 'sm',
    actions: [{
      label: 'Submit',
      variant: 'solid',
      loading: isUpdatingStatus,
      onClick: () => updateStatus('Submitted'),
    }],
  }"
>
  <template #body-content>
    <div class="text-sm text-gray-600">
      Are you sure you want to submit this invoice?
    </div>
  </template>
</Dialog>

<!-- Finalize Dialog -->
<Dialog
  v-model="showFinalizeDialog"
  :options="{
    title: 'Finalize Invoice',
    size: 'sm',
    actions: [{
      label: 'Finalize',
      variant: 'solid',
      loading: isUpdatingStatus,
      onClick: () => updateStatus('Final'),
      disabled: !uploadedResult?.file_url || isUpdatingStatus,
    }],
  }"
>
  <template #body-content>
    <div class="space-y-4">
      <div class="text-sm text-gray-600">
        Please upload the invoice <span class="font-bold text-red-500">signed by {{ invoiceResource.doc.party }}</span> to complete this process.
      </div>
      
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
          @drop.prevent="handleFileDrop($event, openFileSelector)"
          @dragenter.prevent
        >
        <div class="flex flex-col items-center justify-center space-y-2">
            <div v-if="!file" class="flex flex-col items-center justify-center">
              <FeatherIcon
                name="upload-cloud"
                class="w-8 h-8 text-gray-400 mx-auto mb-2"
              />
              <div class="text-sm font-medium text-gray-900">
                Upload Signed Invoice
              </div>
              <div class="text-xs text-gray-500">PDF files up to 5MB</div>
            </div>
            <div v-else class="w-full">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <FeatherIcon name="file" class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-900 truncate max-w-[90%]">{{ file.name }}</span>
                </div>
                <button
                  v-if="!uploading"
                  class="text-sm text-red-500 hover:text-red-700"
                  @click.stop="signedDocument = null"
                >
                  X
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
    </div>
  </template>
</Dialog>

<!-- Cancel Dialog -->
<Dialog
  v-model="showCancelDialog"
  :options="{
    title: 'Cancel Invoice',
    size: 'sm',
    actions: [{
      label: 'Cancel Invoice',
      variant: 'solid',
      theme: 'red',
      loading: isUpdatingStatus,
      onClick: () => updateStatus('Cancelled'),
      disabled: !remarks || isUpdatingStatus || linkedPayments.length > 0,
    }],
  }"
>
  <template #body-content>
    <div class="space-y-4" v-if="linkedPayments.length === 0">
      <Textarea
        v-model="remarks"
        label="Cancellation Remarks"
        placeholder="Please provide a reason for cancellation"
        variant="outline"
        size="sm"
        class="w-full"
      />
      <div v-if="statusError" class="text-sm text-red-500">
        {{ statusError }}
      </div>
    </div>
    <div v-else>
      <p class="text-sm text-gray-600">You cannot cancel this invoice because it has linked payments.</p>
    </div>
  </template>
</Dialog>
<CreatePaymentDialog
  v-if="invoiceResource?.doc"
  v-model="showCreatePaymentDialog"
  :source-doc="invoiceResource.doc"
  :paid-amount="totalPaidAmount"
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
  Dropdown,
  Dialog,
  Avatar,
  Textarea,
  FileUploader,
  LoadingIndicator
} from 'frappe-ui'
import { formatDate, formatCurrency, DATE_FORMATS } from '@/utils/format'
import { createInvoiceResource } from '@/data/invoice'
import CreatePaymentDialog from './CreatePaymentDialog.vue'
import { paymentResource } from '@/data/payment'

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
const statusError = ref('')
const invoiceFile = ref(null)
const uploadedResult = ref(null)
const isUpdatingStatus = ref(false)
const remarks = ref('')
const showCreatePaymentDialog = ref(false)
const showSubmitDialog = ref(false)
const showFinalizeDialog = ref(false)
const showCancelDialog = ref(false)
const totalPaidAmount = computed(() => {
  return linkedPayments.value.reduce((sum, payment) => sum + payment.amount, 0)
})

// Computed Properties
const partyData = computed(() => {
  return partyResource.data?.find(p => p.name === invoiceResource.value?.doc?.party)
})

const isPDF = computed(() => {
  const file = invoiceResource.value?.doc?.invoice_file
  return file?.toLowerCase().endsWith('.pdf')
})

const linkedPayments = computed(() => {
  return paymentResource.data?.filter(payment => 
    payment.related_docname === invoiceResource.value?.doc?.name &&
    payment.status === 'Submitted'
  ) || []
})

function handleFileDrop(event, openFileSelector) {
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
    },
    {
			label: 'Cancel Invoice',
			icon: 'x-circle',
			onClick: () => (showCancelDialog.value = true),
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

const uploadArgs = computed(() => ({
  doctype: 'RUA Invoice',
  docname: invoiceResource.value?.doc?.name,
  fieldname: 'invoice_file',
  private: true
}))


// Methods
function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'submitted':
      return 'blue'
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

function resetDialogs() {
  showSubmitDialog.value = false
  showFinalizeDialog.value = false
  showCancelDialog.value = false
  statusError.value = ''
  invoiceFile.value = null
  uploadedResult.value = null
  remarks.value = ''
}

// Update the status update function
async function updateStatus(status) {
  statusError.value = ''

  if (status === 'Cancelled' && !remarks.value.trim()) {
    statusError.value = 'Please provide cancellation remarks'
    return
  }

  if (status === 'Final' && !uploadedResult.value?.file_url) {
    statusError.value = 'Please upload the signed invoice'
    return
  }

  try {
    isUpdatingStatus.value = true
    const updateData = {
      name: invoiceResource.value.doc.name,
      status: status,
    }

    if (status === 'Final') {
      updateData.invoice_file = uploadedResult.value.file_url
    }

    if (status === 'Cancelled') {
      updateData.remarks = remarks.value
    }

    await invoiceResource.value.setValue.submit(updateData)
    await invoiceResource.value.reload()
    resetDialogs()
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