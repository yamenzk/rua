<template>
  <div class="space-y-6 p-6">
    <!-- Version selector and controls -->
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <h2 class="text-lg font-medium text-gray-900">Project Items</h2>
        <div v-if="versions.length" class="flex items-center space-x-2">
          <Select
            v-model="selectedVersion"
            :options="versionOptions"
            placeholder="Select version"
            class="w-64"
          />
          <Badge
            v-if="isLatestVersion"
            variant="success"
            class="ml-2"
          >
            Latest
          </Badge>
        </div>
      </div>
      <Button
        variant="primary"
        @click="openSaveDialog"
      >
        Save Version
      </Button>
    </div>

    <!-- Spreadsheet container -->
    <Card>
      <div 
        ref="hotContainer" 
        class="w-full"
      ></div>
    </Card>

    <!-- Totals Section -->
    <Card class="mt-4 p-4">
      <div class="space-y-4">
        <!-- Main Totals -->
        <div class="grid grid-cols-2 gap-4 px-2">
          <FormControl
            type="text"
            label="Total Items Cell Reference"
            v-model="totalItemsRef"
            @change="debouncedUpdateTotals"
            placeholder="e.g. F8"
          />
          <div class="text-right">
            <div class="text-sm text-gray-600">Total Items</div>
            <div class="text-lg font-medium">{{ totalItems || '0' }}</div>
          </div>

          <FormControl
            type="text"
            label="Total Cell Reference"
            v-model="totalRef"
            @change="debouncedUpdateTotals"
            placeholder="e.g. F10"
          />
          <div class="text-right">
            <div class="text-sm text-gray-600">Total</div>
            <div class="text-lg font-medium">{{ total || '0' }}</div>
          </div>

          <FormControl
            type="text"
            label="VAT Amount Cell Reference"
            v-model="vatAmountRef"
            @change="debouncedUpdateTotals"
            placeholder="e.g. F12"
          />
          <div class="text-right">
            <div class="text-sm text-gray-600">VAT Amount</div>
            <div class="text-lg font-medium">{{ vatAmount || '0' }}</div>
          </div>

          <FormControl
            type="text"
            label="Grand Total Cell Reference"
            v-model="grandTotalRef"
            @change="debouncedUpdateTotals"
            placeholder="e.g. F14"
          />
          <div class="text-right">
            <div class="text-sm text-gray-600">Grand Total</div>
            <div class="text-lg font-medium">{{ grandTotal || '0' }}</div>
          </div>
        </div>

        <!-- Retention Toggle -->
        <div class="flex items-center space-x-2 pt-4 border-t px-2">
          <input
            type="checkbox"
            id="enableRetention"
            v-model="enableRetention"
            class="rounded border-gray-300"
            @change="handleRetentionToggle"
          />
          <label for="enableRetention" class="text-sm font-medium text-gray-700">
            Enable Retention
          </label>
        </div>

        <!-- Retention Fields -->
        <div v-if="enableRetention" class="grid grid-cols-2 gap-4 px-2 pt-2">
          <FormControl
            type="text"
            label="Total After Retention Cell Reference"
            v-model="totalAfterRetentionRef"
            @change="debouncedUpdateTotals"
            placeholder="e.g. F16"
          />
          <div class="text-right">
            <div class="text-sm text-gray-600">Total After Retention</div>
            <div class="text-lg font-medium">{{ totalAfterRetention || '0' }}</div>
          </div>

          <FormControl
            type="text"
            label="VAT After Retention Cell Reference"
            v-model="vatAfterRetentionRef"
            @change="debouncedUpdateTotals"
            placeholder="e.g. F18"
          />
          <div class="text-right">
            <div class="text-sm text-gray-600">VAT After Retention</div>
            <div class="text-lg font-medium">{{ vatAfterRetention || '0' }}</div>
          </div>

          <FormControl
            type="text"
            label="Grand Total After Retention Cell Reference"
            v-model="grandTotalAfterRetentionRef"
            @change="debouncedUpdateTotals"
            placeholder="e.g. F20"
          />
          <div class="text-right">
            <div class="text-sm text-gray-600">Grand Total After Retention</div>
            <div class="text-lg font-medium">{{ grandTotalAfterRetention || '0' }}</div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Save Version Dialog -->
    <Dialog
      v-model="showSaveDialog"
      :options="{
        title: 'Save New Version',
        size: 'md', 
      }"
      style="z-index: 99999 !important;"
    >
      <template #body-content>
        <div class="space-y-4">
          <FormControl
            type="textarea"
            label="Description of Changes"
            v-model="changeDescription"
            :error="descriptionError"
            placeholder="Describe the changes you made in this version..."
          />
          <div class="text-sm text-gray-500">
            This description will help track changes across versions.
          </div>
        </div>
      </template>
      <template #actions>
        <div class="flex justify-end space-x-2">
          <Button
            variant="subtle"
            @click="showSaveDialog = false"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            :loading="isSaving"
            @click="saveVersion"
          >
            Save Version
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import Handsontable from 'handsontable'
import { HyperFormula } from 'hyperformula'
import 'handsontable/dist/handsontable.full.css'
import { 
  Card,
  Select,
  Dialog,
  Button,
  FormControl,
  Badge,
  debounce
} from 'frappe-ui'
import { session } from '../data/session'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  projectResource: {
    type: Object,
    required: true
  }
})

