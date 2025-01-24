# PurchaseReceiptDetails.vue
<template>
	<!-- Loading State -->
	<div
		v-if="!receiptResource?.doc || receiptResource?.loading"
		class="flex items-center justify-center min-h-[60vh]"
	>
		<LoadingIndicator />
	</div>

	<div v-else-if="receiptResource.error" class="flex items-center justify-center min-h-[60vh]">
		<div class="text-center">
			<FeatherIcon name="alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-2" />
			<p class="text-gray-600">Failed to load receipt details</p>
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
								`/project/${projectResource.doc.name}/invoicing/purchase-receipts`,
							)
						"
					></Button>
					<!-- Document Info -->
					<div class="flex flex-col">
						<h1 class="text-xl font-bold text-gray-900">
							{{ receiptResource.doc.name }}
						</h1>
						<p class="text-sm text-gray-600 hidden md:inline">
							Created on {{ formatDate(receiptResource.doc.creation) }} by
							{{ receiptResource.doc.owner }}
						</p>
					</div>
				</div>

				<!-- Status and Actions -->
				<div class="flex items-center gap-3">
					<!-- Status Badge -->
					<Badge
						:variant="
							getStatusVariant(receiptResource.doc.status) === 'gray'
								? 'solid'
								: 'subtle'
						"
						:theme="getStatusVariant(receiptResource.doc.status)"
					>
						{{ receiptResource.doc.status }}
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

		<!-- Update the Draft status banner text -->
<div v-if="receiptResource.doc.status === 'Draft'" class="bg-orange-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="alert-triangle" class="h-5 w-5 text-orange-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-orange-800">
        {{ receiptResource.doc.status }} Purchase Receipt
      </h3>
      <div class="mt-2 text-sm text-orange-700">
        This receipt is still in {{ receiptResource.doc.status }} status. Please enter the received quantities and upload the signed delivery note.
      </div>
      <div class="mt-4">
        <Button variant="solid" size="sm" @click="showStatusDialog = true" :disabled="!hasVerifiedQuantities">
          Mark as Received
        </Button>
      </div>
    </div>
  </div>
</div>

