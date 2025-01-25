# RFQDetails.vue
<template>
  <!-- Loading State -->
  <div v-if="!rfqResource?.doc || rfqResource?.loading" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else-if="rfqResource.error" class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <FeatherIcon name="alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p class="text-gray-600">Failed to load RFQ details</p>
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
								`/project/${projectResource.doc.name}/invoicing/rfqs`,
							)
						"
					></Button>
          <!-- Document Info -->
          <div class="flex flex-col">
            <h1 class="text-xl font-bold text-gray-900">
              {{ rfqResource.doc.name }}
            </h1>
            <p class="text-sm text-gray-600 hidden md:inline">
              Created on {{ formatDate(rfqResource.doc.creation) }} by {{ rfqResource.doc.owner }}
            </p>
          </div>
        </div>

        <!-- Status and Actions -->
        <div class="flex items-center gap-3">
          <!-- Status Badge -->
          <Badge
            :variant="rfqResource.doc.status === 'Quotation Received' ? 'solid' : 'subtle'"
            :theme="getStatusVariant(rfqResource.doc.status)"
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

    <!-- Add these status banners after the header section -->
<div v-if="rfqResource.doc.status === 'Draft'" class="bg-orange-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="alert-triangle" class="h-5 w-5 text-orange-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-orange-800">
        {{ rfqResource.doc.status }} RFQ
      </h3>
      <div class="mt-2 text-sm text-orange-700">
        RFQ is still in Draft status. Please send it to {{ rfqResource.doc.party }}.
      </div>
      <div class="mt-4">
        <Button variant="solid" size="sm" @click="showSubmitDialog = true">
          Mark as Sent
        </Button>
      </div>
    </div>
  </div>
</div>

<div v-if="rfqResource.doc.status === 'Submitted'" class="bg-blue-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="info" class="h-5 w-5 text-blue-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-blue-800">
        {{ rfqResource.doc.status }} RFQ
      </h3>
      <div class="mt-2 text-sm text-blue-700">
        This RFQ has been submitted to {{ rfqResource.doc.party }}. Please mark as received once you get their quotation.
      </div>
      <div class="mt-4 flex gap-3">
        <Button variant="solid" size="sm" @click="showReceiveDialog = true">
          Record Quotation
        </Button>
        <Button variant="solid" theme="red" size="sm" @click="showCancelDialog = true">
          Cancel
        </Button>
      </div>
    </div>
  </div>
</div>