// Spreadsheet State
const hotContainer = ref(null)
const hot = ref(null)
const showSaveDialog = ref(false)
const changeDescription = ref('')
const descriptionError = ref('')
const isSaving = ref(false)
const selectedVersion = ref(null)
const versions = ref([])
const lastError = ref(null)

// Totals State
const totalItemsRef = ref('')
const totalRef = ref('')
const vatAmountRef = ref('')
const grandTotalRef = ref('')
const enableRetention = ref(false)
const totalAfterRetentionRef = ref('')
const vatAfterRetentionRef = ref('')
const grandTotalAfterRetentionRef = ref('')

// Computed Values
const totalItems = ref('')
const total = ref('')
const vatAmount = ref('')
const grandTotal = ref('')
const totalAfterRetention = ref('')
const vatAfterRetention = ref('')
const grandTotalAfterRetention = ref('')

// Initialize empty spreadsheet configuration
const defaultConfig = {
  data: [Array(5).fill('')],
  colHeaders: true,
  rowHeaders: true,
  formulas: {
    engine: HyperFormula,
    sheetName: 'Sheet1',
    sheetId: 0
  },
  cells: function() {
    return {
      type: 'numeric'
    }
  },
  height: 500,
  stretchH: 'all',
  autoWrapRow: true,
  autoWrapCol: true,
  contextMenu: true,
  manualColumnResize: true,
  manualRowResize: true,
  mergeCells: true,
  minRows: 1,
  minSpareRows: 1,
  afterChange: (changes) => {
    if (!changes) return
    
    const data = hot.value.getData()
    const lastRowWithData = data.reduce((lastRow, currentRow, index) => {
      return currentRow.some(cell => cell !== null && cell !== '') ? index : lastRow
    }, -1)

    if (lastRowWithData >= hot.value.countRows() - 2) {
      hot.value.alter('insert_row_below', hot.value.countRows() - 1, 1)
    }
  },
  licenseKey: 'non-commercial-and-evaluation'
}

// Computed
const versionOptions = computed(() => {
  return versions.value.map(version => ({
    label: `${new Date(version.timestamp).toLocaleString()} - ${version.user} - ${
      version.description ? version.description.slice(0, 30) + '...' : 'No description'
    }`,
    value: version.timestamp
  }))
})

const isLatestVersion = computed(() => {
  if (!versions.value.length || !selectedVersion.value) return false
  return selectedVersion.value === versions.value[versions.value.length - 1].timestamp
})

