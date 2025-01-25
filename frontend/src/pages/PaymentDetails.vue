# PaymentDetails.vue
<template>
  <!-- Loading State -->
  <div v-if="!paymentResource?.doc || paymentResource?.loading" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else-if="paymentResource.error" class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <FeatherIcon name="alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p class="text-gray-600">Failed to load payment details</p>
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
								`/project/${projectResource.doc.name}/invoicing/payments`,
							)
						"
					></Button>

          <!-- Document Info -->
          <div class="flex flex-col">
            <h1 class="text-xl font-bold text-gray-900">
              {{ paymentResource.doc.name }}
            </h1>
            <p class="text-sm text-gray-600 hidden md:inline">
              Created on {{ formatDate(paymentResource.doc.creation) }} by {{ paymentResource.doc.owner }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
        <!-- Status Badge -->
        <Badge
          :variant="paymentResource.doc.status === 'Final' ? 'solid' : 'subtle'"
          :theme="getStatusVariant(paymentResource.doc.status)"
        >
          {{ paymentResource.doc.status }}
        </Badge>
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

    <!-- Draft Status Banner - Update text -->
<div v-if="paymentResource.doc.status === 'Draft'" class="bg-orange-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="alert-triangle" class="h-5 w-5 text-orange-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-orange-800">
        {{ paymentResource.doc.status }} Payment
      </h3>
      <div class="mt-2 text-sm text-orange-700">
        This payment needs to be submitted to be processed.
      </div>
      <div class="mt-4">
        <Button variant="solid" size="sm" @click="showSubmitDialog = true">
          Submit Payment
        </Button>
      </div>
    </div>
  </div>
</div>

<!-- Submitted Status Banner - Add new -->
<div v-if="paymentResource.doc.status === 'Submitted'" class="bg-green-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="info" class="h-5 w-5 text-green-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-green-800">
        {{ paymentResource.doc.status }} Payment
      </h3>
      <div class="mt-2 text-sm text-green-700">
        This payment has been submitted and recorded in the system.
      </div>
    </div>
  </div>
</div>

<!-- Cancelled Status Banner - Update text -->
<div v-if="paymentResource.doc.status === 'Cancelled'" class="bg-red-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="x-circle" class="h-5 w-5 text-red-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">
        {{ paymentResource.doc.status }} Payment
      </h3>
      <div class="mt-2 text-sm text-red-700">
        This payment has been cancelled and cannot be processed further.
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
                <p class="mt-1 text-sm text-gray-900">{{ paymentResource.doc.party }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Type</label>
                <p class="mt-1 text-sm text-gray-900">{{ paymentResource.doc.type }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Bank</label>
                <p class="mt-1 text-sm text-gray-900">{{ paymentResource.doc.bank || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Date</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(paymentResource.doc.date) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Amount Information -->
        <div class="px-6 py-8 border-b">
          <label class="text-sm font-medium text-gray-600">Amount</label>
          <div class="mt-2">
            <span class="text-3xl font-semibold text-gray-900">
              {{ formatCurrency(paymentResource.doc.amount) }}
            </span>
          </div>
          <div v-if="paymentResource.doc.claim_date && paymentResource.doc.claim_date !== paymentResource.doc.date" class="mt-4">
                <label class="text-sm font-medium text-gray-600">Claim Date</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(paymentResource.doc.claim_date) }}</p>
              </div>
        </div>

        <!-- Additional Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
          <!-- Related Document -->
          <div class="p-6">
            <label class="text-sm font-medium text-gray-600">Related Document</label>
            <div class="mt-2">
              <Button 
                v-if="paymentResource.doc.related_doctype && paymentResource.doc.related_docname"
                variant="link"
                @click="navigateToRelatedDoc"
                class="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <span class="flex items-center"><FeatherIcon :name="relatedDocIcon" class="w-4 h-4" />{{ relatedDocLabel }}</span>
              </Button>
              <span v-else class="text-sm text-gray-500">No related document</span>
            </div>
          </div>

          <!-- Reference Number -->
          <div class="p-6">
            <label class="text-sm font-medium text-gray-600">Reference Number</label>
            <div class="mt-2">
              <span class="text-sm text-gray-900">
                {{ paymentResource.doc.reference_no || '-' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Remarks -->
        <div v-if="paymentResource.doc.remarks && paymentResource.doc.status !== 'Cancelled'" class="p-6 border-b">
          <label class="text-sm font-medium text-gray-600">Remarks</label>
          <div class="mt-2 text-sm text-gray-900">
            {{ paymentResource.doc.remarks }}
          </div>
        </div>

        <!-- Cancellation Notice -->
        <div
          v-if="paymentResource.doc.status === 'Cancelled'"
          class="p-6 bg-red-50"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <FeatherIcon name="alert-circle" class="w-5 h-5 text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Cancellation Remarks</h3>
              <div class="mt-2 text-sm text-red-700">
                {{ paymentResource.doc.remarks }}
              </div>
            </div>
          </div>
        </div>

        <!-- Last Modified -->
        <div v-if="paymentResource.doc.modified_by" class="px-6 py-3 bg-gray-50 text-sm text-gray-600">
          Last modified: {{ formatDate(paymentResource.doc.modified,  DATE_FORMATS.FULL_DATE_TIME) }} by {{ paymentResource.doc.modified_by }}
        </div>
      </div>

      <!-- Payment Attachment -->
<div 
  v-if="paymentResource.doc.attach_payment" 
  class="bg-white rounded-lg border shadow-sm"
>
  <div class="flex items-center justify-between border-b px-6 py-4">
    <h2 class="text-lg font-medium text-gray-900">Payment Attachment</h2>
    <a 
      :href="paymentResource.doc.attach_payment" 
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
      v-if="isAttachmentViewable"
      :src="paymentResource.doc.attach_payment"
      class="w-full h-[600px] border rounded-lg"
      frameborder="0"
    ></iframe>
    <div v-else class="text-center py-8">
      <a 
        :href="paymentResource.doc.attach_payment" 
        target="_blank"
        rel="noopener noreferrer" 
        class="text-gray-600 hover:text-gray-800"
      >
        <FeatherIcon name="download" class="w-8 h-8 mx-auto mb-2" />
        <span>Download Attachment</span>
      </a>
    </div>
  </div>
</div>
    </div>
  </div>


  <!-- Attachment Upload Dialog -->
<Dialog
  v-model="showAttachDialog"
  :options="{
    title: 'Upload Payment Attachment',
    size: 'sm',
    actions: [{
      label: 'Upload',
      variant: 'solid',
      loading: isUploading,
      onClick: updateAttachment,
      disabled: !uploadedResult?.file_url || isUploading,
    }],
  }"
>
  <template #body-content>
    <div class="space-y-4">
      <div class="text-sm text-gray-600">
        Please upload the payment attachment (e.g., payment receipt, bank statement).
      </div>
      
      <FileUploader
        v-model="attachmentFile"
        :accept="['application/pdf', 'image/*']"
        :max-size="5000000"
        :upload-args="attachmentUploadArgs"
        @success="handleAttachmentUpload"
        v-slot="{ openFileSelector, file, uploading, progress, error }"
      >
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-900 transition-colors cursor-pointer"
          @click="openFileSelector"
          @dragover.prevent="$event.currentTarget.classList.add('border-gray-900')"
          @dragleave.prevent="$event.currentTarget.classList.remove('border-gray-900')"
          @drop.prevent="handleAttachmentDrop($event, openFileSelector)"
          @dragenter.prevent
        >
          <div class="flex flex-col items-center justify-center space-y-2">
            <div v-if="!file">
              <FeatherIcon
                name="upload-cloud"
                class="w-8 h-8 text-gray-400 mx-auto mb-2"
              />
              <div class="text-sm font-medium text-gray-900">
                Upload Payment Attachment
              </div>
              <div class="text-xs text-gray-500">PDF or Image files up to 5MB</div>
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
                  @click.stop="attachmentFile = null"
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

  <!-- Submit Dialog -->
<Dialog
  v-model="showSubmitDialog"
  :options="{
    title: 'Submit Payment',
    size: 'sm',
    actions: [{
      label: 'Submit Payment',
      variant: 'solid',
      loading: isUpdatingStatus,
      onClick: () => updateStatus('Submitted'),
      disabled: !isSubmitEnabled || isUpdatingStatus,
    }],
  }"
>
  <template #body-content>
    <div class="space-y-4">
      <div class="text-sm text-gray-600">
        To submit this payment, please confirm the payment amount {{ paymentResource.doc.amount }}:
      </div>
      <div class="relative">
        <input
          v-model="confirmationAmount"
          type="number"
          step="0.01"
          class="block w-full rounded-md shadow-sm sm:text-sm"
          :class="{
            'border-gray-300 focus:border-gray-900 focus:ring-gray-900': !confirmationAmount,
            'border-red-300 focus:border-red-500 focus:ring-red-500': confirmationAmount && !isSubmitEnabled,
            'border-green-300 focus:border-green-500 focus:ring-green-500': isSubmitEnabled
          }"
          :placeholder="paymentResource.doc.amount"
        />
        <div 
          v-if="confirmationAmount && !isSubmitEnabled"
          class="mt-1 text-sm text-red-600"
        >
          Amount does not match payment amount
        </div>
      </div>
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
    title: 'Cancel Payment',
    size: 'sm',
    actions: [{
      label: 'Cancel Payment',
      variant: 'solid',
      theme: 'red',
      loading: isUpdatingStatus,
      onClick: () => updateStatus('Cancelled'),
      disabled: !cancellationReason || isUpdatingStatus,
    }],
  }"
>
  <template #body-content>
    <div class="space-y-4">
      <Textarea
        v-model="cancellationReason"
        label="Cancellation Reason"
        placeholder="Please provide a reason for cancellation"
        variant="outline"
        size="sm"
        class="w-full"
      />
      <div v-if="statusError" class="text-sm text-red-500">
        {{ statusError }}
      </div>
    </div>
  </template>
</Dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createPaymentResource } from '@/data/payment'
import { 
  Button,
  Badge,
  Dialog,
  Dropdown,
  Textarea,
  FileUploader,
  Avatar,
  FeatherIcon,
  LoadingIndicator
} from 'frappe-ui'
import { partyResource } from '@/data/party'
import { formatDate, formatCurrency, DATE_FORMATS} from '@/utils/format'


