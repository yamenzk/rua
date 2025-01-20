# LPOItems.vue
<template>
	<div class="space-y-4">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-semibold">Items</h2>
			<div class="flex items-center gap-2">
				<p class="text-sm text-gray-600">{{ localItems?.length || 0 }} items</p>

				<!-- Actions -->
				<div class="flex items-center gap-2">
					<!-- Save Changes Button -->
					<Button
						v-if="hasChanges && isDraft"
						variant="solid"
						size="sm"
						theme="primary"
						:loading="updateLPOItems.loading"
						:disabled="updateLPOItems.loading"
						@click="saveItems"
					>
						<template #prefix>
							<FeatherIcon name="save" class="w-4 h-4" />
						</template>
						{{ updateLPOItems.loading ? 'Saving...' : 'Save Changes' }}
					</Button>

					<!-- Add Row Button -->
					<Button v-if="isDraft" variant="subtle" size="sm" @click="addNewRow">
						<template #prefix>
							<FeatherIcon name="plus" class="w-4 h-4" />
						</template>
						Add Row
					</Button>

					<!-- Excel Paste Button -->
					<Button v-if="isDraft" variant="subtle" size="sm" @click="startPaste" class="hidden md:flex">
						<template #prefix>
							<FeatherIcon name="clipboard" class="w-4 h-4" />
						</template>
						Paste from Excel
					</Button>
				</div>
			</div>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto">
			<!-- Table Header -->
			<div class="border-b min-w-[800px]">
				<div class="flex items-center px-6 py-2">
					<div class="flex-1 grid items-center gap-2" :class="gridColsClass">
						<!-- Common Columns -->
						<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
							<FeatherIcon name="box" class="w-4 h-4" />
							Item
						</div>

						<!-- Type-specific Columns -->
						<template v-if="type === 'Glass'">
							<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
								Description
							</div>
							<div
								class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end"
							>
								<FeatherIcon name="square" class="w-4 h-4" />
								Area
							</div>
						</template>

						<template v-if="type === 'Material'">
							<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
								Description
							</div>
						</template>

						<!-- Common Columns -->
						<div
							class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end"
						>
							<FeatherIcon name="hash" class="w-4 h-4" />
							Qty
						</div>
						<div
							class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end"
						>
							<FeatherIcon name="tag" class="w-4 h-4" />
							Unit Price
						</div>
						<div
							class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end"
						>
							Amount
						</div>
						<div
							class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end"
						>
							VAT
						</div>
						<div
							class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end"
						>
							Total
						</div>

						<!-- Actions Column -->
						<template v-if="isDraft">
							<div class="w-10"></div>
						</template>
					</div>
				</div>
			</div>

			<!-- Table Body -->
			<div class="divide-y">
				<template v-if="localItems?.length">
					<!-- Items -->
					<div
						v-for="(item, index) in localItems"
						:key="index"
						class="hover:bg-gray-50 transition-colors min-w-[800px]"
					>
						<div class="flex items-center px-6 py-3">
							<div class="flex-1 grid items-center gap-2" :class="gridColsClass">
								<!-- Common Fields -->
								<div>
									<input
										v-if="isDraft"
										type="text"
										v-model="item.item"
										class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900"
										placeholder="Item name"
										@input="debouncedInput"
									/>
									<div v-else class="text-sm text-gray-900">
										{{ item.item }}
									</div>
								</div>

								<!-- Type-specific Fields -->
								<template v-if="type === 'Glass'">
									<div>
										<input
											v-if="isDraft"
											type="text"
											v-model="item.description"
											class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900"
											placeholder="Description"
											@input="debouncedInput"
										/>
										<div v-else class="text-sm text-gray-600">
											{{ item.description }}
										</div>
									</div>
									<div>
										<input
											v-if="isDraft"
											type="number"
											v-model.number="item.area"
											class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-right"
											step="any"
											@input="debouncedInput"
										/>
										<div v-else class="text-sm text-gray-600 text-right">
											{{ formatNumber(item.area) }}
										</div>
									</div>
								</template>

								<template v-if="type === 'Material'">
									<div>
										<input
											v-if="isDraft"
											type="text"
											v-model="item.description"
											class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900"
											placeholder="Description"
											@input="debouncedInput"
										/>
										<div v-else class="text-sm text-gray-600">
											{{ item.description }}
										</div>
									</div>
								</template>

								<!-- Common Fields -->
								<div>
									<input
										v-if="isDraft"
										type="number"
										v-model.number="item.qty"
										class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-right"
										step="any"
										@input="debouncedInput"
									/>
									<div v-else class="text-sm text-gray-600 text-right">
										{{ item.qty }}
									</div>
								</div>
								<div>
									<input
										v-if="isDraft"
										type="number"
										v-model.number="item.unit_price"
										class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-right"
										step="any"
										@input="debouncedInput"
									/>
									<div v-else class="text-sm text-gray-600 text-right">
										{{ formatCurrency(item.unit_price) }}
									</div>
								</div>

								<!-- Computed Values -->
								<div class="text-sm text-gray-900 font-medium text-right">
									{{ formatCurrency(itemTotals[index]?.totalAmount) }}
								</div>
								<div class="text-sm text-gray-600 text-right">
									{{ formatCurrency(itemTotals[index]?.vatAmount) }}
								</div>
								<div class="text-sm text-gray-900 font-medium text-right">
									{{ formatCurrency(itemTotals[index]?.grandTotal) }}
								</div>

								<!-- Actions -->
								<template v-if="isDraft">
									<div class="flex justify-center">
										<button
											type="button"
											class="text-gray-400 hover:text-red-500"
											@click="removeRow(index)"
										>
											<FeatherIcon name="trash-2" class="w-4 h-4" />
										</button>
									</div>
								</template>
							</div>
						</div>
					</div>

					<!-- Totals Row -->
					<div class="bg-gray-50 min-w-[800px]">
						<div class="flex items-center px-6 py-3">
							<div class="flex-1 grid items-center" :class="gridColsClass">
								<!-- Spacing based on type -->
								<template v-if="type === 'Glass'">
									<div
										class="col-span-5 text-sm font-medium text-gray-900 text-right"
									>
										Totals:
									</div>
								</template>
								<template v-else-if="type === 'Material'">
									<div
										class="col-span-4 text-sm font-medium text-gray-900 text-right"
									>
										Totals:
									</div>
								</template>
								<template v-else>
									<div
										class="col-span-3 text-sm font-medium text-gray-900 text-right"
									>
										Totals:
									</div>
								</template>

								<!-- Total Amounts -->
								<div class="text-sm font-medium text-gray-900 text-right">
									{{ formatCurrency(totals.totalAmount) }}
								</div>
								<div class="text-sm font-medium text-gray-900 text-right">
									{{ formatCurrency(totals.vatAmount) }}
								</div>
								<div class="text-sm font-medium text-gray-900 text-right">
									{{ formatCurrency(totals.grandTotal) }}
								</div>

								<!-- Extra column for actions if in draft -->
								<template v-if="isDraft">
									<div></div>
								</template>
							</div>
						</div>
					</div>
				</template>

				<!-- Empty State -->
				<div v-else class="flex flex-col items-center justify-center py-12 min-w-[800px]">
					<FeatherIcon name="box" class="w-12 h-12 text-gray-400 mb-4" />
					<p class="text-base font-medium text-gray-900">No Items Found</p>
					<p class="text-sm text-gray-600">
						{{
							isDraft
								? 'Click "Add Row" or paste from Excel to add items.'
								: 'This purchase order has no items.'
						}}
					</p>
				</div>
			</div>
		</div>

		<!-- Dialog for Paste -->
		<Dialog v-model="showPasteDialog" :options="pasteDialogOptions">
			<template #body-content>
				<div class="space-y-4">
					<textarea
						v-model="pasteContent"
						class="w-full h-40 p-2 border rounded-md font-mono text-sm"
						placeholder="Paste your Excel data here..."
					></textarea>
					<div class="text-sm text-gray-600">
						Paste your data in the format:<br />
						Item Name[tab]Description[tab]{{
							type === 'Glass' ? 'Area[tab]' : ''
						}}Qty[tab]Unit Price
					</div>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Button, FeatherIcon, Dialog, debounce, createResource } from 'frappe-ui'