// Utility Functions
function convertToColumnName(num) {
  let columnName = ''
  while (num >= 0) {
    columnName = String.fromCharCode(65 + (num % 26)) + columnName
    num = Math.floor(num / 26) - 1
  }
  return columnName
}

function parseColumnName(columnName) {
  return columnName.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1
}

// Get cell value from reference
function getCellValue(cellRef) {
  if (!hot.value || !cellRef) return ''
  
  try {
    const match = cellRef.match(/^([A-Z]+)(\d+)$/)
    if (!match) return ''
    
    const [, colLetter, rowStr] = match
    const rowNum = parseInt(rowStr) - 1
    const colNum = parseColumnName(colLetter)
    
    if (rowNum < 0 || colNum < 0 || rowNum >= hot.value.countRows() || colNum >= hot.value.countCols()) {
      return ''
    }

    const value = hot.value.getDataAtCell(rowNum, colNum)
    return value !== null ? value.toString() : ''
  } catch (error) {
    console.error('Error getting cell value:', error)
    lastError.value = `Error getting value from ${cellRef}: ${error.message}`
    return ''
  }
}

// Methods
function initializeHandsontable(config = defaultConfig) {
  try {
    if (hot.value) {
      hot.value.destroy()
    }

    const finalConfig = { 
      ...defaultConfig,
      data: config.data || defaultConfig.data
    }

    const hyperFormulaInstance = HyperFormula.buildEmpty({
      ...defaultConfig.formulas.engineSettings
    })

    finalConfig.formulas = {
      ...defaultConfig.formulas,
      engine: hyperFormulaInstance
    }

    hot.value = new Handsontable(hotContainer.value, finalConfig)

    if (config.formulas && Array.isArray(config.formulas)) {
      config.formulas.forEach((row, rowIndex) => {
        row.forEach((formula, colIndex) => {
          if (formula) {
            hot.value.setDataAtCell(rowIndex, colIndex, formula)
          }
        })
      })
    }

    setupTotalsWatch()
  } catch (error) {
    console.error('Error initializing spreadsheet:', error)
    lastError.value = `Failed to initialize spreadsheet: ${error.message}`
  }
}

const debouncedUpdateTotals = debounce(async () => {
  try {
    // Update displayed values
    totalItems.value = getCellValue(totalItemsRef.value)
    total.value = getCellValue(totalRef.value)
    vatAmount.value = getCellValue(vatAmountRef.value)
    grandTotal.value = getCellValue(grandTotalRef.value)
    
    if (enableRetention.value) {
      totalAfterRetention.value = getCellValue(totalAfterRetentionRef.value)
      vatAfterRetention.value = getCellValue(vatAfterRetentionRef.value)
      grandTotalAfterRetention.value = getCellValue(grandTotalAfterRetentionRef.value)
    }

    // Save only the computed values to database
    await props.projectResource.setValue.submit({
      name: props.project.name,
      total_items: totalItems.value,
      total: total.value,
      vat_amount: vatAmount.value,
      grand_total: grandTotal.value,
      total_after_retention: totalAfterRetention.value,
      vat_after_retention: vatAfterRetention.value,
      grand_total_after_retention: grandTotalAfterRetention.value
    })

    lastError.value = null
  } catch (error) {
    console.error('Failed to update totals:', error)
    lastError.value = `Failed to update totals: ${error.message}`
  }
}, 500)

function handleRetentionToggle() {
  if (!enableRetention.value) {
    totalAfterRetentionRef.value = ''
    vatAfterRetentionRef.value = ''
    grandTotalAfterRetentionRef.value = ''
    totalAfterRetention.value = ''
    vatAfterRetention.value = ''
    grandTotalAfterRetention.value = ''
  }
  debouncedUpdateTotals()
}

function setupTotalsWatch() {
  if (!hot.value) return
      hot.value.addHook('afterChange', () => {
      debouncedUpdateTotals()
    })
}

