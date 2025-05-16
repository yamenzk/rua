<template>
  <div class="bg-white">
    <div class="flex items-center justify-between px-6 py-4 border-b">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-500">{{ localItems?.length || 0 }} items</span>
      </div>

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
        <Button variant="subtle" size="sm" @click="addNewRow">
          <template #prefix>
            <FeatherIcon name="plus" class="w-4 h-4" />
          </template>
          Add Row
        </Button>

        <Button variant="subtle" size="sm" @click="startPaste" class="hidden md:flex">
          <template #prefix>
            <FeatherIcon name="clipboard" class="w-4 h-4" />
          </template>
          Paste from Excel
        </Button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <div class="bg-gray-50 border-b min-w-[800px]">
        <div class="flex items-center px-6 py-3">
          <div class="flex-1 grid items-center gap-4" :class="gridColsClass">
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="box" class="w-4 h-4" />
              Item
            </div>

            <template v-if="type === 'Glass'">
              <div class="text-sm font-medium text-gray-700">Description</div>
              <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
                Width (cm)
              </div>
              <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
                Length (cm)
              </div>
              <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
                Area (sqm)
              </div>
              <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-center">
                <FeatherIcon name="hash" class="w-4 h-4" />
                Qty
              </div>
              <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
                Total Area
              </div>
            </template>

            <template v-if="type === 'Aluminum'">
              <div class="text-sm font-medium text-gray-700">Description</div>
              <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-center">
                <FeatherIcon name="hash" class="w-4 h-4" />
                Qty
              </div>
              <div class="text-sm font-medium text-gray-700">
                Measurement Unit
              </div>
              <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-end">
                Length
              </div>
            </template>

            <template v-if="type === 'Material'">
              <div class="text-sm font-medium text-gray-700">Description</div>
              <div class="flex items-center gap-2 text-sm font-medium text-gray-700 justify-center">
                <FeatherIcon name="hash" class="w-4 h-4" />
                Qty
              </div>
            </template>

            <template v-if="isDraft">
              <div class="w-10"></div>
            </template>
          </div>
        </div>
      </div>

      <div class="divide-y">
        <template v-if="localItems?.length">
          <div
            v-for="(item, index) in localItems"
            :key="index"
            class="hover:bg-gray-50 transition-colors min-w-[800px]"
          >
            <div class="flex items-center px-6 py-3">
              <div class="flex-1 grid items-center gap-4" :class="gridColsClass">
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
                      v-model.number="item.width"
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-right"
                      step="any"
                      @input="updateGlassCalculations(index)"
                    />
                    <div v-else class="text-sm text-gray-600 text-center">
                      {{ formatNumber(item.width) }}
                    </div>
                  </div>
                  <div>
                    <input
                      v-if="isDraft"
                      type="number"
                      v-model.number="item.length"
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-right"
                      step="any"
                      @input="updateGlassCalculations(index)"
                    />
                    <div v-else class="text-sm text-gray-600 text-center">
                      {{ formatNumber(item.length) }}
                    </div>
                  </div>
                  <div class="text-sm text-gray-600 text-center">
                    {{ formatNumber(item.area) }}
                  </div>
                  <div>
                    <input
                      v-if="isDraft"
                      type="number"
                      v-model.number="item.qty"
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-center"
                      step="any"
                      @input="updateGlassCalculations(index)"
                    />
                    <div v-else class="text-sm text-gray-600 text-center">
                      {{ formatNumber(item.qty) }}
                    </div>
                  </div>
                  <div class="text-sm font-medium text-gray-900 text-right">
                    {{ formatNumber(item.total_area) }}
                  </div>
                </template>

                <template v-if="type === 'Aluminum'">
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
                      v-model.number="item.qty"
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-center"
                      step="any"
                      @input="debouncedInput"
                    />
                    <div v-else class="text-sm text-gray-600 text-center">
                      {{ formatNumber(item.qty) }}
                    </div>
                  </div>
                  <div>
                    <input
                      v-if="isDraft"
                      type="text"
                      v-model="item.measurement_unit"
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900"
                      @input="debouncedInput"
                    />
                    <div v-else class="text-sm text-gray-600 text-center">
                      {{ item.measurement_unit }}
                    </div>
                  </div>
                  <div>
                    <input
                      v-if="isDraft"
                      type="number"
                      v-model.number="item.length"
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-right"
                      step="any"
                      @input="debouncedInput"
                    />
                    <div v-else class="text-sm text-gray-600 text-right">
                      {{ formatNumber(item.length) }}
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
                  <div>
                    <input
                      v-if="isDraft"
                      type="number"
                      v-model.number="item.qty"
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-center"
                      step="any"
                      @input="debouncedInput"
                    />
                    <div v-else class="text-sm text-gray-600 text-center">
                      {{ formatNumber(item.qty) }}
                    </div>
                  </div>
                </template>

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
        </template>

        <div v-else class="flex flex-col items-center justify-center py-12">
          <div class="flex flex-col items-center text-center max-w-sm">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FeatherIcon name="box" class="w-6 h-6 text-gray-400" />
            </div>
            <h3 class="text-base font-medium text-gray-900">No Items</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ isDraft ? 'Click "Add Row" or paste from Excel to add items.' : 'This RFQ has no items.' }}
            </p>
          </div>
        </div>
      </div>

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
          :loading="updateRFQItems.loading"
          :disabled="updateRFQItems.loading"
          @click="saveItems"
        >
          <template #prefix>
            <FeatherIcon name="save" class="w-4 h-4" />
          </template>
          {{ updateRFQItems.loading ? 'Saving...' : 'Save Changes' }}
        </Button>
      </div>
  </div>

  <Dialog v-model="showPasteDialog" :options="pasteDialogOptions">
    <template #body-content>
      <div class="space-y-4">
        <textarea
          v-model="pasteContent"
          class="w-full h-40 p-2 border rounded-md font-mono text-sm focus:border-gray-900 focus:ring-gray-900"
          placeholder="Paste your Excel data here (Ctrl+V or Cmd+V)..."
        ></textarea>

        <div class="text-sm text-gray-700 space-y-2">
          <p class="font-medium">Please ensure your columns are in the following order for RFQ Type: "{{ type }}"</p>

          <div class="bg-gray-50 p-3 rounded-md border">
            <template v-if="type === 'Glass'">
              <p class="font-semibold text-gray-800">Required Columns for Glass:</p>
              <ul class="list-disc list-inside mt-1 text-gray-600 space-y-0.5">
                <li>Column 1: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Item Name</span></li>
                <li>Column 2: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Description</span></li>
                <li>Column 3: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Width (cm)</span> (e.g., 100.5)</li>
                <li>Column 4: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Length (cm)</span> (e.g., 200.0)</li>
                <li>Column 5: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Qty</span> (e.g., 10)</li>
              </ul>
              <p class="font-medium mt-2">Example for Glass:</p>
              <pre class="bg-gray-100 p-2 rounded text-xs mt-1 font-mono border overflow-x-auto">
