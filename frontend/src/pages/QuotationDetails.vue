<template>
	<div>
		<!-- Loading State -->
		<div
			v-if="quotationResource?.loading"
			class="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center"
		>
			<div class="text-center space-y-4">
				<div
					class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"
				></div>
				<div class="text-gray-700">
					<p class="font-medium">Loading quotation details...</p>
				</div>
			</div>
		</div>

		<template v-else>
			<!-- Document Actions -->
			<div class="sticky top-0 z-10 bg-white border-b">
				<div class="flex items-center justify-between p-4">
					<div class="flex items-center gap-4">
						<Button
							@click="router.push(`/project/${projectResource.doc.name}/documents`)"
						>
							<template #prefix>
								<FeatherIcon name="arrow-left" class="w-4 h-4" />
							</template>
							<span class="hidden md:inline">Back to Documents</span>
						</Button>
						<div class="flex flex-col">
							<h1 class="text-xl font-bold text-gray-900">
								{{ quotationResource?.doc?.name }}
							</h1>
							<p class="text-sm text-gray-600">
								Created on {{ formatDate(quotationResource?.doc?.creation) }} by
								{{ quotationResource?.doc?.owner }}
							</p>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<Badge
							:variant="
								quotationResource?.doc?.status === 'Final' ? 'solid' : 'subtle'
							"
							:theme="getStatusVariant(quotationResource?.doc?.status)"
							class="cursor-pointer"
							@click="showStatusDialog = true"
						>
							{{ quotationResource?.doc?.status }}
						</Badge>
						<Dropdown
							:options="[
								{
									group: 'Actions',
									items: [
										{
											label: 'Download PDF',
											icon: () => h(FeatherIcon, { name: 'file-text' }),
											onClick: downloadPDF,
										},
										{
											label: 'Print',
											icon: () => h(FeatherIcon, { name: 'printer' }),
											onClick: printQuotation,
										},
									],
								},
							]"
						>
							<Button>
								<template #icon>
									<FeatherIcon name="more-horizontal" class="h-4 w-4" />
								</template>
							</Button>
						</Dropdown>

						<Dialog
							v-model="showStatusDialog"
							style="z-index: 999999 !important"
							:options="{
								title:
									getAvailableStatuses(quotationResource?.doc?.status).length ===
									0
										? 'Quotation Status'
										: 'Update Quotation Status',
								size: 'sm',
							}"
						>
							<template #body-content>
								<div class="space-y-4">
									<div class="space-y-4">
										<label
											v-if="
												getAvailableStatuses(
													quotationResource?.doc?.status,
												).length === 0
											"
											class="block text-sm font-medium text-gray-700"
											>Rejected</label
										>
										<label
											v-else
											class="block text-sm font-medium text-gray-700"
											>Change Status</label
										>

										<div
											v-if="
												getAvailableStatuses(
													quotationResource?.doc?.status,
												).length === 0
											"
											class="text-sm text-gray-600 italic"
										>
											Reason:
											{{ quotationResource?.doc?.reject_reason }}.
										</div>

										<div v-else class="space-y-3">
											<div
												v-for="status in getAvailableStatuses(
													quotationResource?.doc?.status,
												)"
												:key="status"
											>
												<div :class="radioClasses.container">
													<input
														type="radio"
														:id="status"
														name="status"
														:value="status"
														v-model="newStatus"
														:class="radioClasses.input"
													/>
													<div :class="radioClasses.radio"></div>
													<label
														:for="status"
														:class="radioClasses.label"
													>
														{{ status }}
													</label>
												</div>
											</div>
										</div>

										<!-- Rejection Reason Textarea -->
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

										<div v-if="statusError" class="text-sm text-red-500 mt-1">
											{{ statusError }}
										</div>
									</div>

									<div v-if="newStatus === 'Final'" class="space-y-4">
										<div class="text-sm font-medium text-gray-700">
											Signed Document
										</div>
										<FileUploader
											v-model="signedDocument"
											:accept="['application/pdf']"
											:max-size="5000000"
											:upload-args="{
												doctype: 'RUA Quotation',
												docname: quotationResource?.doc?.name,
												fieldname: 'signed_document',
												private: true,
											}"
											@success="handleUploadSuccess"
											v-slot="{
												openFileSelector,
												file,
												uploading,
												progress,
												error,
											}"
										>
											<div
												class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
												@click="openFileSelector"
												@dragover.prevent="
													$event.currentTarget.classList.add(
														'border-blue-500',
													)
												"
												@dragleave.prevent="
													$event.currentTarget.classList.remove(
														'border-blue-500',
													)
												"
												@drop.prevent="
													handleDrop($event, openFileSelector)
												"
											>
												<div
													class="flex flex-col items-center justify-center space-y-2"
												>
													<div v-if="!file" class="text-center">
														<FeatherIcon
															name="upload-cloud"
															class="w-8 h-8 text-gray-400 mx-auto mb-2"
														/>
														<div
															class="text-sm font-medium text-gray-900"
														>
															Click to upload PDF
														</div>
														<div class="text-xs text-gray-500">
															or drag and drop
														</div>
													</div>
													<div v-else class="w-full">
														<div
															class="flex items-center justify-between mb-2"
														>
															<div
																class="flex items-center space-x-2"
															>
																<FeatherIcon
																	name="file"
																	class="w-4 h-4 text-gray-400"
																/>
																<span
																	class="text-sm text-gray-900"
																	>{{ file.name }}</span
																>
															</div>
															<button
																v-if="!uploading"
																class="text-sm text-red-500 hover:text-red-700"
																@click.stop="signedDocument = null"
															>
																Remove
															</button>
														</div>
														<div
															v-if="uploading"
															class="w-full bg-gray-200 rounded-full h-2"
														>
															<div
																class="bg-blue-500 h-2 rounded-full transition-all duration-300"
																:style="{ width: progress + '%' }"
															></div>
														</div>
													</div>
													<div v-if="error" class="text-sm text-red-500">
														{{ error }}
													</div>
												</div>
											</div>
										</FileUploader>
										<div class="text-sm text-gray-500">
											Maximum file size: 5MB. Supported format: PDF
										</div>
									</div>
								</div>
							</template>
							<template #actions>
								<div class="flex justify-end gap-2">
									<Button
										variant="subtle"
										@click="resetStatusDialog"
										v-if="
											getAvailableStatuses(quotationResource?.doc?.status)
												.length > 0
										"
									>
										Cancel
									</Button>
									<Button
										:loading="isUpdatingStatus"
										@click="updateStatus"
										v-if="
											getAvailableStatuses(quotationResource?.doc?.status)
												.length > 0
										"
									>
										Update Status
									</Button>
								</div>
							</template>
						</Dialog>
					</div>
				</div>
			</div>

			<div class="space-y-8 px-6 py-4">
				<!-- Summary Section -->
				<div class="space-y-6">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold">Quotation Details</h2>
						<div class="text-sm text-gray-600">
							Last modified: {{ formatDate(quotationResource?.doc?.modified) }} by
							{{ quotationResource?.doc?.modified_by }}
						</div>
					</div>

					<div class="bg-white border rounded-lg shadow-sm">
						<!-- Party Information -->
						<div class="p-6 border-b">
							<div class="flex items-start space-x-4">
								<div class="flex-shrink-0">
									<img
										v-if="partyResource?.doc?.image"
										:src="partyResource?.doc?.image"
										:alt="quotationResource?.doc?.party"
										class="w-16 h-16 rounded-lg object-cover"
									/>
									<div
										v-else
										class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center"
									>
										<FeatherIcon
											name="briefcase"
											class="w-8 h-8 text-gray-400"
										/>
									</div>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center justify-between">
										<div>
											<h3 class="text-lg font-medium text-gray-900">
												{{ quotationResource?.doc?.party }}
											</h3>
											<p class="mt-1 text-sm text-gray-500">
												Quotation Date:
												{{
													formatDate(quotationResource?.doc?.date, true)
												}}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Metrics Grid -->
						<div
							class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x"
						>
							<div class="p-6">
								<label class="text-sm font-medium text-gray-600"
									>Total Items</label
								>
								<div class="mt-2">
									<span class="text-2xl font-semibold text-gray-900">
										{{ quotationResource?.doc?.total_items }}
									</span>
								</div>
							</div>
							<div class="p-6">
								<label class="text-sm font-medium text-gray-600">Net Total</label>
								<div class="mt-2">
									<span class="text-2xl font-semibold text-gray-900">
										{{ formatCurrency(quotationResource?.doc?.total) }}
									</span>
								</div>
							</div>
							<div class="p-6">
								<label class="text-sm font-medium text-gray-600"
									>Grand Total</label
								>
								<div class="mt-2">
									<span class="text-2xl font-semibold text-gray-900">
										{{ formatCurrency(quotationResource?.doc?.grand_total) }}
									</span>
								</div>
							</div>
						</div>

						<!-- Rejection Reason (if status is Rejected) -->
						<div
							v-if="quotationResource?.doc?.status === 'Rejected'"
							class="p-6 bg-red-50 border-t"
						>
							<div class="flex items-start">
								<div class="flex-shrink-0">
									<FeatherIcon
										name="alert-circle"
										class="w-5 h-5 text-red-400"
									/>
								</div>
								<div class="ml-3">
									<h3 class="text-sm font-medium text-red-800">
										Rejection Reason
									</h3>
									<div class="mt-2 text-sm text-red-700">
										{{ quotationResource?.doc?.reject_reason }}
									</div>
								</div>
							</div>
						</div>

						<!-- Signed Document (if status is Final and document exists) -->
						<div
							v-if="
								quotationResource?.doc?.status === 'Final' &&
								quotationResource?.doc?.signed_document
							"
							class="border-t"
						>
							<div class="p-6">
								<h3 class="text-sm font-medium text-gray-900 mb-4">
									Signed Document
								</h3>
								<iframe
									:src="quotationResource?.doc?.signed_document"
									class="w-full h-[1200px] border rounded-lg"
									frameborder="0"
								></iframe>
							</div>
						</div>
					</div>
				</div>

				<!-- Items List -->
				<!-- Items List -->