<!-- Update the Cancel status banner text -->
<div v-if="receiptResource.doc.status === 'Cancelled'" class="bg-red-100 px-6 py-4">
  <div class="flex items-start rounded-lg">
    <div class="flex-shrink-0">
      <FeatherIcon name="x-circle" class="h-5 w-5 text-red-400" />
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">
        {{ receiptResource.doc.status }} Purchase Receipt
      </h3>
      <div class="mt-2 text-sm text-red-700">
        This receipt has been cancelled and cannot be processed further.
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
							<div
								v-else
								class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"
							>
								<FeatherIcon name="user" class="w-8 h-8 text-gray-400" />
							</div>
						</div>

						<!-- Details Grid -->
						<div class="flex-1 grid grid-cols-2 gap-4">
							<div>
								<label class="text-sm font-medium text-gray-600">Party</label>
								<p class="mt-1 text-sm text-gray-900">
									{{ receiptResource.doc.party }}
								</p>
							</div>
							<div>
								<label class="text-sm font-medium text-gray-600"
									>Purchase Order</label
								>
								<p
									class="mt-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
									@click="navigateToLPO(receiptResource.doc.purchase_order)"
								>
									{{ receiptResource.doc.purchase_order }}
								</p>
							</div>
							<div>
								<label class="text-sm font-medium text-gray-600"
									>Delivery Note Ref</label
								>
								<p class="mt-1 text-sm text-gray-900">
									{{ receiptResource.doc.supplier_delivery_note }}
								</p>
							</div>
							<div>
								<label class="text-sm font-medium text-gray-600">Date</label>
								<p class="mt-1 text-sm text-gray-900">
									{{ formatDate(receiptResource.doc.date, true) }}
								</p>
							</div>

							<!-- Show remarks if cancelled -->
							<div
								v-if="receiptResource.doc.status === 'Cancelled'"
								class="col-span-2"
							>
								<label class="text-sm font-medium text-red-600"
									>Cancellation Remarks</label
								>
								<p class="mt-1 text-sm text-red-600">
									{{ receiptResource.doc.remarks }}
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Last Modified -->
				<div
					v-if="receiptResource.doc.modified_by"
					class="px-6 py-3 bg-gray-50 text-sm text-gray-600"
				>
					Last modified: {{ formatDate(receiptResource.doc.modified) }} by
					{{ receiptResource.doc.modified_by }}
				</div>
			</div>

			<!-- Items Card -->
			<div class="bg-white rounded-lg border shadow-sm">
				<div class="px-6 py-4 border-b">
					<h2 class="text-lg font-medium text-gray-900">Items</h2>
				</div>

				<div class="overflow-x-auto">
					<!-- Table Header -->
					<div class="bg-gray-50 border-b min-w-[800px]">
						<div class="flex items-center px-6 py-3">
							<div class="flex-1 grid grid-cols-5 gap-4">
								<div
									class="flex items-center gap-2 text-sm font-medium text-gray-700"
								>
									<FeatherIcon name="box" class="w-4 h-4" />
									Item
								</div>
								<div
									class="flex items-center gap-2 text-sm font-medium text-gray-700 text-center justify-center"
								>
									<FeatherIcon name="shopping-cart" class="w-4 h-4" />
									Ordered Qty
								</div>
								<div
									class="flex items-center gap-2 text-sm font-medium text-gray-700 text-center justify-center"
								>
									<FeatherIcon name="check-square" class="w-4 h-4" />
									Previously Received
								</div>
								<div
									class="flex items-center gap-2 text-sm font-medium text-gray-700 text-center justify-center"
								>
									<FeatherIcon name="clipboard" class="w-4 h-4" />
									Received Qty
								</div>
								<div
									class="flex items-center gap-2 text-sm font-medium text-gray-700 text-right justify-center"
								>
									<FeatherIcon name="check-circle" class="w-4 h-4" />
									Remaining Qty
								</div>
							</div>
						</div>
					</div>

					<!-- Table Body -->
					<div class="divide-y">
						<div
							v-for="(item, index) in receiptResource.doc.items"
							:key="index"
							class="hover:bg-gray-50 transition-colors min-w-[800px]"
						>
							<div class="flex items-center px-6 py-3"
                  :class="[item.remaining_quantity > 0 ? 'bg-yellow-50' : '']"
              >
								<div class="flex-1 grid grid-cols-5 gap-4">
									<!-- Item -->
									<div class="text-sm text-gray-900">
										{{ item.item }}
									</div>

									<!-- Ordered Quantity -->
									<div class="text-sm text-gray-600 text-center">
										{{ formatNumber(item.ordered_quantity) }}
									</div>

									<!-- Previously Received -->
									<div class="text-sm text-gray-600 text-center">
										{{ formatNumber(item.previously_received_quantity) }}
									</div>

									<!-- Received -->
									<div class="text-center">
										<input
											v-if="isDraft && item.remaining_quantity > 0"
											type="number"
											v-model.number="item.received_quantity"
                      :class="[item.remaining_quantity === item.received_quantity ? 'text-green-500' : item.remaining_quantity > item.received_quantity && item.received_quantity > 0 ? 'text-yellow-500' : item.remaining_quantity === 0 ? '' : 'text-red-500']"
											class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-center "
											:max="item.remaining_quantity"
											:min="0"
											step="any"
											@input="validateReceivedQuantity(item)"
										/>
										<div
											v-else
											:class="[
												'text-sm text-gray-900',
												receiptResource.doc.status === 'Cancelled'
													? 'line-through text-red-500'
													: '',
											]"
										>
											{{ formatNumber(item.received_quantity || 0) }}
										</div>
									</div>

									<!-- Remaining -->
									<div class="text-sm text-gray-600 text-center">
										{{ formatNumber(item.remaining_quantity) }}
									</div>
								</div>
							</div>
						</div>

						<!-- Empty State -->
						<div
							v-if="!receiptResource.doc.items?.length"
							class="flex flex-col items-center justify-center py-12"
						>
							<div class="flex flex-col items-center text-center max-w-sm">
								<div
									class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4"
								>
									<FeatherIcon name="box" class="w-6 h-6 text-gray-400" />
								</div>
								<h3 class="text-base font-medium text-gray-900">No Items</h3>
								<p class="mt-1 text-sm text-gray-500">
									This receipt has no items.
								</p>
							</div>
						</div>
					</div>

					<!-- Save Changes Button -->
					<div
						v-if="isDraft && hasChanges"
						class="flex justify-end px-6 py-4 bg-gray-50 border-t"
					>
						<Button
							variant="solid"
							:loading="isSaving"
							:disabled="isSaving"
							@click="showSaveConfirmation"
						>
							<template #prefix>
								<FeatherIcon name="save" class="w-4 h-4" />
							</template>
							{{ isSaving ? 'Saving...' : 'Save Changes' }}
						</Button>
					</div>
				</div>
			</div>

