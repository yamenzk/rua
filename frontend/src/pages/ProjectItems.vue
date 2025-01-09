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

// State
const hotContainer = ref(null)
const hot = ref(null)
const showSaveDialog = ref(false)
const changeDescription = ref('')
const descriptionError = ref('')
const isSaving = ref(false)
const selectedVersion = ref(null)
const versions = ref([])

// Initialize empty spreadsheet configuration
const defaultConfig = {
  data: [Array(5).fill('')], // Start with one empty row and 5 columns
  colHeaders: true,
  rowHeaders: true,
  formulas: {
    engine: HyperFormula,
    sheetName: 'Sheet1',
    sheetId: 0
  },
  licenseKey: 'non-commercial-and-evaluation',
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
  minSpareRows: 1, // Always keep one empty row at the bottom
  afterChange: (changes) => {
    if (!changes) return
    
    // Get the last row with data
    const data = hot.value.getData()
    const lastRowWithData = data.reduce((lastRow, currentRow, index) => {
      return currentRow.some(cell => cell !== null && cell !== '') ? index : lastRow
    }, -1)

    // If data was entered in the last available row, add a new row
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

// Methods
function initializeHandsontable(config = defaultConfig) {
  if (hot.value) {
    hot.value.destroy()
  }

  const finalConfig = { 
    ...defaultConfig,
    data: config.data || defaultConfig.data
  }

  // Initialize HyperFormula with the data
  const hyperFormulaInstance = HyperFormula.buildEmpty({
    ...defaultConfig.formulas.engineSettings
  });

  finalConfig.formulas = {
    ...defaultConfig.formulas,
    engine: hyperFormulaInstance
  }

  hot.value = new Handsontable(hotContainer.value, finalConfig)

  // If we have stored formulas, apply them after initialization
  if (config.formulas && Array.isArray(config.formulas)) {
    config.formulas.forEach((row, rowIndex) => {
      row.forEach((formula, colIndex) => {
        if (formula) {
          hot.value.setDataAtCell(rowIndex, colIndex, formula)
        }
      })
    })
  }
}

function getSpreadsheetState() {
  if (!hot.value) return null

  try {
    // Get raw data and formulas
    const rawData = hot.value.getData()
    const lastRowWithData = rawData.reduce((lastRow, currentRow, index) => {
      return currentRow.some(cell => cell !== null && cell !== '') ? index : lastRow
    }, -1)
    
    // Keep data up to the last non-empty row plus one empty row
    const data = rawData.slice(0, lastRowWithData + 2)
    
    // Create a matrix to store formulas
    const formulas = Array.from({ length: data.length }, (_, row) =>
      Array.from({ length: data[0].length }, (_, col) => {
        const cellFormula = hot.value.getSourceDataAtCell(row, col)
        // Only store if it's actually a formula
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

    if (!props.project) {
      console.error('Project data not available')
      return
    }

    if (!hot.value) {
      console.error('Spreadsheet not initialized')
      return
    }

    isSaving.value = true
    
    // Get current state excluding empty rows at the end
    const currentState = getSpreadsheetState()
    if (!currentState) {
      console.error('Failed to get spreadsheet state')
      return
    }
    
    const newVersion = {
      timestamp: new Date().toISOString(),
      user: session.user,
      description: changeDescription.value.trim(),
      state: currentState
    }

    // Get current items_log or initialize new array
    let itemsLog = []
    try {
      itemsLog = props.project.items_log ? JSON.parse(props.project.items_log) : []
    } catch (err) {
      console.warn('Failed to parse existing items_log, starting fresh:', err)
    }

    // Add new version
    itemsLog.push(newVersion)

    // Save to backend
    await props.projectResource.setValue.submit({
      name: props.project.name,
      items_log: JSON.stringify(itemsLog)
    })

    // Update local state
    versions.value = itemsLog
    selectedVersion.value = newVersion.timestamp
    
    // Reset form and close dialog
    showSaveDialog.value = false
    changeDescription.value = ''
    descriptionError.value = ''
    
    console.log('Version saved successfully')
  } catch (error) {
    console.error('Failed to save version:', error)
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Wait for project data to be available
  if (!props.project) {
    console.warn('Project data not available on mount')
    initializeHandsontable()
    return
  }

  // Initialize versions from project data
  try {
    if (props.project.items_log) {
      versions.value = JSON.parse(props.project.items_log) || []
      
      // Select latest version if available
      if (versions.value.length) {
        selectedVersion.value = versions.value[versions.value.length - 1].timestamp
      }
    } else {
      versions.value = []
    }
  } catch (error) {
    console.error('Failed to parse items_log:', error)
    versions.value = []
  }

  // Initialize spreadsheet with latest version or default config
  if (versions.value.length > 0) {
    const latestVersion = versions.value[versions.value.length - 1]
    if (latestVersion.state) {
      initializeHandsontable({
        ...defaultConfig,
        ...latestVersion.state
      })
    } else {
      console.warn('Latest version missing state data')
      initializeHandsontable()
    }
  } else {
    initializeHandsontable()
  }
})

// Watch for project changes
watch(() => props.project, (newProject) => {
  if (!newProject) return
  
  try {
    const itemsLog = newProject.items_log ? JSON.parse(newProject.items_log) : []
    versions.value = itemsLog
    
    if (itemsLog.length && !selectedVersion.value) {
      selectedVersion.value = itemsLog[itemsLog.length - 1].timestamp
    }
  } catch (error) {
    console.error('Failed to parse items_log from updated project:', error)
  }
}, { deep: true })

// Watch for version changes
watch(selectedVersion, (newVersion) => {
  if (!newVersion) return

  const version = versions.value.find(v => v.timestamp === newVersion)
  if (version?.state) {
    initializeHandsontable({
      ...defaultConfig,
      ...version.state
    })
  } else {
    console.warn('Selected version missing state data')
    initializeHandsontable()
  }
})

// Clean up
onBeforeUnmount(() => {
  if (hot.value) {
    hot.value.destroy()
  }
})
</script>