import { formatNumber, formatCurrency } from '@/utils/format'

const props = defineProps({
	items: {
		type: Array,
		default: () => [],
	},
	type: {
		type: String,
		required: true,
		validator: (value) => ['Glass', 'Material', 'Aluminum'].includes(value),
	},
	status: {
		type: String,
		required: true,
	},
	lpoName: {
		type: String,
		required: true,
	},
})

const emit = defineEmits(['update:items', 'save', 'save-error', 'save-success'])

// State
const localItems = ref(JSON.parse(JSON.stringify(props.items)))
const originalItems = ref(JSON.parse(JSON.stringify(props.items)))
const showPasteDialog = ref(false)
const pasteContent = ref('')

// Computed
const isDraft = computed(() => props.status === 'Draft')

const gridColsClass = computed(() => {
	const baseColumns = isDraft.value ? 1 : 0 // Action column
	switch (props.type) {
		case 'Glass':
			return `grid-cols-${8 + baseColumns}` // item, description, area, qty, unit_price, amount, vat, total, [action]
		case 'Material':
			return `grid-cols-${7 + baseColumns}` // item, description, qty, unit_price, amount, vat, total, [action]
		case 'Aluminum':
			return `grid-cols-${6 + baseColumns}` // item, qty, unit_price, amount, vat, total, [action]
		default:
			return `grid-cols-${6 + baseColumns}`
	}
})

