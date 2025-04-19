# QuotationDetails.vue
<template>
  <!-- Loading State -->
  <div v-if="!quotationResource?.doc || quotationResource?.loading" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else-if="quotationResource.error" class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <FeatherIcon name="alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p class="text-gray-600">Failed to load quotation details</p>
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
								`/project/${projectResource.doc.name}/invoicing/quotations`,
							)
						"
					></Button>

          <!-- Document Info -->
          <div class="flex flex-col">
            <h1 class="text-xl font-bold text-gray-900">
              {{ quotationResource.doc.name }}
            </h1>
            <p class="text-sm text-gray-600 hidden md:inline">
              Created on {{ formatDate(quotationResource.doc.creation) }} by {{ quotationResource.doc.owner }}
            </p>
          </div>
        </div>

        <!-- Status and Actions -->
        <div class="flex items-center gap-3">
          <!-- Status Badge -->
          <Badge
            :variant="quotationResource.doc.status === 'Final' ? 'solid' : 'subtle'"
            :theme="getStatusVariant(quotationResource.doc.status)"
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

    <!-- Add these status banners after the header section -->
<div v-if="quotationResource.doc.status === 'Draft'" class="bg-orange-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="alert-triangle" class="h-5 w-5 text-orange-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-orange-800">
        {{ quotationResource.doc.status }} Quotation
      </h3>
      <div class="mt-2 text-sm text-orange-700">
        Quotation is still in {{ quotationResource.doc.status }} status. Please submit it to {{ quotationResource.doc.party }}.
      </div>
      <div class="mt-4">
        <Button variant="solid" size="sm" @click="showStatusDialog = true">
          Mark as Submitted
        </Button>
      </div>
    </div>
  </div>
</div>

<div v-if="quotationResource.doc.status === 'Submitted'" class="bg-blue-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="info" class="h-5 w-5 text-blue-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-blue-800">
        {{ quotationResource.doc.status }} Quotation
      </h3>
      <div class="mt-2 text-sm text-blue-700">
        Quotation submitted to {{ quotationResource.doc.party }}. Please review their response and finalize or reject accordingly.
      </div>
      <div class="mt-4 flex gap-3">
        <Button variant="solid" size="sm" @click="showFinalizeDialog = true">
          Finalize Quotation
        </Button>
        <Button variant="solid" theme="red" size="sm" @click="showRejectDialog = true">
          Reject
        </Button>
      </div>
    </div>
  </div>
</div>