async function loadTotalsData() {
  if (!props.project) return
  
  try {
    // Load cell references from totals_reference JSON
    if (props.project.totals_reference) {
      const referencesData = JSON.parse(props.project.totals_reference)
      
      totalItemsRef.value = referencesData.total_items_ref || ''
      totalRef.value = referencesData.total_ref || ''
      vatAmountRef.value = referencesData.vat_amount_ref || ''
      grandTotalRef.value = referencesData.grand_total_ref || ''
      enableRetention.value = referencesData.enable_retention || false
      totalAfterRetentionRef.value = referencesData.total_after_retention_ref || ''
      vatAfterRetentionRef.value = referencesData.vat_after_retention_ref || ''
      grandTotalAfterRetentionRef.value = referencesData.grand_total_after_retention_ref || ''
    }
    
    // Update the computed values from the spreadsheet
    await debouncedUpdateTotals()
  } catch (error) {
    console.error('Failed to load totals data:', error)
    lastError.value = `Failed to load totals data: ${error.message}`
  }
}

function getSpreadsheetState() {
  if (!hot.value) return null

  try {
    const rawData = hot.value.getData()
    const lastRowWithData = rawData.reduce((lastRow, currentRow, index) => {
      return currentRow.some(cell => cell !== null && cell !== '') ? index : lastRow
    }, -1)
    
    const data = rawData.slice(0, lastRowWithData + 2)
    
    const formulas = Array.from({ length: data.length }, (_, row) =>
      Array.from({ length: data[0].length }, (_, col) => {
        const cellFormula = hot.value.getSourceDataAtCell(row, col)
        return cellFormula?.toString().startsWith('=') ? cellFormula : null
      })
    )

    return {
      data,
      formulas,
      colHeaders: hot.value.getColHeader(),
      rowHeaders: hot.value.getRowHeader(),
      columnWidths: Array.from({ length: hot.value.countCols() }, (_, i) => hot.value.getColWidth(i)),
      rowHeights: Array.from({ length: data.length }, (_, i) => hot.value.getRowHeight(i))
    }
  } catch (error) {
    console.error('Error getting spreadsheet state:', error)
    lastError.value = `Failed to get spreadsheet state: ${error.message}`
    return null
  }
}

function openSaveDialog() {
  changeDescription.value = ''
  descriptionError.value = ''
  showSaveDialog.value = true
}

