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
          <Button
						:variant="'solid'"
						:ref_for="true"
						theme="gray"
						size="sm"
						icon="arrow-left"
						@click="
							router.push(
								`/project/${projectResource.doc.name}/invoicing/purchase-orders`,
							)
						"
					></Button>

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

          <Badge v-if="lpoResource.doc.all_items_received" variant="solid" theme="green">
                              Received
                            </Badge>
                            <Badge v-else variant="outline" theme="orange">
                              Pending Delivery
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
<div v-if="lpoResource.doc.status === 'Draft'" class="bg-orange-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="alert-triangle" class="h-5 w-5 text-orange-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-orange-800">
        {{ lpoResource.doc.status }} Purchase Order
      </h3>
      <div class="mt-2 text-sm text-orange-700">
        LPO is still in Draft status. Please submit to {{ lpoResource.doc.party }}.
      </div>
      <div class="mt-4">
        <Button variant="solid" size="sm" @click="showSubmitDialog = true">
          Mark as Submitted
        </Button>
      </div>
    </div>
  </div>
</div>

<div v-if="lpoResource.doc.status === 'Submitted'" class="bg-blue-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="info" class="h-5 w-5 text-blue-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-blue-800">
        {{ lpoResource.doc.status }} Purchase Order
      </h3>
      <div class="mt-2 text-sm text-blue-700">
        LPO submitted. Please await confirmation from {{ lpoResource.doc.party }}, then proceed to finalize.
      </div>
      <div class="mt-4 flex gap-3">
        <Button variant="solid" size="sm" @click="showFinalizeDialog = true">
          Finalize Purchase Order
        </Button>
      </div>
    </div>
  </div>
</div>

<div v-if="lpoResource.doc.status === 'Cancelled'" class="bg-red-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="x-circle" class="h-5 w-5 text-red-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">
        {{ lpoResource.doc.status }} Purchase Order
      </h3>
      <div class="mt-2 text-sm text-red-700">
        This purchase order has been cancelled and cannot be processed further.
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
<div class="bg-white rounded-lg border shadow-sm" v-if="linkedReceipts.length">
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
  <!-- Submit Dialog -->
<Dialog
  v-model="showSubmitDialog"
  :options="{
    title: 'Submit Purchase Order',
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
      Are you sure you want to submit this purchase order?
    </div>
  </template>
</Dialog>

<!-- Finalize Dialog -->
<Dialog
  v-model="showFinalizeDialog"
  :options="{
    title: 'Finalize Purchase Order',
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
        Please upload the<span class="font-bold text-red-500"> finalized LPO</span> to complete this process.
      </div>
      
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
                Upload Finalized Purchase Order
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
          </div>
        </div>
      </FileUploader>
      <div v-if="statusError" class="text-sm text-red-500">
        {{ statusError }}
      </div>
    </div>
  </template>
</Dialog>

<!-- Cancel Dialog -->
<Dialog
  v-model="showCancelDialog"
  :options="{
    title: 'Cancel Purchase Order',
    size: 'sm',
    actions: [{
      label: 'Cancel Purchase Order',
      variant: 'solid',
      theme: 'red',
      loading: isUpdatingStatus,
      onClick: () => updateStatus('Cancelled'),
      disabled: !remarks || isUpdatingStatus || linkedPayments.length > 0 || linkedReceipts.length > 0,
    }],
  }"
>
  <template #body-content>
    <div class="space-y-4" v-if="linkedPayments.length === 0 && linkedReceipts.length === 0">
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
      <p class="text-sm text-gray-600">You cannot cancel this LPO because it has linked payments.</p>
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
        title: 'Purchase Receipt',
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
const showSubmitDialog = ref(false)
const showFinalizeDialog = ref(false)
const showCancelDialog = ref(false)

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
    },
    {
			label: 'Cancel LPO',
			icon: 'x-circle',
			onClick: () => (showCancelDialog.value = true),
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
      label: 'Purchase Receipt',
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
      return 'blue'
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
    receiptError.value = error.message || 'Failed to create purchase receipt'
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

function resetDialogs() {
  showSubmitDialog.value = false
  showFinalizeDialog.value = false
  showCancelDialog.value = false
  statusError.value = ''
  finalLPO.value = null
  uploadedResult.value = null
  remarks.value = ''
}


async function updateStatus(status) {
  statusError.value = ''

  if (status === 'Cancelled' && !remarks.value.trim()) {
    statusError.value = 'Please provide cancellation remarks'
    return
  }

  if (status === 'Final' && !uploadedResult.value?.file_url) {
    statusError.value = 'Please upload the signed purchase order'
    return
  }

  // Check if the LPO has linked payments
  if (lpoResource.value?.doc?.payment_linked) {
    statusError.value = 'Cannot update status. This purchase order has linked payments'
    return
  }

  try {
    isUpdatingStatus.value = true
    const updateData = {
      name: lpoResource.value.doc.name,
      status: status,
    }

    if (status === 'Final') {
      updateData.final_lpo = uploadedResult.value.file_url
    }

    if (status === 'Cancelled') {
      updateData.remarks = remarks.value
    }

    await lpoResource.value.setValue.submit(updateData)
    await lpoResource.value.reload()
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