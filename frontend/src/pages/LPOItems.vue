# LPOItems.vue
<template>
  <div class="bg-white">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between px-6 py-4 border-b">
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-500">{{ localItems?.length || 0 }} items</span>
      </div>

      <!-- Actions -->
	  <div v-if="!isDraft">
        <Button 
        v-if="isExporting" 
        disabled 
        variant="subtle" 
        size="sm"
        class="flex items-center gap-2"
      >
        <FeatherIcon name="loader" class="w-4 h-4 animate-spin" />
      </Button>
      <Button 
        v-else 
        variant="subtle" 
        size="sm" 
        @click="exportToExcel"
        class="flex items-center gap-2"
      >
        <FeatherIcon name="download" class="w-4 h-4" />
      </Button>
       </div>
      <div v-if="isDraft" class="flex items-center gap-2">
        <!-- Add Row Button -->
        <Button variant="subtle" size="sm" @click="addNewRow">
          <template #prefix>
            <FeatherIcon name="plus" class="w-4 h-4" />
          </template>
          Add Row
        </Button>

        <!-- Excel Paste Button -->
        <Button variant="subtle" size="sm" @click="startPaste" class="hidden md:flex">
          <template #prefix>
            <FeatherIcon name="clipboard" class="w-4 h-4" />
          </template>
          Paste from Excel
        </Button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <!-- Table Header -->
      <div class="bg-gray-50 border-b min-w-[800px]">
        <div class="flex items-center px-6 py-3">
          <div class="flex-1 grid items-center gap-4" :class="gridColsClass">
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
              <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
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
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
              <FeatherIcon name="hash" class="w-4 h-4" />
              Qty
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
              <FeatherIcon name="tag" class="w-4 h-4" />
              Unit Price
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
              Amount
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
              VAT
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
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
              <div class="flex-1 grid items-center gap-4" :class="gridColsClass">
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
                    {{ formatNumber(item.qty) }}
					<span v-if="item.qty === item.received_quantity">✅</span>
					<div v-if="item.qty > item.received_quantity > 0">
						({{ formatNumber(item.received_quantity) }} received)
					</div>
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
                <div class="text-sm font-medium text-right">
                  {{ formatCurrency(itemTotals[index]?.totalAmount) }}
                </div>
                <div class="text-sm text-gray-600 text-right">
                  {{ formatCurrency(itemTotals[index]?.vatAmount) }}
                </div>
                <div class="text-sm font-medium text-right">
                  {{ formatCurrency(itemTotals[index]?.grandTotal) }}
                </div>

                <!-- Actions -->
                <template v-if="isDraft">
                  <div class="flex justify-center">
                    <Button
                      variant="ghost"
                      size="xs"
                      theme="error"
                      @click="removeRow(index)"
                    >
                      <FeatherIcon name="trash-2" class="w-4 h-4" />
                    </Button>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Totals Row -->
          <div class="bg-gray-50 min-w-[800px] border-t">
            <div class="flex items-center px-6 py-4">
              <div class="flex-1 grid items-center gap-4" :class="gridColsClass">
                <!-- Spacing based on type -->
                <template v-if="type === 'Glass'">
                  <div class="col-span-5 text-sm font-medium text-gray-700 text-right">
                    Totals
                  </div>
                </template>
                <template v-else-if="type === 'Material'">
                  <div class="col-span-4 text-sm font-medium text-gray-700 text-right">
                    Totals
                  </div>
                </template>
                <template v-else>
                  <div class="col-span-3 text-sm font-medium text-gray-700 text-right">
                    Totals
                  </div>
                </template>

                <!-- Total Amounts -->
                <div class="text-sm font-medium text-gray-900 text-right">
                  {{ formatCurrency(totals.totalAmount) }}
                </div>
                <div class="text-sm text-gray-600 text-right">
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
        <div v-else class="flex flex-col items-center justify-center py-12">
          <div class="flex flex-col items-center text-center max-w-sm">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FeatherIcon name="box" class="w-6 h-6 text-gray-400" />
            </div>
            <h3 class="text-base font-medium text-gray-900">No Items</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ isDraft ? 'Click "Add Row" or paste from Excel to add items.' : 'This purchase order has no items.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Save Changes Bar -->
      
    </div>
	<div v-if="hasChanges && isDraft" class="flex justify-between px-6 py-4 bg-gray-50 border-t">
        <Button variant="ghost" size="sm" @click="addNewRow">
          <template #prefix>
            <FeatherIcon name="plus" class="w-4 h-4" />
          </template>
          Add Row
        </Button>
		<Button
          variant="solid"
          :loading="updateLPOItems.loading"
          :disabled="updateLPOItems.loading"
          @click="saveItems"
        >
          <template #prefix>
            <FeatherIcon name="save" class="w-4 h-4" />
          </template>
          {{ updateLPOItems.loading ? 'Saving...' : 'Save Changes' }}
        </Button>
      </div>
  </div>

  <!-- Paste Dialog -->
  <Dialog v-model="showPasteDialog" :options="pasteDialogOptions">
    <template #body-content>
      <div class="space-y-4">
        <textarea
          v-model="pasteContent"
          class="w-full h-40 p-2 border rounded-md font-mono text-sm focus:border-gray-900 focus:ring-gray-900"
          placeholder="Paste your Excel data here..."
        ></textarea>
        <div class="text-sm text-gray-600">
          Paste your data in the format:<br />
          Item Name   Description   {{ type === 'Glass' ? 'Area   ' : '' }}Qty   Unit Price
        </div>
      </div>
    </template>
  </Dialog>
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
const isExporting = ref(false)

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

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}