<!-- Verification Card -->
<div 
  v-if="isDraft" 
  class="bg-white rounded-lg border shadow-sm"
>
  <div class="p-6">
    <Checkbox
      size="sm"
      v-model="hasVerifiedQuantities"
      :label="`I confirm that I, ${session.user}, have physically counted all received items and verified that the quantities entered above are accurate.`"
    />
  </div>
</div>

			<!-- Signed Delivery Note Card -->
			<div
				v-if="receiptResource.doc.signed_delivery_note"
				class="bg-white rounded-lg border shadow-sm"
			>
				<div class="flex items-center justify-between px-6 py-4 border-b">
					<h2 class="text-lg font-medium text-gray-900">Signed Delivery Note</h2>
					<a
						:href="receiptResource.doc.signed_delivery_note"
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
						:src="receiptResource.doc.signed_delivery_note"
						class="w-full h-[600px] border rounded-lg"
						frameborder="0"
					></iframe>
					<div v-else class="text-center py-8">
						<a
							:href="receiptResource.doc.signed_delivery_note"
							target="_blank"
							rel="noopener noreferrer"
							class="text-gray-600 hover:text-gray-800"
						>
							<FeatherIcon name="download" class="w-8 h-8 mx-auto mb-2" />
							<span>Download Signed Delivery Note</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Save Confirmation Dialog -->
	<Dialog
		v-model="showConfirmDialog"
		:options="{
			title: 'Confirm Received Quantities',
			size: 'md',
			actions: [
				{
					label: 'Save Changes',
					variant: 'solid',
					loading: isSaving,
					onClick: saveChanges,
				},
			],
		}"
	>
		<template #body-content>
			<div class="space-y-4">
				<p class="text-sm text-gray-600">Please confirm that you have received:</p>
				<div class="space-y-2">
					<div
						v-for="item in changedItems"
						:key="item.item"
						class="text-sm text-gray-900"
					>
						<span class="font-medium">{{ item.received_quantity }}x</span> of
						<span class="font-medium">{{ item.item }}</span>
					</div>
				</div>
			</div>
		</template>
	</Dialog>

	<!-- Cancel Dialog -->
	<Dialog
		v-model="showCancelDialog"
		:options="{
			title: 'Cancel Purchase Receipt',
			size: 'sm',
			actions: [
				{
					label: 'Cancel Receipt',
					variant: 'solid',
					theme: 'red',
					loading: isCancelling,
					onClick: cancelReceipt,
					disabled: !cancellationRemarks || isCancelling,
				},
			],
		}"
	>
		<template #body-content>
			<div class="space-y-4">
				<div class="text-sm text-gray-600">
					Are you sure you want to cancel this receipt? This action cannot be undone.
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700">
						Cancellation Remarks
					</label>
					<textarea
						v-model="cancellationRemarks"
						rows="3"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
						placeholder="Please provide a reason for cancellation"
					></textarea>
				</div>
				<div v-if="cancelError" class="text-sm text-red-600">
					{{ cancelError }}
				</div>
			</div>
		</template>
	</Dialog>

	<!-- Status Change Dialog -->
	<Dialog
		v-model="showStatusDialog"
		:options="{
			title: 'Record Item Receipt',
			size: 'sm',
			actions: [
				{
					label: 'Confirm Receipt',
					variant: 'solid',
					loading: isUpdatingStatus,
					onClick: markAsReceived,
					disabled: !uploadedResult?.file_url || isUpdatingStatus,
				},
			],
		}"
	>
		<template #body-content>
			<div class="space-y-4">
				<FileUploader
					v-model="signedDeliveryNote"
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
						@dragleave.prevent="
							$event.currentTarget.classList.remove('border-gray-900')
						"
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
									Upload Signed Delivery Note
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
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
	Avatar,
	Badge,
	Button,
	Dialog,
	Dropdown,
	FeatherIcon,
	FileUploader,
  Checkbox,
	LoadingIndicator,
	createResource,
} from 'frappe-ui'
import { formatDate, formatNumber } from '@/utils/format'
import { partyResource } from '@/data/party'
import { createPurchaseReceiptResource } from '@/data/purchaseReceipt'
import { session } from '@/data/session'