<div v-if="quotationResource.doc.status === 'Rejected'" class="bg-red-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="x-circle" class="h-5 w-5 text-red-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">
        {{ quotationResource.doc.status }} Quotation
      </h3>
      <div class="mt-2 text-sm text-red-700">
        This quotation has been rejected by {{ quotationResource.doc.party }} and cannot be processed further.
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
            <div class="flex-shrink-0 flex align-center align-middle self-center">
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
                <p class="mt-1 text-sm text-gray-900">{{ quotationResource.doc.party }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Date</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(quotationResource.doc.date) }}</p>
              </div>

              <!-- Show rejection reason if rejected -->
              <div v-if="quotationResource.doc.status === 'Rejected'" class="col-span-2">
                <label class="text-sm font-medium text-red-600">Rejection Reason</label>
                <p class="mt-1 text-sm text-red-600">{{ quotationResource.doc.reject_reason }}</p>
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
                {{ quotationResource.doc.total_items }}
              </span>
            </div>
          </div>
          <div class="p-6">
            <label class="text-sm font-medium text-gray-600">Total Amount</label>
            <div class="mt-2">
              <span class="text-2xl font-semibold text-gray-900">
                {{ formatCurrency(quotationResource.doc.total) }}
              </span>
            </div>
          </div>
          <div class="p-6">
            <label class="text-sm font-medium text-gray-600">Grand Total (Inc. VAT)</label>
            <div class="mt-2">
              <span class="text-2xl font-semibold text-gray-900">
                {{ formatCurrency(quotationResource.doc.grand_total) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="quotationResource.doc.modified_by" class="px-6 py-3 bg-gray-50 text-sm text-gray-600">
          Last modified: {{ formatDate(quotationResource.doc.modified, DATE_FORMATS.FULL_DATE_TIME) }} by {{ quotationResource.doc.modified_by }}
        </div>
      </div>

      <!-- Items Table -->
      <div class="bg-white rounded-lg border shadow-sm">
        <div class="px-6 py-4 border-b">
          <h2 class="text-lg font-medium text-gray-900">Items</h2>
        </div>
        <QuotationItems 
          :items="quotationResource.doc.items"
          :totals="{
            net: quotationResource.doc.total,
            vat: quotationResource.doc.vat_amount,
            grand: quotationResource.doc.grand_total
          }"
        />
      </div>

      <template v-for="field in quotationDetailFields" :key="field.key">

        <div v-if="quotationResource.doc[field.key]" class="bg-white rounded-lg border shadow-sm">

          <div class="px-6 py-4 border-b">

            <h2 class="text-lg font-medium text-gray-900">{{ field.label }}</h2>

          </div>

          <div

            class="px-6 py-4 prose prose-sm max-w-none"

            v-html="quotationResource.doc[field.key]"

          ></div>

        </div>

      </template>

      <!-- Signed Document -->
      <div 
        v-if="quotationResource.doc.status === 'Final' && quotationResource.doc.signed_document" 
        class="bg-white rounded-lg border shadow-sm"
      >
        <div class="flex items-center justify-between border-b px-6 py-4">
          <h2 class="text-lg font-medium text-gray-900">Signed Quotation</h2>
          <a 
            :href="quotationResource.doc.signed_document" 
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
            :src="quotationResource.doc.signed_document"
            class="w-full h-[600px] border rounded-lg"
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
<!-- Submit Dialog -->
<Dialog
  v-model="showStatusDialog"
  :options="{
    title: 'Submit Quotation',
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
      Are you sure you want to submit this quotation?
    </div>
  </template>
</Dialog>
<!-- Finalize Dialog -->
<Dialog
  v-model="showFinalizeDialog"
  :options="{
    title: 'Finalize Quotation',
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
        Please upload the finalized quotation <span class="font-bold text-red-500">signed by {{ quotationResource.doc.party }}</span> to complete this process.
      </div>
      
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
                Upload Signed Quotation
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
      <div class="text-sm text-gray-500">
        Maximum file size: 5MB. Supported format: PDF
      </div>
      <div v-if="statusError" class="text-sm text-red-500">
        {{ statusError }}
      </div>
    </div>
  </template>
</Dialog>

<!-- Reject Dialog -->
<Dialog
  v-model="showRejectDialog"
  :options="{
    title: 'Reject Quotation',
    size: 'sm',
    actions: [{
      label: 'Reject',
      variant: 'solid',
      theme: 'red',
      loading: isUpdatingStatus,
      onClick: () => updateStatus('Rejected'),
      disabled: !rejectReason || isUpdatingStatus,
    }],
  }"
>
  <template #body-content>
    <div class="space-y-4">
      <Textarea
        v-model="rejectReason"
        label="Rejection Reason"
        placeholder="Please provide a reason for rejection"
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
<SignDocument
  v-if="quotationResource?.doc"
  v-model="showSignDialog"
  :doctype="'RUA Quotation'"
  :docname="quotationResource.doc.name"
  @signature-complete="handleSignatureComplete"
/>

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createQuotationResource } from '@/data/quotation'
import SignDocument from '@/components/common/SignDocument.vue'
import {
  Button,
  Badge,
  FeatherIcon,
  Dropdown,
  Dialog,
  Textarea,
  Avatar,
  FileUploader,
  LoadingIndicator
} from 'frappe-ui'
import { partyResource } from '@/data/party'
import QuotationItems from '@/components/invoicing/quotation/QuotationItems.vue'
import { formatDate, formatCurrency, DATE_FORMATS } from '@/utils/format'