async function exportToExcel() {
	try {
    if (!window.XLSX) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js')
    }
    const XLSX = window.XLSX
    isExporting.value = true
    
    // Prepare headers based on type
    let headers = []
    switch (props.type) {
      case 'Glass':
        headers = ['Item', 'Description', 'Area', 'Quantity', 'Unit Price', 'Amount', 'VAT', 'Total']
        break
      case 'Material':
        headers = ['Item', 'Description', 'Quantity', 'Unit Price', 'Amount', 'VAT', 'Total']
        break
      case 'Aluminum':
        headers = ['Item', 'Quantity', 'Unit Price', 'Amount', 'VAT', 'Total']
        break
    }

    // Prepare data rows
    const data = localItems.value.map(item => {
      const total = (item.qty || 0) * (item.unit_price || 0)
      const vatAmount = total * 0.05
      const grandTotal = total + vatAmount

      switch (props.type) {
        case 'Glass':
          return [
            item.item,
            item.description,
            formatNumber(item.area),
            formatNumber(item.qty),
            formatCurrency(item.unit_price),
            formatCurrency(total),
            formatCurrency(vatAmount),
            formatCurrency(grandTotal)
          ]
        case 'Material':
          return [
            item.item,
            item.description,
            formatNumber(item.qty),
            formatCurrency(item.unit_price),
            formatCurrency(total),
            formatCurrency(vatAmount),
            formatCurrency(grandTotal)
          ]
        case 'Aluminum':
          return [
            item.item,
            formatNumber(item.qty),
            formatCurrency(item.unit_price),
            formatCurrency(total),
            formatCurrency(vatAmount),
            formatCurrency(grandTotal)
          ]
      }
    })

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

    // Set column widths
    const colWidths = headers.map(() => ({ wch: 15 }))
    ws['!cols'] = colWidths

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'LPO Items')

    // Generate filename
    const filename = `LPO_Items_${props.lpoName}_${new Date().toISOString().split('T')[0]}.xlsx`

    // Save file
    XLSX.writeFile(wb, filename)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
  } finally {
    isExporting.value = false
  }
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