Item Glass A[tab]Clear Tempered 6mm[tab]120[tab]240[tab]5
Item Glass B[tab]Frosted Laminated[tab]80.5[tab]150.5[tab]2</pre>
            </template>

            <template v-if="type === 'Aluminum'">
              <p class="font-semibold text-gray-800">Required Columns for Aluminum:</p>
              <ul class="list-disc list-inside mt-1 text-gray-600 space-y-0.5">
                <li>Column 1: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Item Name</span></li>
                <li>Column 2: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Description</span></li>
                <li>Column 3: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Qty</span> (e.g., 50)</li>
                <li>Column 4: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Measurement Unit</span> (e.g., m, pcs, length)</li>
                <li>Column 5: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Length</span> (e.g., 6.0)</li>
              </ul>
              <p class="font-medium mt-2">Example for Aluminum:</p>
              <pre class="bg-gray-100 p-2 rounded text-xs mt-1 font-mono border overflow-x-auto">
Profile X1[tab]Silver Anodized[tab]10[tab]meters[tab]5.8
Handle Y2[tab]Powder Coated Black[tab]25[tab]pcs[tab]0.15</pre>
            </template>

            <template v-if="type === 'Material'">
              <p class="font-semibold text-gray-800">Required Columns for Material:</p>
              <ul class="list-disc list-inside mt-1 text-gray-600 space-y-0.5">
                <li>Column 1: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Item Name</span></li>
                <li>Column 2: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Description</span></li>
                <li>Column 3: <span class="font-mono bg-gray-200 px-1 rounded text-xs">Qty</span> (e.g., 100)</li>
              </ul>
              <p class="font-medium mt-2">Example for Material:</p>
              <pre class="bg-gray-100 p-2 rounded text-xs mt-1 font-mono border overflow-x-auto">