<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Items</h2>
    <div class="flex items-center gap-2">
      <p class="text-sm text-gray-600">
        {{ quotationResource?.doc?.items?.length || 0 }} items
      </p>
      <Button v-if="isExporting" disabled variant="subtle" size="sm">
        <template #prefix>
          <FeatherIcon name="loader" class="w-4 h-4 animate-spin" />
        </template>
        Exporting...
      </Button>
      <Button v-else variant="subtle" size="sm" @click="exportToExcel">
        <template #prefix>
          <FeatherIcon name="download" class="w-4 h-4" />
        </template>
        Export
      </Button>
    </div>
  </div>

  <div class="overflow-x-auto">
    <!-- Table Header -->
    <div class="border-b min-w-[800px]">
      <div class="flex items-center px-6 py-2">
        <div class="flex-1 grid grid-cols-8 gap-4">
          <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FeatherIcon name="box" class="w-4 h-4" />
            Item
          </div>
          <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
            <FeatherIcon name="maximize-2" class="w-4 h-4" />
            Dimensions
          </div>
          <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
            <FeatherIcon name="square" class="w-4 h-4" />
            Area
          </div>
          <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
            <FeatherIcon name="tag" class="w-4 h-4" />
            Rate
          </div>
          <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
            <FeatherIcon name="hash" class="w-4 h-4" />
            Qty
          </div>
          <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
            <FeatherIcon name="dollar-sign" class="w-4 h-4" />
            Net Amount
          </div>
          <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
            VAT
          </div>
          <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
            Total
          </div>
        </div>
      </div>
    </div>

    <!-- Table Body -->
    <div class="divide-y">
      <template v-if="quotationResource?.doc?.items?.length">
        <div 
          v-for="item in quotationResource.doc.items" 
          :key="item.name"
          class="hover:bg-gray-50 transition-colors min-w-[800px]"
        >
          <div class="flex items-center px-6 py-3">
            <div class="flex-1 grid grid-cols-8 gap-4">
              <!-- Item Name with Description Tooltip -->
              <div>
                <Tooltip
                  :text="item.description"
                  :hover-delay="1"
                  placement="top"
                >
                  <div class="text-sm text-gray-900">
                    {{ item.item_name }}
                  </div>
                </Tooltip>
              </div>
              <!-- Dimensions -->
              <div class="text-sm text-gray-600 text-right">
                {{ formatNumber(item.width) }} x {{ formatNumber(item.height) }}
              </div>
              <!-- Area -->
              <div class="text-sm text-gray-600 text-right">
                {{ formatNumber(item.area) }}
              </div>
              <!-- Rate -->
              <div class="text-sm text-gray-600 text-right">
                {{ formatCurrency(item.amount) }}
              </div>
              <!-- Qty -->
              <div class="text-sm text-gray-600 text-right">
                {{ item.qty }}
              </div>
              <!-- Net Amount -->
              <div class="text-sm text-gray-900 font-medium text-right">
                {{ formatCurrency(item.total) }}
              </div>
              <!-- VAT -->
              <div class="text-sm text-gray-600 text-right">
                {{ formatCurrency(item.vat_amount) }}
              </div>
              <!-- Total -->
              <div class="text-sm text-gray-900 font-medium text-right">
                {{ formatCurrency(item.grand_total) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Totals Row -->
        <div class="bg-gray-50 min-w-[800px]">
          <div class="flex items-center px-6 py-3">
            <div class="flex-1 grid grid-cols-8 gap-4">
              <div class="col-span-5 text-sm font-medium text-gray-900 text-right">
                Totals:
              </div>
              <div class="text-sm font-medium text-gray-900 text-right">
                {{ formatCurrency(quotationResource.doc.total) }}
              </div>
              <div class="text-sm font-medium text-gray-900 text-right">
                {{ formatCurrency(quotationResource.doc.vat_amount) }}
              </div>
              <div class="text-sm font-medium text-gray-900 text-right">
                {{ formatCurrency(quotationResource.doc.grand_total) }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <div 
        v-else 
        class="flex flex-col items-center justify-center py-12 min-w-[800px]"
      >
        <FeatherIcon 
          name="box" 
          class="w-12 h-12 text-gray-400 mb-4" 
        />
        <p class="text-base font-medium text-gray-900">No Items Found</p>
        <p class="text-sm text-gray-600">This quotation has no items.</p>
      </div>
    </div>
  </div>
</div>
			</div>
		</template>
	</div>
</template>

<script setup>
import { h, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createDocumentResource } from 'frappe-ui'
import {
	Button,
	Card,
	Badge,
	FeatherIcon,
	Tooltip,
	Dropdown,
	Dialog,
	FormControl,
	Textarea,
	FileUploader,
} from 'frappe-ui'
import { inject } from 'vue'

const $socket = inject('$socket')

const props = defineProps({
	projectResource: {
		type: Object,
		required: true,
	},
})

const route = useRoute()
const router = useRouter()
const isExporting = ref(false)
const quotationResource = ref(null)
const showStatusDialog = ref(false)
const isClosing = ref(false)
const newStatus = ref('')
const statusError = ref('')
const signedDocument = ref(null)
const uploadedResult = ref(null)
const isUpdatingStatus = ref(false)
const rejectReason = ref('')
const initialStatus = ref('')
const partyImage = ref(null)
const partyResource = ref(null)

const radioClasses = {
	container:
		'relative flex items-center p-4 cursor-pointer rounded-lg border hover:border-gray-500 transition-colors',
	input: 'peer absolute opacity-0 w-full h-full cursor-pointer',
	radio: 'w-5 h-5 border-2 rounded-full peer-checked:border-gray-900 peer-checked:border-8 transition-all',
	label: 'ml-3 text-sm font-medium text-gray-900 peer-checked:text-gray-900',
}

// Get available status transitions based on current status
const getAvailableStatuses = (currentStatus) => {
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

const getStatusVariant = (status) => {
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

const handleUploadSuccess = (result) => {
	uploadedResult.value = result
}

const handleDrop = (event, openFileSelector) => {
	const file = event.dataTransfer.files[0]
	if (file && file.type === 'application/pdf') {
		openFileSelector(event)
	}
}

const resetStatusDialog = () => {
	showStatusDialog.value = false
	isClosing.value = false
	newStatus.value = ''
	statusError.value = ''
	signedDocument.value = null
	uploadedResult.value = null
	rejectReason.value = ''
	initialStatus.value = ''
}

async function updateStatus() {
	statusError.value = ''

	// Check if status change is allowed
	const availableStatuses = getAvailableStatuses(quotationResource.value?.doc?.status)
	if (!availableStatuses.includes(newStatus.value)) {
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
		//console.error('Failed to update status:', error)
		statusError.value = 'Failed to update status'
	} finally {
		isUpdatingStatus.value = false
	}
}

const formatNumber = (value) => {
	if (!value) return '0'

	// Extract number and unit using regex
	const matches = value.toString().match(/^([\d.]+)\s*(.*)$/)
	if (!matches) return value

	const [, numberStr, unit] = matches
	const num = Number(numberStr)

	// Check if it has decimals
	const hasDecimals = num % 1 !== 0

	return `${num.toLocaleString(undefined, {
		minimumFractionDigits: hasDecimals ? 2 : 0,
		maximumFractionDigits: 2,
	})}${unit ? ' ' + unit : ''}`
}

const formatCurrency = (value) => {
	if (!value) return 'AED 0'

	// Convert to number and check if it has decimals
	const num = Number(value)
	const hasDecimals = num % 1 !== 0

	return `AED ${num.toLocaleString(undefined, {
		minimumFractionDigits: hasDecimals ? 2 : 0,
		maximumFractionDigits: 2,
	})}`
}

const formatDate = (dateString, formatAsOrdinal = false) => {
	if (!dateString) return ''

	const date = new Date(dateString)

	// Helper function to add ordinal suffix to the day of the month
	const getOrdinalSuffix = (day) => {
		const suffixes = ['th', 'st', 'nd', 'rd']
		const relevantDigit = day % 10
		const exception = day % 100 >= 11 && day % 100 <= 13
		return day + (exception ? 'th' : suffixes[relevantDigit] || 'th')
	}

	if (formatAsOrdinal) {
		const dayWithOrdinal = getOrdinalSuffix(date.getDate())
		return `${date.toLocaleString('en-US', { weekday: 'long' })}, ${dayWithOrdinal} of ${date.toLocaleString('en-US', { month: 'long' })}, ${date.getFullYear()}`
	}

	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

const loadScript = (url) => {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = url
		script.onload = resolve
		script.onerror = reject
		document.head.appendChild(script)
	})
}

const exportToExcel = async () => {
	//console.log('Starting export process...')
	//console.log('Quotation resource:', quotationResource?.value?.doc)
	
	if (!quotationResource?.value?.doc?.items?.length) {
		//console.log('No items found in quotation, returning early')
		return
	}

	isExporting.value = true
	try {
		//console.log('Attempting to load XLSX library...')
		// Load XLSX from CDN if not already loaded
		if (!window.XLSX) {
			//console.log('XLSX not found in window, loading from CDN...')
			await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js')
			//console.log('XLSX library loaded successfully')
		} else {
			//console.log('XLSX already loaded in window')
		}
		const XLSX = window.XLSX
		//console.log('XLSX reference obtained:', !!XLSX)

		//console.log('Starting data preparation...')
		// Prepare the data for export
		//console.log('Raw items:', quotationResource.value.doc.items)
		const items = quotationResource.value.doc.items.map(item => ({
			'Item Name': item.item_name,
			'Description': item.description,
			'Dimensions': `${formatNumber(item.width)} x ${formatNumber(item.height)}`,
			'Area': formatNumber(item.area),
			'Rate': formatCurrency(item.amount).replace('AED ', ''),
			'Quantity': item.qty,
			'Net Amount': formatCurrency(item.total).replace('AED ', ''),
			'VAT': formatCurrency(item.vat_amount).replace('AED ', ''),
			'Total': formatCurrency(item.grand_total).replace('AED ', '')
		}))

		// Add summary rows
		items.push(
			{}, // Empty row for spacing
			{
				'Item Name': 'Summary',
				'Description': '',
				'Dimensions': '',
				'Area': '',
				'Rate': '',
				'Quantity': '',
				'Net Amount': formatCurrency(quotationResource.value.doc.total).replace('AED ', ''),
				'VAT': formatCurrency(quotationResource.value.doc.vat_amount).replace('AED ', ''),
				'Total': formatCurrency(quotationResource.value.doc.grand_total).replace('AED ', '')
			}
		)

		//console.log('Prepared items for export:', items)

		// Create worksheet
		//console.log('Creating worksheet...')
		const ws = XLSX.utils.json_to_sheet(items)
		//console.log('Worksheet created successfully')

		// Set column widths
		const colWidths = [
			{ wch: 20 }, // Item Name
			{ wch: 30 }, // Description
			{ wch: 15 }, // Dimensions
			{ wch: 10 }, // Area
			{ wch: 12 }, // Rate
			{ wch: 10 }, // Quantity
			{ wch: 15 }, // Net Amount
			{ wch: 15 }, // VAT
			{ wch: 15 }, // Total
		]
		ws['!cols'] = colWidths

		// Create workbook
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, 'Quotation Items')

		// Add metadata
		wb.Props = {
			Title: `Quotation ${quotationResource.value.doc.name}`,
			Subject: `Quotation for ${quotationResource.value.doc.party}`,
			Author: quotationResource.value.doc.owner,
			CreatedDate: new Date(quotationResource.value.doc.creation)
		}

		//console.log('Generating Excel file...')
		// Generate Excel file
		const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
		//console.log('Excel buffer generated successfully')
		const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
		
		// Create download link and trigger download
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `${quotationResource.value.doc.name}_Items.xlsx`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)

		//console.log('File download triggered')
		
	} catch (err) {
		//console.error('Error exporting to Excel:', err)
	} finally {
		isExporting.value = false
	}
}

const downloadPDF = async () => {
	try {
		// Implementation for PDF download
		const response = await fetch(`/api/method/frappe.utils.print_format.download_pdf`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				doctype: 'RUA Quotation',
				name: quotationResource.value.doc.name,
				format: 'Standard', // or your custom print format name
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
		//console.error('Error downloading PDF:', error)
	}
}

const printQuotation = () => {
	// Get the base URL and change the port if it's localhost:8080
	let baseUrl = window.location.origin

	// Check if the current origin has the port 8080, and change it to 8000
	if (window.location.hostname === 'localhost' && window.location.port === '8080') {
		baseUrl = `http://${window.location.hostname}:8000`
	}

	// Create the print preview URL
	const url = `${baseUrl}/printview?doctype=RUA Quotation&name=${quotationResource.value.doc.name}&format=Standard&no_letterhead=0&_lang=en`

	// Open the print preview in a new tab
	window.open(url, '_blank')
}

// Watch for route changes to reload data
// Watch for route changes to reload data
watch(
  () => route.params.quotationId,
  (newId) => {
    if (newId && $socket?.connected) {
      console.log('Initializing quotation resource with socket connection')
      quotationResource.value = createDocumentResource(
        {
          doctype: 'RUA Quotation',
          name: newId,
          auto: true,
          realtime: true,
          socket: $socket // Pass socket in options
        },
        { $socket } // Pass vm context with socket
      )
      console.log('Quotation Resource:', quotationResource.value)
    }
  },
  { immediate: true }
)

// Watch for party changes
watch(
  () => quotationResource.value?.doc?.party,
  (newParty) => {
    if (newParty && $socket?.connected) {
      console.log('Initializing party resource with socket connection')
      partyResource.value = createDocumentResource({
        doctype: 'RUA Party',
        name: newParty,
        auto: true,
        fields: ['name', 'image'],
        realtime: true, // Enable realtime updates
        socket: $socket, // Pass socket in options
        transform(doc) {
          return doc
        }
      }, 
      { $socket }) // Pass vm context with socket
    } else {
      partyResource.value = null
    }
  },
  { immediate: true }
)

// Add socket connection watcher to reinitialize resources when socket connects
watch(
  () => $socket?.connected,
  (isConnected) => {
    if (isConnected) {
      // Reinitialize quotation resource if we have an ID
      if (route.params.quotationId) {
        quotationResource.value = createDocumentResource(
          {
            doctype: 'RUA Quotation',
            name: route.params.quotationId,
            auto: true,
            realtime: true,
            socket: $socket
          },
          { $socket }
        )
      }
      
      // Reinitialize party resource if we have a party
      if (quotationResource.value?.doc?.party) {
        partyResource.value = createDocumentResource({
          doctype: 'RUA Party',
          name: quotationResource.value.doc.party,
          auto: true,
          fields: ['name', 'image'],
          realtime: true,
          socket: $socket,
          transform(doc) {
            return doc
          }
        }, 
        { $socket })
      }
    }
  }
)
</script>