const hasChanges = computed(() => {
  // Deep comparison of the arrays
  return JSON.stringify(localItems.value.map(item => ({
    ...item,
    // Only include the fields we care about
    item: item.item,
    description: item.description,
    area: item.area,
    qty: item.qty,
    unit_price: item.unit_price
  }))) !== JSON.stringify(originalItems.value.map(item => ({
    ...item,
    item: item.item,
    description: item.description,
    area: item.area,
    qty: item.qty,
    unit_price: item.unit_price
  })))
})

const itemTotals = computed(() =>
	localItems.value.map((item) => {
		const totalAmount = (item.qty || 0) * (item.unit_price || 0)
		const vatAmount = totalAmount * 0.05
		const grandTotal = totalAmount + vatAmount
		return {
			totalAmount,
			vatAmount,
			grandTotal,
		}
	}),
)

const totals = computed(() => {
	return itemTotals.value.reduce(
		(acc, item) => ({
			totalAmount: acc.totalAmount + item.totalAmount,
			vatAmount: acc.vatAmount + item.vatAmount,
			grandTotal: acc.grandTotal + item.grandTotal,
		}),
		{ totalAmount: 0, vatAmount: 0, grandTotal: 0 },
	)
})

const updateLPOItems = createResource({
	url: 'rua.api.update_lpo_items',
	validate(values) {
		if (!values.items?.length) {
			return 'No items to save'
		}
		return null
	},
})

// Dialog Options
const pasteDialogOptions = computed(() => ({
	title: 'Paste from Excel',
	size: 'lg',
	actions: [
		{
			label: 'Cancel',
			variant: 'subtle',
			onClick: () => {
				showPasteDialog.value = false
				pasteContent.value = ''
			},
		},
		{
			label: 'Apply',
			onClick: handlePasteContent,
		},
	],
}))

// Methods
const debouncedInput = debounce(() => {
	emit('update:items', localItems.value)
}, 500)

function addNewRow() {
	const newRow = {
		item: '',
		qty: '',
		unit_price: '',
	}

	if (['Glass', 'Material'].includes(props.type)) {
		newRow.description = ''
	}

	if (props.type === 'Glass') {
		newRow.area = ''
	}

	localItems.value.push(newRow)
	debouncedInput()
}

function removeRow(index) {
	localItems.value.splice(index, 1)
	debouncedInput()
}

function startPaste() {
	showPasteDialog.value = true
}

function handlePasteContent() {
	const rows = pasteContent.value
		.split('\n')
		.map((row) => row.split('\t').map((cell) => cell.trim()))
		.filter((row) => row.some((cell) => cell.length > 0))

	// Remove header row if it exists
	if (
		rows.length > 0 &&
		rows[0].some(
			(cell) =>
				cell.toLowerCase().includes('name') ||
				cell.toLowerCase().includes('qty') ||
				cell.toLowerCase().includes('unit'),
		)
	) {
		rows.shift()
	}

	if (!rows.length) return

	const newItems = rows.map((row) => {
		const item = {
			item: row[0] || '',
			description: row[1] || '',
			qty: parseFloat(row[3]) || 0,
			unit_price: parseFloat(row[4]) || 0,
		}

		if (props.type === 'Glass') {
			item.area = parseFloat(row[2]) || 0
		}

		return item
	})

	localItems.value = newItems
	debouncedInput()
	showPasteDialog.value = false
	pasteContent.value = ''
}

async function saveItems() {
	try {
		const response = await updateLPOItems.submit({
			lpo_name: props.lpoName,
			items: localItems.value,
		})

		// Update original items to match current state
		originalItems.value = JSON.parse(JSON.stringify(localItems.value))

		emit('save-success', response)
	} catch (error) {
		console.error('Error saving items:', error)
		emit('save-error', error)
	}
}

// Warn user about unsaved changes
function handleBeforeUnload(e) {
	if (hasChanges.value) {
		e.preventDefault()
		e.returnValue = ''
	}
}

watch(() => props.items, (newItems) => {
  localItems.value = JSON.parse(JSON.stringify(newItems))
  originalItems.value = JSON.parse(JSON.stringify(newItems))
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
	window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
	window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>