const props = defineProps({
	projectResource: {
		type: Object,
		required: true,
		validator: (value) => {
			return value && typeof value === 'object' && 'doc' in value
		},
	},
})

const route = useRoute()
const router = useRouter()

// State
const receiptResource = ref(null)
const showStatusDialog = ref(false)
const showCancelDialog = ref(false)
const hasVerifiedQuantities = ref(false)
const showConfirmDialog = ref(false)
const signedDeliveryNote = ref(null)
const uploadedResult = ref(null)
const isUpdatingStatus = ref(false)
const isSaving = ref(false)
const isCancelling = ref(false)
const statusError = ref('')
const cancelError = ref('')
const cancellationRemarks = ref('')

// Track original values for change detection
const originalItems = ref([])

// Computed
const partyData = computed(() => {
	return partyResource.data?.find((p) => p.name === receiptResource.value?.doc?.party)
})

const isDraft = computed(() => receiptResource.value?.doc?.status === 'Draft')

const isPDF = computed(() => {
	const file = receiptResource.value?.doc?.signed_delivery_note
	return file?.toLowerCase().endsWith('.pdf')
})

const hasChanges = computed(() => {
	return receiptResource.value?.doc?.items?.some((item) => {
		const original = originalItems.value.find((i) => i.name === item.name)
		return original && original.received_quantity !== item.received_quantity
	})
})

const changedItems = computed(() => {
	if (!receiptResource.value?.doc?.items) return []

	return receiptResource.value.doc.items.filter((item) => {
		const original = originalItems.value.find((i) => i.name === item.name)
		return (
			original &&
			item.received_quantity !== original.received_quantity &&
			item.received_quantity > 0
		)
	})
})

const actionDropdownOptions = computed(() => {
	const doc = receiptResource.value?.doc
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
			onClick: printReceipt,
		},
    {
			label: 'Cancel Receipt',
			icon: 'x-circle',
			onClick: () => (showCancelDialog.value = true),
		}
	]
	return options
})

const uploadArgs = computed(() => ({
	doctype: 'RUA Purchase Receipt',
	docname: receiptResource.value?.doc?.name,
	fieldname: 'signed_delivery_note',
	private: true,
}))

// Resource for updating items
const updateReceiptItems = createResource({
	url: 'rua.api.update_receipt_items',
	validate(values) {
		if (!values.items?.length) {
			return 'No items to save'
		}
		return null
	},
})

// Methods
function getStatusVariant(status) {
	switch (status?.toLowerCase()) {
		case 'draft':
			return 'orange'
		case 'received':
			return 'green'
		case 'cancelled':
			return 'red'
		default:
			return 'gray'
	}
}