const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'doc' in value
    }
  }
})

const isSubmitEnabled = computed(() => {
  const currentDoc = paymentResource.value?.doc
  if (currentDoc?.status !== 'Draft') return true
  return confirmationAmount.value && parseFloat(confirmationAmount.value) === currentDoc.amount
})

const route = useRoute()
const router = useRouter()
const showSubmitDialog = ref(false)
const showCancelDialog = ref(false)
const paymentResource = ref(null)
const statusError = ref('')
const confirmationAmount = ref('')
const cancellationReason = ref('')
const isUpdatingStatus = ref(false)
const showAttachDialog = ref(false)
const attachmentFile = ref(null)
const isUploading = ref(false)
const uploadedResult = ref(null)

// Computed Properties
const partyData = computed(() => {
  return partyResource.data?.find(p => p.name === paymentResource.value?.doc?.party)
})

const attachmentUploadArgs = computed(() => ({
  doctype: 'RUA Payment',
  docname: paymentResource.value?.doc?.name,
  fieldname: 'attach_payment',
  private: true,
}))


const isAttachmentViewable = computed(() => {
  const file = paymentResource.value?.doc?.attach_payment
  if (!file) return false
  return file.toLowerCase().endsWith('.pdf') || file.match(/\.(jpe?g|png|gif)$/i)
})

