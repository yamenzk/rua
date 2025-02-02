# PurchaseReceiptsTab.vue
<template>
	<div class="bg-white rounded-lg border">
		<!-- Header -->
		<div class="flex items-center justify-between mt-6 mb-4 px-6">
			<h2 class="text-lg font-medium text-gray-900">Purchase Receipts</h2>
		</div>

		<!-- Purchase Receipts Table -->
		<div v-if="purchaseReceiptResource.loading" class="flex justify-center py-12">
			<LoadingIndicator />
		</div>

		<div v-else class="overflow-x-auto min-h-[60vh]">
			<!-- Table Header -->
			<div class="border-b min-w-[800px]">
				<div class="flex items-center px-6 py-2">
					<div class="flex-1 grid grid-cols-6 gap-4">
						<div
							class="flex items-center gap-2 text-sm font-medium text-gray-700 col-span-2"
						>
							<FeatherIcon name="user" class="w-4 h-4" />
							Party
						</div>
						<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<FeatherIcon name="file-text" class="w-4 h-4" />
							Delivery Note
						</div>
						<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<FeatherIcon name="shopping-cart" class="w-4 h-4" />
							Purchase Order
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
				<template v-for="status in ['Received', 'Draft', 'Cancelled']" :key="status">
					<template v-if="getReceiptsByStatus(status)?.length">
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
									({{ getReceiptsByStatus(status)?.length || 0 }})
								</span>
							</div>
						</div>

						<!-- Receipts in this status -->
						<template v-if="!statusCollapsed[status]">
							<div
								v-for="receipt in getReceiptsByStatus(status)"
								:key="receipt.name"
								class="hover:bg-gray-50 transition-colors cursor-pointer min-w-[800px]"
								@click="navigateToReceipt(receipt)"
							>
								<div class="flex items-center px-6 py-3">
									<div class="flex-1 grid grid-cols-6 gap-4">
										<!-- Party -->
										<div class="flex col-span-2">
                      <Avatar
													v-if="getPartyData(receipt.party)?.image"
													:image="getPartyData(receipt.party)?.image"
													size="3xl"
													shape="square"
                          class="mr-2 border border-gray-300"
												/>
                      <div class="flex flex-col">
                        <div class="flex items-center gap-2">
                          <div class="text-sm text-gray-900">{{receipt.party}}</div>
                        </div>
                        <div
                          class="text-sm text-gray-500 flex items-center"
                        >
                          {{ receipt.name }}
                        </div>
                        <div
                          class="text-sm text-gray-400 flex items-center"
                        >
						{{ formatDate(receipt.date) }}
                        </div>
                      </div>
										</div>
										<!-- Delivery Note -->
										<div class="text-sm text-gray-900">
											{{ receipt.supplier_delivery_note }}
										</div>
										<!-- Purchase Order -->
										<div class="flex flex-col">
											<div
												class="text-sm text-blue-600 hover:text-blue-800"
												@click.stop="navigateToLPO(receipt.purchase_order)"
											>
												{{ receipt.purchase_order }}
											</div>
											<div
												v-if="receipt.supplier_lpo_ref"
												class="text-sm text-gray-400 flex items-center"
											>
												REF#{{ receipt.supplier_lpo_ref }}
											</div>
										</div>
										<!-- Status -->
										<div class="flex items-center">
											<Badge
												:variant="
													getStatusVariant(receipt.status) === 'gray'
														? 'solid'
														: 'subtle'
												"
												:theme="getStatusVariant(receipt.status)"
											>
												{{ receipt.status }}
											</Badge>
										</div>
										<!-- Additional Info -->
										<div class="flex items-center">
											<div
												v-if="
													receipt.status === 'Received' &&
													receipt.signed_delivery_note
												"
												class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
												@click.stop="
													openSignedDeliveryNote(
														receipt.signed_delivery_note,
													)
												"
											>
												<FeatherIcon name="file-text" class="w-4 h-4" />
												View Signed Note
											</div>
											<div
												v-if="
													receipt.status === 'Cancelled' &&
													receipt.remarks
												"
												class="text-sm text-gray-600 italic"
											>
												{{ receipt.remarks }}
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
					v-if="!filteredReceipts.length"
					class="flex flex-col items-center justify-center py-12 min-w-[800px]"
				>
					<FeatherIcon name="clipboard" class="w-12 h-12 text-gray-400 mb-4" />
					<p class="text-base font-medium text-gray-900">No Purchase Receipts Found</p>
					<p class="text-sm text-gray-600">
						There are no purchase receipts created yet.
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Avatar, Badge, FeatherIcon, LoadingIndicator } from 'frappe-ui'
import { purchaseReceiptResource } from '@/data/purchaseReceipt'
import { partyResource } from '@/data/party'
import { getServerDate, formatDate } from '@/utils/format'

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
const statusCollapsed = ref({
	Received: false,
	Draft: false,
	Cancelled: true,
})

// Computed
const filteredReceipts = computed(() => {
  return (
    purchaseReceiptResource.data?.filter(
      (receipt) => receipt.project === props.projectResource.doc?.name,
    ).sort((a, b) => new Date(b.date) - new Date(a.date)) || []
  )
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

function getReceiptsByStatus(status) {
	return filteredReceipts.value?.filter((receipt) => receipt.status === status) || []
}

function toggleStatusCollapse(status) {
	statusCollapsed.value[status] = !statusCollapsed.value[status]
}

function getPartyData(partyName) {
	return partyResource.data?.find((p) => p.name === partyName)
}

function navigateToReceipt(receipt) {
	router.push({
		name: 'PurchaseReceiptDetails',
		params: {
			id: props.projectResource.doc.name,
			receiptId: receipt.name,
		},
	})
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

function openSignedDeliveryNote(url) {
	window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