function validateReceivedQuantity(item) {
	if (item.received_quantity > item.remaining_quantity) {
		item.received_quantity = item.remaining_quantity
	}
	if (item.received_quantity < 0) {
		item.received_quantity = 0
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

function handleUploadSuccess(result) {
	uploadedResult.value = result
}

function showSaveConfirmation() {
	if (changedItems.value.length > 0) {
		showConfirmDialog.value = true
	}
}

async function saveChanges() {
	try {
		isSaving.value = true

		await updateReceiptItems.submit({
			receipt_name: receiptResource.value.doc.name,
			items: receiptResource.value.doc.items.map((item) => ({
				name: item.name,
				received_quantity: item.received_quantity || 0,
			})),
		})

		// Update original items to match current state
		originalItems.value = JSON.parse(JSON.stringify(receiptResource.value.doc.items))

		showConfirmDialog.value = false
		await receiptResource.value.reload()
	} catch (error) {
		console.error('Error saving changes:', error)
	} finally {
		isSaving.value = false
	}
}

async function markAsReceived() {
	if (!uploadedResult.value?.file_url) {
		statusError.value = 'Please upload the signed delivery note'
		return
	}

	try {
		isUpdatingStatus.value = true
		statusError.value = ''

		await receiptResource.value.setValue.submit({
			status: 'Received',
			signed_delivery_note: uploadedResult.value.file_url,
		})

		showStatusDialog.value = false
		await receiptResource.value.reload()
	} catch (error) {
		statusError.value = error.message || 'Failed to update status'
	} finally {
		isUpdatingStatus.value = false
	}
}

async function cancelReceipt() {
	if (!cancellationRemarks.value) {
		cancelError.value = 'Please provide cancellation remarks'
		return
	}

	try {
		isCancelling.value = true
		cancelError.value = ''

		await receiptResource.value.setValue.submit({
			status: 'Cancelled',
			remarks: cancellationRemarks.value,
		})

		showCancelDialog.value = false
		cancellationRemarks.value = ''
		await receiptResource.value.reload()
	} catch (error) {
		cancelError.value = error.message || 'Failed to cancel receipt'
	} finally {
		isCancelling.value = false
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
				doctype: 'RUA Purchase Receipt',
				name: receiptResource.value.doc.name,
				format: 'Standard',
				no_letterhead: 0,
			}),
		})

		if (!response.ok) throw new Error('Failed to download PDF')

		const blob = await response.blob()
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `${receiptResource.value.doc.name}.pdf`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		window.URL.revokeObjectURL(url)
	} catch (error) {
		console.error('Error downloading PDF:', error)
	}
}

function printReceipt() {
	let baseUrl = window.location.origin

	if (window.location.hostname === 'localhost' && window.location.port === '8080') {
		baseUrl = `http://${window.location.hostname}:8000`
	}

	const url = `${baseUrl}/printview?doctype=RUA Purchase Receipt&name=${receiptResource.value.doc.name}&format=Standard&no_letterhead=0&_lang=en`
	window.open(url, '_blank')
}

function navigateToLPO(lpoName) {
	router.push({
		name: 'LPODetails',
		params: {
			id: props.projectResource.doc.name,
			lpoId: lpoName,
		},
	})
}

// Lifecycle
onMounted(() => {
	initializeReceiptResource()
})

// Initialize and watch resources
function initializeReceiptResource() {
	if (route.params.receiptId) {
		receiptResource.value = createPurchaseReceiptResource(route.params.receiptId)

		// Store original items when loaded
		watch(
			() => receiptResource.value?.doc?.items,
			(items) => {
				if (items) {
					originalItems.value = JSON.parse(JSON.stringify(items))
				}
			},
			{ immediate: true },
		)
	}
}

// Watch for route changes
watch(
	() => route.params.receiptId,
	(newId) => {
		if (newId) {
			receiptResource.value = createPurchaseReceiptResource(newId)
		}
	},
)
</script>