const props = defineProps({
  projectResource: { 
    type: Object,
    required: true
  },
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const router = useRouter()
const isPDF = computed(() => {
  const file = quotationResource.value?.doc?.signed_document
  return file?.toLowerCase().endsWith('.pdf')
})

// State Management
const showSignDialog = ref(false)
const quotationResource = ref(null)
const showStatusDialog = ref(false)
const statusError = ref('')
const signedDocument = ref(null)
const uploadedResult = ref(null)
const isUpdatingStatus = ref(false)
const rejectReason = ref('')
const showFinalizeDialog = ref(false)
const showRejectDialog = ref(false)
const quotationDetailFields = ref([

    { key: 'specifications', label: 'Specifications' },

    { key: 'scope_of_work', label: 'Scope of Work' },

    { key: 'exclusions', label: 'Exclusions' },

    { key: 'notes', label: 'Notes' },

    { key: 'qualifications', label: 'Standard Qualifications' },

    { key: 'proposal_basis', label: 'Proposal Basis' },

    { key: 'terms_and_conditions', label: 'Terms and Conditions' },

    { key: 'duration_and_payment', label: 'Duration and Payment Terms' },

    { key: 'maintenance_and_warranty', label: 'Maintenance and Warranty' },

]);



// Computed Properties
const partyData = computed(() => {
  return partyResource.data?.find(p => p.name === quotationResource.value?.doc?.party)
})

const actionDropdownOptions = computed(() => [
  {
    label: 'Download PDF',
    icon: 'file-text',
    onClick: downloadPDF
  },
  {
    label: 'Sign Quotation',
    icon: 'pen-tool',
    onClick: () => (showSignDialog.value = true)
  },
  {
    label: 'Print',
    icon: 'printer',
    onClick: printQuotation
  },
  {
			label: 'Reject Quotation',
			icon: 'x-circle',
			onClick: () => (showRejectDialog.value = true),
		}
])

const uploadArgs = computed(() => ({
  doctype: 'RUA Quotation',
  docname: quotationResource.value?.doc?.name,
  fieldname: 'signed_document',
  private: true
}))

// Methods
function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'submitted':
      return 'blue'
    case 'rejected':
      return 'red'
    case 'final':
      return 'gray'
    default:
      return 'gray'
  }
}

function handleUploadSuccess(result) {
  uploadedResult.value = result
}

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

async function updateStatus(status) {
  statusError.value = ''

  if (status === 'Rejected' && !rejectReason.value.trim()) {
    statusError.value = 'Please provide a rejection reason'
    return
  }

  if (status === 'Final' && !uploadedResult.value?.file_url) {
    statusError.value = 'Please upload the signed document'
    return
  }

  try {
    isUpdatingStatus.value = true
    const updateData = {
      name: quotationResource.value.doc.name,
      status: status,
    }

    if (status === 'Final') {
      updateData.signed_document = uploadedResult.value.file_url
    }

    if (status === 'Rejected') {
      updateData.reject_reason = rejectReason.value
    }

    await quotationResource.value.setValue.submit(updateData)
    await quotationResource.value.reload()
    resetDialogs()
  } catch (error) {
    statusError.value = 'Failed to update status'
  } finally {
    isUpdatingStatus.value = false
  }
}

// Add resetDialogs function
function resetDialogs() {
  showStatusDialog.value = false
  showFinalizeDialog.value = false
  showRejectDialog.value = false
  statusError.value = ''
  signedDocument.value = null
  uploadedResult.value = null
  rejectReason.value = ''
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

async function handleSignatureComplete(signatureUrl) {
  try {
    if (!quotationResource.value?.doc?.name) return

    await quotationResource.value.setValue.submit({
      name: quotationResource.value.doc.name,
      signature: signatureUrl
    })
    await quotationResource.value.reload()
  } catch (error) {
    console.error('Failed to update signature:', error)
  }
}

onMounted(() => {
  initializequotationResource()
})

function initializequotationResource() {
  if (route.params.quotationId) {
    quotationResource.value = createQuotationResource(route.params.quotationId)
  }
}

// Watch for route changes
watch(() => route.params.quotationId, (newId) => {
  if (newId) {
    quotationResource.value = createQuotationResource(newId)
  }
})

</script>