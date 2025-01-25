# QuotationsTab.vue
<template>
	<div class="bg-white rounded-lg border">
		<!-- Header -->
		<div class="flex items-center justify-between mt-6 mb-4 px-6">
			<h2 class="text-lg font-medium text-gray-900">Quotations</h2>
			<Button variant="solid" size="sm" @click="handleNewQuotation">
				<template #default>
					<div class="flex items-center gap-2">
						<FeatherIcon name="plus" class="w-4 h-4" />
						<span>New</span>
					</div>
				</template>
			</Button>
		</div>

		<!-- Quotations Table -->
		<div v-if="quotationResource.loading" class="flex justify-center py-12">
			<LoadingIndicator />
		</div>

		<div v-else class="overflow-x-auto min-h-[60vh]">
			<!-- Table Header -->
			<div class="border-b min-w-[800px]">
				<div class="flex items-center px-6 py-2">
					<div class="flex-1 grid grid-cols-5 gap-4">
						<div
							class="flex items-center gap-2 text-sm font-medium text-gray-700 col-span-2"
						>
							<FeatherIcon name="user" class="w-4 h-4" />
							Party
						</div>
						<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<FeatherIcon name="dollar-sign" class="w-4 h-4" />
							Grand Total
						</div>
						<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<FeatherIcon name="check-circle" class="w-4 h-4" />
							Status
						</div>
						<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<FeatherIcon name="info" class="w-4 h-4" />
							Additional Info
						</div>
					</div>
				</div>
			</div>

			<!-- Table Body -->
			<div class="divide-y">
				<template
					v-for="status in ['Final', 'Submitted', 'Draft', 'Rejected']"
					:key="status"
				>
					<template v-if="quotationsByStatus[status]?.length">
						<!-- Status Group Header -->
						<div
							class="group bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer px-6 py-2 min-w-[800px]"
							@click="toggleStatusCollapse(status)"
						>
							<div class="flex items-center gap-2">
								<FeatherIcon
									:name="
										statusCollapsed[status] ? 'chevron-right' : 'chevron-down'
									"
									class="w-4 h-4 text-gray-500"
								/>
								<Badge
									:variant="
										getStatusVariant(status) === 'gray' ? 'solid' : 'subtle'
									"
									:theme="getStatusVariant(status)"
								>
									{{ status }}
								</Badge>
								<span class="text-sm text-gray-600">
									({{ quotationsByStatus[status]?.length || 0 }})
								</span>
							</div>
						</div>

						<!-- Quotations in this status -->
						<template v-if="!statusCollapsed[status]">
							<div
								v-for="quotation in quotationsByStatus[status]"
								:key="quotation.name"
								class="hover:bg-gray-50 transition-colors cursor-pointer min-w-[800px]"
								@click="navigateToQuotation(quotation)"
							>
								<div class="flex items-center px-6 py-3">
									<div class="flex-1 grid grid-cols-5 gap-4">
										<!-- Party -->
										<div class="flex col-span-2">
											<Avatar
												v-if="getPartyData(quotation.party)?.image"
												:image="getPartyData(quotation.party)?.image"
												size="3xl"
												shape="square"
												class="mr-2 border border-gray-300"
											/>
											<div class="flex flex-col">
												<div class="flex items-center gap-2">
													<div class="text-sm text-gray-900">
														{{ quotation.party }}
													</div>
												</div>
												<div
													class="text-sm text-gray-500 flex items-center"
												>
													{{ quotation.name }}
												</div>
												<div
													class="text-sm text-gray-400 flex items-center"
												>
												{{ formatDate(quotation.date) }}
												</div>
											</div>
										</div>

										<!-- Grand Total -->
										<div
											class="text-sm text-gray-900 font-medium flex items-center"
										>
											{{ formatCurrency(quotation.grand_total) }}
										</div>
										<!-- Status -->
										<div class="flex items-center">
											<Badge
												:variant="
													getStatusVariant(quotation.status) === 'gray'
														? 'solid'
														: 'subtle'
												"
												:theme="getStatusVariant(quotation.status)"
											>
												{{ quotation.status }}
											</Badge>
										</div>
										<!-- Additional Info -->
										<div class="flex items-center">
											<div
												v-if="
													quotation.status === 'Final' &&
													quotation.signed_document
												"
												class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
												@click="
													openSignedDocument(
														quotation.signed_document,
														$event,
													)
												"
											>
												<FeatherIcon name="file-text" class="w-4 h-4" />
												View Signed Document
											</div>
											<div
												v-if="
													quotation.status === 'Rejected' &&
													quotation.reject_reason
												"
												class="text-sm text-gray-600 italic"
											>
												{{ quotation.reject_reason }}
											</div>
										</div>
									</div>
								</div>
							</div>
						</template>
					</template>
				</template>

				<!-- Empty State -->
				<div
					v-if="!filteredQuotations.length"
					class="flex flex-col items-center justify-center py-12 min-w-[800px]"
				>
					<FeatherIcon name="file-text" class="w-12 h-12 text-gray-400 mb-4" />
					<p class="text-base font-medium text-gray-900">No Quotations Found</p>
					<p class="text-sm text-gray-600">There are no quotations created yet.</p>
				</div>
			</div>
		</div>

		<!-- Warning Dialogs -->
		<Dialog
			v-if="showNoClientDialog"
			v-model="showNoClientDialog"
			:options="noClientDialogOptions"
		/>

		<Dialog
			v-if="showNotLockedDialog"
			v-model="showNotLockedDialog"
			:options="notLockedDialogOptions"
		/>

		<!-- New Quotation Dialog -->
		<Dialog v-model="showNewQuotationDialog" :options="newQuotationDialogOptions">
			<template #body-content>
				<div class="space-y-4">
					<DatePicker
						v-model="newQuotation.date"
						label="Date"
						:default-value="newQuotation.date"
						:format="formatDate"
					/>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
	Avatar,
	Badge,
	FeatherIcon,
	Button,
	Dialog,
	DatePicker,
	createResource,
	LoadingIndicator,
} from 'frappe-ui'