async function saveVersion() {
  try {
    if (!changeDescription.value.trim()) {
      descriptionError.value = 'Please describe the changes made in this version'
      return
    }

    if (!props.project || !hot.value) {
      throw new Error('Project data or spreadsheet not available')
    }

    isSaving.value = true
    
    const currentState = getSpreadsheetState()
    if (!currentState) {
      throw new Error('Failed to get spreadsheet state')
    }

    // Add totals references to the version state
    const totalsState = {
      total_items_ref: totalItemsRef.value,
      total_ref: totalRef.value,
      vat_amount_ref: vatAmountRef.value,
      grand_total_ref: grandTotalRef.value,
      enable_retention: enableRetention.value,
      total_after_retention_ref: totalAfterRetentionRef.value,
      vat_after_retention_ref: vatAfterRetentionRef.value,
      grand_total_after_retention_ref: grandTotalAfterRetentionRef.value
    }
    
    const newVersion = {
      timestamp: new Date().toISOString(),
      user: session.user,
      description: changeDescription.value.trim(),
      state: currentState,
      totalsState // Include totals state in version
    }

    let itemsLog = []
    try {
      itemsLog = props.project.items_log ? JSON.parse(props.project.items_log) : []
    } catch (err) {
      console.warn('Failed to parse existing items_log, starting fresh:', err)
    }

    itemsLog.push(newVersion)

    await props.projectResource.setValue.submit({
      name: props.project.name,
      items_log: JSON.stringify(itemsLog),
      // Also update current values
      total_items: totalItems.value,
      total: total.value,
      vat_amount: vatAmount.value,
      grand_total: grandTotal.value,
      total_after_retention: totalAfterRetention.value,
      vat_after_retention: vatAfterRetention.value,
      grand_total_after_retention: grandTotalAfterRetention.value
    })

    versions.value = itemsLog
    selectedVersion.value = newVersion.timestamp
    
    showSaveDialog.value = false
    changeDescription.value = ''
    descriptionError.value = ''
    
    lastError.value = null
  } catch (error) {
    console.error('Failed to save version:', error)
    lastError.value = `Failed to save version: ${error.message}`
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  if (!props.project) {
    console.warn('Project data not available on mount')
    initializeHandsontable()
    return
  }

  try {
    if (props.project.items_log) {
      versions.value = JSON.parse(props.project.items_log) || []
      
      if (versions.value.length) {
        // Select latest version and load its state
        const latestVersion = versions.value[versions.value.length - 1]
        selectedVersion.value = latestVersion.timestamp
        
        if (latestVersion.state) {
          initializeHandsontable({
            ...defaultConfig,
            ...latestVersion.state
          })
          
          // Load totals from the latest version
          if (latestVersion.totalsState) {
            totalItemsRef.value = latestVersion.totalsState.total_items_ref || ''
            totalRef.value = latestVersion.totalsState.total_ref || ''
            vatAmountRef.value = latestVersion.totalsState.vat_amount_ref || ''
            grandTotalRef.value = latestVersion.totalsState.grand_total_ref || ''
            enableRetention.value = latestVersion.totalsState.enable_retention || false
            totalAfterRetentionRef.value = latestVersion.totalsState.total_after_retention_ref || ''
            vatAfterRetentionRef.value = latestVersion.totalsState.vat_after_retention_ref || ''
            grandTotalAfterRetentionRef.value = latestVersion.totalsState.grand_total_after_retention_ref || ''
            
            await debouncedUpdateTotals()
          }
        } else {
          console.warn('Latest version missing state data')
          initializeHandsontable()
        }
      }
    } else {
      versions.value = []
      initializeHandsontable()
    }
  } catch (error) {
    console.error('Failed to parse items_log:', error)
    versions.value = []
    lastError.value = `Failed to parse version history: ${error.message}`
    initializeHandsontable()
  }
  
  setupTotalsWatch()
})

watch(() => props.project, (newProject) => {
  if (!newProject) return
  
  try {
    // Handle versions
    const itemsLog = newProject.items_log ? JSON.parse(newProject.items_log) : []
    versions.value = itemsLog
    
    if (itemsLog.length && !selectedVersion.value) {
      selectedVersion.value = itemsLog[itemsLog.length - 1].timestamp
    }
  } catch (error) {
    console.error('Failed to parse project data:', error)
    lastError.value = `Failed to parse project data: ${error.message}`
  }
}, { deep: true, immediate: true })

watch(selectedVersion, async (newVersion) => {
  if (!newVersion) return

  const version = versions.value.find(v => v.timestamp === newVersion)
  if (version?.state) {
    // Initialize spreadsheet with version state
    initializeHandsontable({
      ...defaultConfig,
      ...version.state
    })
    
    // Load totals references from version's totalsState
    if (version.totalsState) {
      totalItemsRef.value = version.totalsState.total_items_ref || ''
      totalRef.value = version.totalsState.total_ref || ''
      vatAmountRef.value = version.totalsState.vat_amount_ref || ''
      grandTotalRef.value = version.totalsState.grand_total_ref || ''
      enableRetention.value = version.totalsState.enable_retention || false
      totalAfterRetentionRef.value = version.totalsState.total_after_retention_ref || ''
      vatAfterRetentionRef.value = version.totalsState.vat_after_retention_ref || ''
      grandTotalAfterRetentionRef.value = version.totalsState.grand_total_after_retention_ref || ''
      
      // Update computed values based on these references
      await debouncedUpdateTotals()
    }
  } else {
    console.warn('Selected version missing state data')
    initializeHandsontable()
  }
})

onBeforeUnmount(() => {
  if (hot.value) {
    hot.value.destroy()
  }
})
</script>