Screws[tab]Stainless Steel 5mm[tab]200
Silicone[tab]Weatherproof Sealant[tab]10</pre>
            </template>
          </div>

          <p class="mt-2 text-xs text-gray-500">
            The first row can be your headers (they will be attempted to be skipped if common keywords like 'Item', 'Description', 'Qty' are detected) or actual data. Ensure data is separated by <span class="font-mono bg-gray-200 px-1 rounded text-xs">Tab</span>.
          </p>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Button, FeatherIcon, Dialog, debounce, createResource } from 'frappe-ui'
import { formatNumber } from '@/utils/format'

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
  rfqName: {
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
      return `grid-cols-${7 + baseColumns}` // item, description, width, length, area, qty, total_area, [action]
    case 'Aluminum':
      return `grid-cols-${5 + baseColumns}` // item, description, qty, measurement_unit, length, [action]
    case 'Material':
      return `grid-cols-${3 + baseColumns}` // item, description, qty, [action]
    default:
      return `grid-cols-${3 + baseColumns}` // Default fallback, should match one of the types
  }
})

const hasChanges = computed(() => {
  return JSON.stringify(localItems.value) !== JSON.stringify(originalItems.value)
})

const updateRFQItems = createResource({
  url: 'rua.api.update_rfq_items',
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

function updateGlassCalculations(index) {
  const item = localItems.value[index]

  // Calculate area (sqm)
  if (item.width && item.length) {
    // Convert from cm² to m²
    item.area = (item.width * item.length) / 10000
  } else {
    item.area = 0
  }

  // Calculate total area
  if (item.area && item.qty) {
    item.total_area = item.area * item.qty
  } else {
    item.total_area = 0
  }

  debouncedInput()
}

function addNewRow() {
  const newRow = { item: '' }

  switch (props.type) {
    case 'Glass':
      Object.assign(newRow, {
        description: '',
        width: '',
        length: '',
        area: 0,
        qty: '',
        total_area: 0
      })
      break
    case 'Aluminum':
      Object.assign(newRow, {
        description: '', // Added description
        qty: '',
        measurement_unit: '',
        length: ''
      })
      break
    case 'Material':
      Object.assign(newRow, {
        description: '',
        qty: ''
      })
      break
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
    .filter((row) => row.some((cell) => cell.length > 0));

  // Attempt to remove header row if it exists
  if (
    rows.length > 0 &&
    rows[0].some(
      (cell) =>
        cell.toLowerCase().includes('item') ||
        cell.toLowerCase().includes('name') ||
        cell.toLowerCase().includes('description') ||
        cell.toLowerCase().includes('qty') ||
        cell.toLowerCase().includes('quantity') ||
        cell.toLowerCase().includes('width') ||
        cell.toLowerCase().includes('length') ||
        cell.toLowerCase().includes('unit'), // Added more keywords
    )
  ) {
    // Check if the first row's cells match expected header patterns more closely
    // This is a heuristic. For instance, if the 'qty' column contains non-numeric data.
    let looksLikeHeader = true;
    if (rows[0].length >=3) { // Ensure enough columns to check
        const qtyIndex = props.type === 'Glass' ? 4 : (props.type === 'Aluminum' ? 2 : 2);
        if (rows[0][qtyIndex] && isNaN(parseFloat(rows[0][qtyIndex]))) {
            // If the potential Qty cell is not a number, it's likely a header
        } else if (rows[0][qtyIndex] && !isNaN(parseFloat(rows[0][qtyIndex]))) {
            // If it IS a number, it might be data, not a header. Unless other cells are clearly text headers.
            if(!rows[0].slice(0, qtyIndex).some(cell => isNaN(parseFloat(cell)))) {
                 // If all preceding cells are also numbers, less likely a header
                 // but for RFQ, item name & desc are text.
            }
        }
    }
    // A simpler check that was previously used:
    // if (rows[0].some(cell => cell.toLowerCase().includes('item') || ...)) rows.shift();
    // For now, let's stick to the original keyword based shift, can be refined if needed.
    rows.shift(); // Simplified back to original logic for clarity, extend if needed
  }

  if (!rows.length) return;

  const newItems = rows.map((row) => {
    let itemData = {}; // Use a temporary object

    switch (props.type) {
      case 'Glass':
        // Expected order: Item Name, Description, Width, Length, Qty
        itemData = {
          item: row[0] || '',
          description: row[1] || '',
          width: parseFloat(row[2]) || 0,
          length: parseFloat(row[3]) || 0,
          qty: parseFloat(row[4]) || 0,
        };
        // Calculate derived fields for Glass
        itemData.area = (itemData.width * itemData.length) / 10000; // cm to sqm
        itemData.total_area = itemData.area * itemData.qty;
        break;

      case 'Aluminum':
        // Expected order: Item Name, Description, Qty, Measurement Unit, Length
        itemData = {
          item: row[0] || '',
          description: row[1] || '', // Description is row[1]
          qty: parseFloat(row[2]) || 0,
          measurement_unit: row[3] || '',
          length: parseFloat(row[4]) || 0,
        };
        break;

      case 'Material':
        // Expected order: Item Name, Description, Qty
        itemData = {
          item: row[0] || '',
          description: row[1] || '',
          qty: parseFloat(row[2]) || 0,
        };
        break;

      default:
        return {}; // Should not happen with validator
    }
    return itemData;
  });

  localItems.value = newItems;
  debouncedInput(); // Ensure this emits the updated items
  showPasteDialog.value = false;
  pasteContent.value = '';
}

async function saveItems() {
  try {
    const response = await updateRFQItems.submit({
      rfq_name: props.rfqName,
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
        headers = ['Item', 'Description', 'Width (cm)', 'Length (cm)', 'Area (sqm)', 'Quantity', 'Total Area']
        break
      case 'Aluminum':
        headers = ['Item', 'Description', 'Quantity', 'Measurement Unit', 'Length'] // Added 'Description'
        break
      case 'Material':
        headers = ['Item', 'Description', 'Quantity']
        break
    }

    // Prepare data rows based on type
    const data = localItems.value.map(item => {
      switch (props.type) {
        case 'Glass':
          return [
            item.item,
            item.description,
            formatNumber(item.width),
            formatNumber(item.length),
            formatNumber(item.area),
            formatNumber(item.qty),
            formatNumber(item.total_area)
          ]
        case 'Aluminum':
          return [
            item.item,
            item.description, // Added item.description
            formatNumber(item.qty),
            item.measurement_unit,
            formatNumber(item.length)
          ]
        case 'Material':
          return [
            item.item,
            item.description,
            formatNumber(item.qty)
          ]
      }
    })

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

    // Set column widths
    const colWidths = headers.map(() => ({ wch: 15 })) // Default width, can be adjusted
    if (props.type === 'Aluminum') { // Example: Make description column wider for Aluminum
        const descriptionIndex = headers.indexOf('Description');
        if (descriptionIndex !== -1) {
            colWidths[descriptionIndex] = { wch: 25 };
        }
    } else if (props.type === 'Glass') {
        const descriptionIndex = headers.indexOf('Description');
         if (descriptionIndex !== -1) {
            colWidths[descriptionIndex] = { wch: 25 };
        }
    }


    ws['!cols'] = colWidths

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'RFQ Items')

    // Generate filename
    const filename = `RFQ_Items_${props.rfqName}.xlsx`

    // Save file
    XLSX.writeFile(wb, filename)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
  } finally {
    isExporting.value = false
  }
}

// Watch for props changes
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