import { quotationResource } from '@/data/quotation'
import { partyResource } from '@/data/party'
import { getServerDate, formatCurrency, formatDate } from '@/utils/format'

const router = useRouter()

const props = defineProps({
	projectResource: {
		type: Object,
		required: true,
		validator: (value) => {
			return value && typeof value === 'object' && 'doc' in value
		},
	},
})

// State
const showNewQuotationDialog = ref(false)
const showNoClientDialog = ref(false)
const showNotLockedDialog = ref(false)
const newQuotation = ref({
  date: getServerDate(),
})
const statusCollapsed = ref({
	Final: false,
	Submitted: false,
	Draft: false,
	Rejected: true,
})


// Computed
const filteredQuotations = computed(() => {
	return (
		quotationResource.data?.filter((q) => q.project === props.projectResource.doc?.name) || []
	)
})

const quotationsByStatus = computed(() => {
	if (!filteredQuotations.value?.length) return {}

	return filteredQuotations.value.reduce((acc, quotation) => {
		const status = quotation.status || 'Draft'
		if (!acc[status]) {
			acc[status] = []
		}
		acc[status].push(quotation)
		return acc
	}, {})
})

// Dialog Options
const noClientDialogOptions = computed(() => ({
	title: 'Missing Client',
	message:
		'A client must be added to the project before creating a quotation. Please add a client from the project overview page.',
	size: 'sm',
	icon: {
		name: 'alert-triangle',
		appearance: 'warning',
	},
	actions: [
		{
			label: 'Go to Overview',
			variant: 'solid',
			theme: 'warning',
			onClick: () => {
				router.push(`/project/${props.projectResource.doc.name}/overview`)
			},
		},
		{
			label: 'Close',
			variant: 'subtle',
			onClick: () => (showNoClientDialog.value = false),
		},
	],
}))

const notLockedDialogOptions = computed(() => ({
	title: 'Items Not Locked',
	message:
		'The project items must be locked before creating a quotation. Please lock the items from the Items page.',
	size: 'sm',
	icon: {
		name: 'alert-triangle',
		appearance: 'warning',
	},
	actions: [
		{
			label: 'Go to Items',
			variant: 'solid',
			theme: 'warning',
			onClick: () => {
				router.push(`/project/${props.projectResource.doc.name}/items`)
			},
		},
		{
			label: 'Close',
			variant: 'subtle',
			onClick: () => (showNotLockedDialog.value = false),
		},
	],
}))

const newQuotationDialogOptions = computed(() => ({
	title: 'New Quotation',
	size: 'lg',
	actions: [
		{
			label: 'Create',
			variant: 'solid',
			onClick: createQuotation,
			loading: quotationResource.insert?.loading,
		},
	],
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

function toggleStatusCollapse(status) {
	statusCollapsed.value[status] = !statusCollapsed.value[status]
}

function getPartyData(partyName) {
	return partyResource.data?.find((p) => p.name === partyName)
}

function navigateToQuotation(quotation) {
	router.push({
		name: 'QuotationDetails',
		params: {
			id: props.projectResource.doc.name,
			quotationId: quotation.name,
		},
	})
}

function validateAndShowQuotationDialog() {
	const parties = getProjectParties()
	const hasClient = parties.some((party) => party.type.toLowerCase() === 'client')

	if (!hasClient) {
		showNoClientDialog.value = true
		return
	}

	const isLocked = checkProjectLocked()
	if (!isLocked) {
		showNotLockedDialog.value = true
		return
	}

	showNewQuotationDialog.value = true
}

function getProjectParties() {
	try {
		return props.projectResource.doc?.parties
			? typeof props.projectResource.doc.parties === 'string'
				? JSON.parse(props.projectResource.doc.parties)
				: props.projectResource.doc.parties
			: []
	} catch (error) {
		console.error('Error parsing parties:', error)
		return []
	}
}

function checkProjectLocked() {
	const locked = props.projectResource.doc?.locked || ''
	return locked && locked !== '' && locked !== '[]' && locked !== '{}'
}

function handleNewQuotation() {
	validateAndShowQuotationDialog()
}

function openSignedDocument(url, event) {
	event.preventDefault()
	event.stopPropagation()
	window.open(url, '_blank', 'noopener,noreferrer')
}

async function createQuotation() {
	if (!props.projectResource.doc?.name) return

	try {
		const parties = getProjectParties()
		const clientParty = parties.find((party) => party.type.toLowerCase() === 'client')

		if (!clientParty) {
			console.error('Client party not found')
			return
		}

		const quotationDate = getServerDate()

		await quotationResource.insert.submit({
			project: props.projectResource.doc.name,
			date: quotationDate,
			party: clientParty.name,
			doctype: 'RUA Quotation',
		})

		showNewQuotationDialog.value = false
		newQuotation.value.date = getServerDate()
	} catch (error) {
		console.error('Failed to create quotation:', error)
	}
}
</script>