const canBeCancelled = computed(() => 
  paymentResource.value?.doc?.status === 'Submitted'
)

const getDialogTitle = computed(() => {
  const status = paymentResource.value?.doc?.status
  if (status === 'Draft') return 'Submit Payment'
  if (status === 'Submitted') return 'Cancel Payment'
  return 'Payment Status'
})

const statusDialogOptions = computed(() => ({
  title: getDialogTitle.value,
  size: 'sm',
  actions: [
    {
      label: paymentResource.value?.doc?.status === 'Draft' ? 'Submit Payment' : 'Cancel Payment',
      loading: isUpdatingStatus.value,
      variant: 'solid',
      onClick: updateStatus,
      disabled: paymentResource.value?.doc?.status === 'Cancelled' || 
               (paymentResource.value?.doc?.status === 'Draft' && !isSubmitEnabled.value)
    }
  ]
}))

const relatedDocIcon = computed(() => {
  const doctype = paymentResource.value?.doc?.related_doctype
  switch (doctype) {
    case 'RUA LPO':
      return 'shopping-cart'
    case 'RUA Invoice':
      return 'file-text'
    default:
      return 'link'
  }
})

const relatedDocLabel = computed(() => {
  const doc = paymentResource.value?.doc
  if (!doc?.related_doctype || !doc?.related_docname) return ''

  switch (doc.related_doctype) {
    case 'RUA LPO':
      return `${doc.related_docname}`
    case 'RUA Invoice':
      return `${doc.related_docname}`
    default:
      return `${doc.related_docname}`
  }
})

