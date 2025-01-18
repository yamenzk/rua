# RFQItems.vue
<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Items</h2>
      <div class="flex items-center gap-2">
        <p class="text-sm text-gray-600">{{ localItems?.length || 0 }} items</p>

        <!-- Actions -->
        <div v-if="isDraft" class="flex items-center gap-2">
          <!-- Save Changes Button -->
          <Button
            v-if="hasChanges"
            variant="solid"
            size="sm"
            theme="primary"
            :loading="updateRFQItems.loading"
            :disabled="updateRFQItems.loading"
            @click="saveItems"
          >
            <template #prefix>
              <FeatherIcon name="save" class="w-4 h-4" />
            </template>
            {{ updateRFQItems.loading ? 'Saving...' : 'Save Changes' }}
          </Button>

          <!-- Add Row Button -->
          <Button variant="subtle" size="sm" @click="addNewRow">
            <template #prefix>
              <FeatherIcon name="plus" class="w-4 h-4" />
            </template>
            Add Row
          </Button>

          <!-- Excel Paste Button -->
          <Button variant="subtle" size="sm" @click="startPaste">
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
          <div class="flex-1 grid items-center" :class="gridColsClass">
            <!-- Common Column -->
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="box" class="w-4 h-4" />
              Item
            </div>

            <!-- Glass Type Columns -->
            <template v-if="type === 'Glass'">
              <div class="text-sm font-medium text-gray-700">Description</div>
              <div class="text-sm font-medium text-gray-700 text-right">Width (cm)</div>
              <div class="text-sm font-medium text-gray-700 text-right">Length (cm)</div>
              <div class="text-sm font-medium text-gray-700 text-right">Area (sqm)</div>
              <div class="text-sm font-medium text-gray-700 text-right">Qty</div>
              <div class="text-sm font-medium text-gray-700 text-right">Total Area</div>
            </template>

            <!-- Aluminum Type Columns -->
            <template v-if="type === 'Aluminum'">
              <div class="text-sm font-medium text-gray-700 text-right">Qty</div>
              <div class="text-sm font-medium text-gray-700 text-right">Measurement Unit</div>
              <div class="text-sm font-medium text-gray-700 text-right">Length</div>
            </template>

            <!-- Material Type Columns -->
            <template v-if="type === 'Material'">
              <div class="text-sm font-medium text-gray-700">Description</div>
              <div class="text-sm font-medium text-gray-700 text-right">Qty</div>
            </template>

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

                <!-- Glass Type Fields -->
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
                    <div v-else class="text-sm text-gray-600 text-right">
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
                    <div v-else class="text-sm text-gray-600 text-right">
                      {{ formatNumber(item.length) }}
                    </div>
                  </div>
                  <div class="text-sm text-gray-600 text-right">
                    {{ formatNumber(item.area) }}
                  </div>
                  <div>
                    <input
                      v-if="isDraft"
                      type="number"
                      v-model.number="item.qty"
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-right"
                      step="any"
                      @input="updateGlassCalculations(index)"
                    />
                    <div v-else class="text-sm text-gray-600 text-right">
                      {{ formatNumber(item.qty) }}
                    </div>
                  </div>
                  <div class="text-sm text-gray-600 text-right">
                    {{ formatNumber(item.total_area) }}
                  </div>
                </template>

                <!-- Aluminum Type Fields -->
                <template v-if="type === 'Aluminum'">
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
                    </div>
                  </div>
                  <div>
                    <input
                      v-if="isDraft"
                      type="text"
                      v-model="item.measurement_unit"
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-right"
                      @input="debouncedInput"
                    />
                    <div v-else class="text-sm text-gray-600">
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

                <!-- Material Type Fields -->
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
                      class="block w-full text-sm border-gray-300 rounded-md focus:ring-gray-900 focus:border-gray-900 text-right"
                      step="any"
                      @input="debouncedInput"
                    />
                    <div v-else class="text-sm text-gray-600 text-right">
                      {{ formatNumber(item.qty) }}
                    </div>
                  </div>
                </template>

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
        </template>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-12 min-w-[800px]">
          <FeatherIcon name="box" class="w-12 h-12 text-gray-400 mb-4" />
          <p class="text-base font-medium text-gray-900">No Items Found</p>
          <p class="text-sm text-gray-600">
            {{ isDraft ? 'Click "Add Row" or paste from Excel to add items.' : 'This RFQ has no items.' }}
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
            <template v-if="type === 'Glass'">
              Item Name[tab]Description[tab]Width[tab]Length[tab]Qty
            </template>
            <template v-if="type === 'Aluminum'">
              Item Name[tab]Qty[tab]Measurement Unit[tab]Length
            </template>
            <template v-if="type === 'Material'">
              Item Name[tab]Description[tab]Qty
            </template>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
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

// Computed
const isDraft = computed(() => props.status === 'Draft')

const gridColsClass = computed(() => {
  const baseColumns = isDraft.value ? 1 : 0 // Action column
  switch (props.type) {
    case 'Glass':
      return `grid-cols-${7 + baseColumns}` // item, description, width, length, area, qty, total_area, [action]
    case 'Aluminum':
      return `grid-cols-${4 + baseColumns}` // item, qty, measurement_unit, length, [action]
    case 'Material':
      return `grid-cols-${3 + baseColumns}` // item, description, qty, [action]
    default:
      return `grid-cols-${3 + baseColumns}`
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
    .filter((row) => row.some((cell) => cell.length > 0))

  // Remove header row if it exists
  if (
    rows.length > 0 &&
    rows[0].some(
      (cell) =>
        cell.toLowerCase().includes('item') ||
        cell.toLowerCase().includes('qty') ||
        cell.toLowerCase().includes('description'),
    )
  ) {
    rows.shift()
  }

  if (!rows.length) return

  const newItems = rows.map((row) => {
    switch (props.type) {
      case 'Glass':
        const glassItem = {
          item: row[0] || '',
          description: row[1] || '',
          width: parseFloat(row[2]) || 0,
          length: parseFloat(row[3]) || 0,
          qty: parseFloat(row[4]) || 0,
        }
        // Calculate derived fields
        glassItem.area = (glassItem.width * glassItem.length) / 10000
        glassItem.total_area = glassItem.area * glassItem.qty
        return glassItem

      case 'Aluminum':
        return {
          item: row[0] || '',
          qty: parseFloat(row[1]) || 0,
          measurement_unit: row[2] || '',
          length: parseFloat(row[3]) || 0
        }

      case 'Material':
        return {
          item: row[0] || '',
          description: row[1] || '',
          qty: parseFloat(row[2]) || 0
        }

      default:
        return {}
    }
  })

  localItems.value = newItems
  debouncedInput()
  showPasteDialog.value = false
  pasteContent.value = ''
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