<div v-if="rfqResource.doc.status === 'Cancelled'" class="bg-red-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="x-circle" class="h-5 w-5 text-red-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">
        {{ rfqResource.doc.status }} RFQ
      </h3>
      <div class="mt-2 text-sm text-red-700">
        This RFQ has been cancelled and cannot be processed further.
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
                <p class="mt-1 text-sm text-gray-900">{{ rfqResource.doc.party }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Type</label>
                <p class="mt-1 text-sm text-gray-900">{{ rfqResource.doc.type }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">RFQ Date</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(rfqResource.doc.date) }}</p>
              </div>
              <!-- Link field for Link type -->
              <div v-if="isLinkType">
                <label class="text-sm font-medium text-gray-600">External Link</label>
                <div class="mt-1">
                  <a 
                    :href="rfqResource.doc.link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-sm text-blue-600 hover:text-blue-800 break-all"
                  >
                    {{ rfqResource.doc.link }}
                  </a>
                </div>
              </div>
              
              <!-- Show remarks if cancelled -->
              <div v-if="rfqResource.doc.status === 'Cancelled'" class="col-span-2">
                <label class="text-sm font-medium text-red-600">Cancellation Remarks</label>
                <p class="mt-1 text-sm text-red-600">{{ rfqResource.doc.remarks }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-if="rfqResource.doc.modified_by" class="px-6 py-3 bg-gray-50 text-sm text-gray-600">
          Last modified: {{ formatDate(rfqResource.doc.modified, DATE_FORMATS.FULL_DATE_TIME) }} by {{ rfqResource.doc.modified_by }}
        </div>
      </div>

      <!-- Items Table (only for non-Link types) -->
      <div v-if="!isLinkType" class="bg-white rounded-lg border shadow-sm">
        <div class="px-6 py-4 border-b">
          <h2 class="text-lg font-medium text-gray-900">Items</h2>
        </div>
        <RFQItems 
          :items="rfqResource.doc.items"
          :type="rfqResource.doc.type"
          :status="rfqResource.doc.status"
          :rfq-name="rfqResource.doc.name"
        />
      </div>

      <!-- Quotation Document -->
      <div 
        v-if="rfqResource.doc.status === 'Quotation Received' && rfqResource.doc.quotation_file" 
        class="bg-white rounded-lg border shadow-sm"
      >
        <div class="flex items-center justify-between border-b px-6 py-4">
          <h2 class="text-lg font-medium text-gray-900">Quotation Document</h2>
          <a 
            :href="rfqResource.doc.quotation_file" 
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
            :src="rfqResource.doc.quotation_file"
            class="w-full h-[600px] border rounded-lg"
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

<!-- Submit Dialog -->
<Dialog
  v-model="showSubmitDialog"
  :options="{
    title: 'Submit RFQ',
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
      Are you sure you want to submit this RFQ?
    </div>
  </template>
</Dialog>

<!-- Receive Quotation Dialog -->
<Dialog
  v-model="showReceiveDialog"
  :options="{
    title: 'Record Supplier Quotation',
    size: 'sm',
    actions: [{
      label: 'Record Quotation',
      variant: 'solid',
      loading: isUpdatingStatus,
      onClick: () => updateStatus('Quotation Received'),
      disabled: !uploadedResult?.file_url || isUpdatingStatus,
    }],
  }"
>
  <template #body-content>
    <div class="space-y-4">
      <div class="text-sm text-gray-600">
        Please upload the quotation <span class="font-bold text-red-500">received from {{ rfqResource.doc.party }}</span> to record their prices.
      </div>
      
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
                Upload Supplier's Quotation
              </div>
              <div class="text-xs text-gray-500">Supported formats: PDF, Excel (up to 5MB)</div>
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
    title: 'Cancel RFQ',
    size: 'sm',
    actions: [{
      label: 'Cancel RFQ',
      variant: 'solid',
      theme: 'red',
      loading: isUpdatingStatus,
      onClick: () => updateStatus('Cancelled'),
      disabled: !remarks || isUpdatingStatus,
    }],
  }"
>
  <template #body-content>
    <div class="space-y-4">
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
  Dropdown,
  Dialog,
  Avatar,
  Textarea,
  FileUploader,
  LoadingIndicator
} from 'frappe-ui'
import RFQItems from './RFQItems.vue'
import { formatDate, DATE_FORMATS } from '@/utils/format'

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
const statusError = ref('')
const quotationFile = ref(null)
const uploadedResult = ref(null)
const isUpdatingStatus = ref(false)
const remarks = ref('')
const showSubmitDialog = ref(false)
const showReceiveDialog = ref(false)
const showCancelDialog = ref(false)

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


const actionDropdownOptions = computed(() => {
  const options = []

  if (rfqResource) {
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
      },
      {
			label: 'Cancel RFQ',
			icon: 'x-circle',
			onClick: () => (showCancelDialog.value = true),
		}
    )
  }

  return options
})


const uploadArgs = computed(() => ({
  doctype: 'RUA RFQ',
  docname: rfqResource.value?.doc?.name,
  fieldname: 'quotation_file',
  private: true
}))

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

function resetDialogs() {
  showSubmitDialog.value = false
  showReceiveDialog.value = false
  showCancelDialog.value = false
  statusError.value = ''
  quotationFile.value = null
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

  if (status === 'Quotation Received' && !uploadedResult.value?.file_url) {
    statusError.value = "Please upload the supplier's quotation"
    return
  }

  try {
    isUpdatingStatus.value = true
    const updateData = {
      name: rfqResource.value.doc.name,
      status: status,
    }

    if (status === 'Quotation Received') {
      updateData.quotation_file = uploadedResult.value.file_url
    }

    if (status === 'Cancelled') {
      updateData.remarks = remarks.value
    }

    await rfqResource.value.setValue.submit(updateData)
    await rfqResource.value.reload()
    resetDialogs()
  } catch (error) {
    statusError.value = 'Failed to update status'
  } finally {
    isUpdatingStatus.value = false
  }
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