// Methods
function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'submitted':
      return 'green'
    case 'cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

function handleAttachmentUpload(result) {
  uploadedResult.value = result
}

function handleAttachmentDrop(event, openFileSelector) {
  const file = event.dataTransfer?.files?.[0]
  if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
    event.currentTarget.classList.remove('border-gray-900')
    const input = document.querySelector('input[type="file"]')
    if (input) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  } else {
    statusError.value = 'Please upload a PDF or image file'
  }
}

async function updateAttachment() {
  if (!uploadedResult.value?.file_url) {
    statusError.value = 'Please upload a file'
    return
  }

  try {
    isUploading.value = true
    await paymentResource.value.setValue.submit({
      attach_payment: uploadedResult.value.file_url
    })
    await paymentResource.value.reload()
    showAttachDialog.value = false
    attachmentFile.value = null
  } catch (error) {
    statusError.value = 'Failed to update attachment'
  } finally {
    isUploading.value = false
  }
}


async function updateStatus(status) {
  statusError.value = ''

  if (status === 'Submitted' && (!confirmationAmount.value || !isSubmitEnabled.value)) {
    statusError.value = 'Please confirm the correct payment amount'
    return
  }

  if (status === 'Cancelled' && !cancellationReason.value.trim()) {
    statusError.value = 'Please provide a cancellation reason'
    return
  }

  try {
    isUpdatingStatus.value = true
    const updateData = {
      name: paymentResource.value.doc.name,
      status: status,
    }

    if (status === 'Cancelled') {
      updateData.remarks = cancellationReason.value
    }

    await paymentResource.value.setValue.submit(updateData)
    await paymentResource.value.reload()
    resetDialogs()
  } catch (error) {
    statusError.value = 'Failed to update status'
  } finally {
    isUpdatingStatus.value = false
  }
}

// Update resetDialogs function
function resetDialogs() {
  showSubmitDialog.value = false
  showCancelDialog.value = false
  statusError.value = ''
  confirmationAmount.value = ''
  cancellationReason.value = ''
}

function navigateToRelatedDoc() {
  const doc = paymentResource.value?.doc
  if (!doc?.related_doctype || !doc?.related_docname) return

  const routeMap = {
    'RUA LPO': {
      name: 'LPODetails',
      params: {
        id: props.projectResource.doc.name,
        lpoId: doc.related_docname
      }
    },
    'RUA Invoice': {
      name: 'InvoiceDetails',
      params: {
        id: props.projectResource.doc.name,
        invoiceId: doc.related_docname
      }
    }
  }

  const route = routeMap[doc.related_doctype]
  if (route) {
    router.push(route)
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
				doctype: 'RUA Payment',
				name: paymentResource.value.doc.name,
				format: 'Standard',
				no_letterhead: 0,
			}),
		})

		if (!response.ok) throw new Error('Failed to download PDF')

		const blob = await response.blob()
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `${paymentResource.value.doc.name}.pdf`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		window.URL.revokeObjectURL(url)
	} catch (error) {
		console.error('Error downloading PDF:', error)
	}
}

function printPayment() {
	let baseUrl = window.location.origin

	if (window.location.hostname === 'localhost' && window.location.port === '8080') {
		baseUrl = `http://${window.location.hostname}:8000`
	}

	const url = `${baseUrl}/printview?doctype=RUA Payment&name=${paymentResource.value.doc.name}&format=Standard&no_letterhead=0&_lang=en`
	window.open(url, '_blank')
}

const actionDropdownOptions = computed(() => {
	const doc = paymentResource.value?.doc
	if (!doc) return []

	const options = [
		{
			label: 'Download PDF',
			icon: 'file-text',
			onClick: downloadPDF,
		},
		{
			label: 'Print',
			icon: 'printer',
			onClick: printPayment,
		},
    {
      label: 'Cancel Payment',
      icon: 'x-circle',
      onClick: () => (showCancelDialog.value = true),
    },
    {
      label: 'Upload Attachment',
      icon: 'upload',
      onClick: () => (showAttachDialog.value = true),
    }
	]
	return options
})

onMounted(() => {
  initializePaymentResource()
})

function initializePaymentResource() {
  if (route.params.paymentId) {
    paymentResource.value = createPaymentResource(route.params.paymentId)
  }
}

// Watch for route changes
watch(() => route.params.paymentId, (newId) => {
  if (newId) {
    paymentResource.value = createPaymentResource(newId)
  }
})

</script>