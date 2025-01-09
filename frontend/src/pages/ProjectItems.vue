<!-- ProjectItems.vue -->
<style scoped>
.hot-table {
  width: 100%;
  min-height: 500px;
  z-index: 10 !important;
}

.handsontable{
  z-index: 10 !important;
}

:deep(.htContainer) {
  overflow: hidden !important;
}

:deep(.htFocusCatcher) {
  display: none !important; /* Hide the focus catcher */
}

.version-diff {
  max-height: 400px;
  overflow-y: auto;
}

.diff-added {
  @apply bg-green-100 text-green-800;
}

.diff-removed {
  @apply bg-red-100 text-red-800;
}
</style>

<template>
  <div class="space-y-6">
    <div v-if="isInitializing" class="flex justify-center items-center h-64">
      <div class="loading-spinner">
        <div class="text-sm text-gray-600">Initializing spreadsheets...</div>
      </div>
    </div>
    
    <div v-else>
      <!-- Header Section -->
      <div class="flex justify-between items-center px-6 py-4 bg-white border-b">
        <div>
          <h1 class="text-xl font-medium text-gray-900">Project Items</h1>
          <p class="text-sm text-gray-500">Manage and track project items across multiple categories</p>
        </div>
        <div class="flex items-center space-x-3">
          <Button
            variant="outline"
            @click="openHistoryDialog"
            :disabled="!currentTabState.spreadsheetInitialized"
          >
            <template #prefix>
              <FeatherIcon name="clock" class="w-4 h-4" />
            </template>
            History
          </Button>
          <Button
            variant="primary"
            @click="openSaveDialog"
            :disabled="!currentTabState.spreadsheetInitialized"
          >
            <template #prefix>
              <FeatherIcon name="save" class="w-4 h-4" />
            </template>
            Save Version
          </Button>
        </div>
      </div>

      <div class="px-6 py-4">
        <!-- Unsaved Changes Warning -->
        <div 
          v-if="hasUnsavedChanges"
          class="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div class="flex items-center">
            <FeatherIcon name="alert-triangle" class="w-5 h-5 text-amber-500 mr-2" />
            <div>
              <h3 class="font-medium text-amber-800">Unsaved Changes</h3>
              <p class="text-sm text-amber-700">
                You have unsaved changes in the current tab. Please save your work.
              </p>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="mb-6" v-if="!hasUnsavedChanges">
          <TabButtons
            :buttons="[
              { label: 'Category 1', value: 'tab1' },
              { label: 'Category 2', value: 'tab2' },
              { label: 'Category 3', value: 'tab3' },
              { label: 'Category 4', value: 'tab4' },
            ]"
            v-model="currentTab"
            @change="handleTabChange"
          />
        </div>

        <!-- Spreadsheet Container -->
        <div class="bg-white rounded-lg border shadow-sm mb-6">
          <div class="relative overflow-hidden">
            <template v-for="tabKey in Object.keys(tabStates)" :key="tabKey">
              <div 
                :ref="el => setSpreadsheetRef(tabKey, el)"
                :class="['hot-table', { 'hidden': currentTab !== tabKey }]"
              ></div>
            </template>
          </div>

          <!-- Summary Panel -->
          <div class="p-4 border-t bg-gray-50">
            <div class="flex overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 space-x-4">
              <div class="p-3 bg-white rounded-lg border min-w-[200px] flex flex-col justify-between space-y-1">
                <div class="text-sm text-gray-600">Total Items</div>
                <div class="text-lg font-medium">{{ currentTabState.totalItems || 0 }}</div>
                <div class="text-xs text-gray-500">Reference: {{ currentTabState.totalItemsRef || '' }}</div>
              </div>
              <div class="p-3 bg-white rounded-lg border min-w-[200px] flex flex-col justify-between">
                <div class="text-sm text-gray-600">Total</div>
                <div class="text-lg font-medium">{{ formatCurrency(currentTabState.total) || 0 }}</div>
                <div class="text-xs text-gray-500">Reference: {{ currentTabState.totalRef || '' }}</div>
              </div>
              <div class="p-3 bg-white rounded-lg border min-w-[200px] flex flex-col justify-between">
                <div class="text-sm text-gray-600">Total After Retention</div>
                <div class="text-lg font-medium">{{ formatCurrency(currentTabState.totalAfterRetention) || 0 }}</div>
                <div class="text-xs text-gray-500">Reference: {{ currentTabState.totalAfterRetentionRef || '' }}</div>
              </div>
              <div class="p-3 bg-white rounded-lg border min-w-[200px] flex flex-col justify-between">
                <div class="text-sm text-gray-600">VAT Amount</div>
                <div class="text-lg font-medium">{{ formatCurrency(currentTabState.vatAmount) || 0 }}</div>
                <div class="text-xs text-gray-500">Reference: {{ currentTabState.vatAmountRef || '' }}</div>
              </div>
              <div class="p-3 bg-white rounded-lg border min-w-[200px] flex flex-col justify-between">
                <div class="text-sm text-gray-600">VAT After Retention</div>
                <div class="text-lg font-medium">{{ formatCurrency(currentTabState.vatAfterRetention) || 0 }}</div>
                <div class="text-xs text-gray-500">Reference: {{ currentTabState.vatAfterRetentionRef || '' }}</div>
              </div>
              <div class="p-3 bg-white rounded-lg border min-w-[200px] flex flex-col justify-between">
                <div class="text-sm text-gray-600">Grand Total</div>
                <div class="text-lg font-medium">{{ formatCurrency(currentTabState.grandTotal) || 0 }}</div>
                <div class="text-xs text-gray-500">Reference: {{ currentTabState.grandTotalRef || '' }}</div>
              </div>
              <div class="p-3 bg-white rounded-lg border min-w-[200px] flex flex-col justify-between">
                <div class="text-sm text-gray-600">Grand Total After Retention</div>
                <div class="text-lg font-medium">{{ formatCurrency(currentTabState.grandTotalAfterRetention) || 0 }}</div>
                <div class="text-xs text-gray-500">Reference: {{ currentTabState.grandTotalAfterRetentionRef || '' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals Section -->
        <div class="bg-white rounded-lg border shadow-sm">
          <div class="p-4 border-b">
            <h3 class="text-base font-medium">Summary</h3>
            <p class="text-sm text-gray-600">Track and manage totals for the current category</p>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <!-- Main Totals Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormControl
                  type="text"
                  label="Total Items Cell Reference"
                  v-model="currentTabState.totalItemsRef"
                  @change="debouncedUpdateTotals(currentTabState, currentTabState.spreadsheetInstance)"
                  placeholder="e.g. F8"
                >
                  <template #help>
                    Current Value: {{ currentTabState.totalItems || '0' }}
                  </template>
                </FormControl>

                <FormControl
                  type="text"
                  label="Total Cell Reference"
                  v-model="currentTabState.totalRef"
                  @change="debouncedUpdateTotals(currentTabState, currentTabState.spreadsheetInstance)"
                  placeholder="e.g. F10"
                >
                  <template #help>
                    Current Value: {{ formatCurrency(currentTabState.total) }}
                  </template>
                </FormControl>

                <FormControl
                  type="text"
                  label="VAT Amount Cell Reference"
                  v-model="currentTabState.vatAmountRef"
                  @change="debouncedUpdateTotals(currentTabState, currentTabState.spreadsheetInstance)"
                  placeholder="e.g. F12"
                >
                  <template #help>
                    Current Value: {{ formatCurrency(currentTabState.vatAmount) }}
                  </template>
                </FormControl>

                <FormControl
                  type="text"
                  label="Grand Total Cell Reference"
                  v-model="currentTabState.grandTotalRef"
                  @change="debouncedUpdateTotals(currentTabState, currentTabState.spreadsheetInstance)"
                  placeholder="e.g. F14"
                >
                  <template #help>
                    Current Value: {{ formatCurrency(currentTabState.grandTotal) }}
                  </template>
                </FormControl>
              </div>

              <!-- Retention Section -->
              <div class="space-y-4 pt-4 border-t">
                <div class="flex items-center justify-between">
                  <Switch
                    v-model="currentTabState.enableRetention"
                    @change="handleRetentionToggle"
                  >
                    <div class="space-y-1">
                      <div class="font-medium">Enable Retention</div>
                      <div class="text-sm text-gray-500">
                        Track additional retention-based calculations
                      </div>
                    </div>
                  </Switch>
                </div>

                <div 
                  v-if="currentTabState.enableRetention"
                  class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4"
                >
                  <FormControl
                    type="text"
                    label="Total After Retention Reference"
                    v-model="currentTabState.totalAfterRetentionRef"
                    @change="debouncedUpdateTotals(currentTabState, currentTabState.spreadsheetInstance)"
                    placeholder="e.g. F16"
                  >
                    <template #help>
                      Current Value: {{ formatCurrency(currentTabState.totalAfterRetention) }}
                    </template>
                  </FormControl>

                  <FormControl
                    type="text"
                    label="VAT After Retention Reference"
                    v-model="currentTabState.vatAfterRetentionRef"
                    @change="debouncedUpdateTotals(currentTabState, currentTabState.spreadsheetInstance)"
                    placeholder="e.g. F18"
                  >
                    <template #help>
                      Current Value: {{ formatCurrency(currentTabState.vatAfterRetention) }}
                    </template>
                  </FormControl>

                  <FormControl
                    type="text"
                    label="Grand Total After Retention Reference"
                    v-model="currentTabState.grandTotalAfterRetentionRef"
                    @change="debouncedUpdateTotals(currentTabState, currentTabState.spreadsheetInstance)"
                    placeholder="e.g. F20"
                  >
                    <template #help>
                      Current Value: {{ formatCurrency(currentTabState.grandTotalAfterRetention) }}
                    </template>
                  </FormControl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Version Dialog -->
      <Dialog
        v-model="showSaveDialog"
        :options="{ title: 'Save New Version', size: 'md' }"
        style="z-index: 999999 !important;"
      >
        <template #body-content>
          <div class="space-y-4">
            <FormControl
              type="textarea"
              label="Description of Changes"
              v-model="changeDescription"
              :error="descriptionError"
              placeholder="Describe the changes made in this version..."
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

      <!-- History Dialog -->
      <Dialog
        v-model="showHistoryDialog"
        :options="{ title: 'Version History', size: 'xl' }"
        style="z-index: 999999 !important;"
      >
        <template #body-content>
          <div class="space-y-6">
            <!-- Version List -->
            <div class="border rounded-lg">
              <div class="px-4 py-3 bg-gray-50 border-b">
                <h3 class="text-sm font-medium">Select a version to compare or restore</h3>
              </div>
              <div class="divide-y max-h-64 overflow-y-auto">
                <template v-for="(version, index) in versions" :key="version.timestamp">
                  <div
                    class="px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    :class="{ 'bg-blue-50': selectedVersion === version.timestamp }"
                    @click="() => { selectedVersion = version.timestamp }"
                  >
                    <div class="space-y-1">
                      <div class="text-sm font-medium flex items-center">
                        {{ new Date(version.timestamp).toLocaleString() }}
                        <Badge
                          v-if="index === versions.length - 1"
                          variant="success"
                          class="ml-2"
                        >
                          Latest
                        </Badge>
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ version.user }} - {{ version.description }}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      @click.stop="showDiff(version)"
                    >
                      View Changes
                    </Button>
                  </div>
                </template>
              </div>
            </div>

            <!-- Diff View -->
            <template v-if="selectedVersionForDiff">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium">Changes in this version</h3>
                  <Button
                    variant="primary"
                    size="sm"
                    @click="applyVersion(selectedVersionForDiff)"
                  >
                    Restore This Version
                  </Button>
                </div>
                <div class="version-diff border rounded-lg divide-y">
                  <template v-for="(change, index) in versionDiff" :key="index">
                    <div
                      class="px-4 py-2 text-sm"
                      :class="{
                        'diff-added': change.type === 'added',
                        'diff-removed': change.type === 'removed'
                      }"
                    >
                      <pre class="whitespace-pre-wrap">{{ change.value }}</pre>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick, reactive } from 'vue'
import Handsontable from 'handsontable'
import { HyperFormula } from 'hyperformula'
import 'handsontable/dist/handsontable.full.css'
import { 
  Dialog,
  Button,
  FormControl,
  Badge,
  Switch,
  TabButtons,
  FeatherIcon,
  debounce
} from 'frappe-ui'
import { session } from '../data/session'
import { DiffPatcher } from 'jsondiffpatch'
import { cloneDeep as deepClone } from 'lodash-es'

// Initialize DiffPatcher instance
const diffPatcher = new DiffPatcher({
  objectHash: (obj) => JSON.stringify(obj),
  arrays: { detectMove: true }
})

const props = defineProps({
  project: {
    type: Object,
    required: false,
    default: null
  },
  projectResource: {
    type: Object,
    required: true
  }
})

// State Management
const currentTab = ref('tab1')
const spreadsheetContainers = ref({});
const containerRefs = ref(new Map());
const containerStatus = reactive({
  tab1: false,
  tab2: false,
  tab3: false,
  tab4: false
});
// Setup initial tab states with refs
const spreadsheetRefs = ref({
  tab1: null,
  tab2: null,
  tab3: null,
  tab4: null
});

const setSpreadsheetRef = (tabKey, el) => {
  if (el) {
    spreadsheetRefs.value[tabKey] = el;
    tabStates.value[tabKey].tabKey = tabKey; // Add this line
    containerStatus[tabKey] = true;
    //console.log(`Ref set for ${tabKey}, container status:`, JSON.stringify(containerStatus, null, 2));
  }
};

// Watch for container readiness
watch(containerStatus, async (newStatus, oldStatus) => {
  const allContainersReady = Object.values(newStatus).every(status => status);
  //console.log('Container status updated:', { newStatus, allContainersReady });
  
  if (allContainersReady) {
    try {
      //console.log('All containers ready, starting initialization');
      
      // Initialize current tab first
      //console.log('Initializing current tab:', currentTab.value);
      const currentTabResult = await initializeTabSpreadsheet(currentTab.value);
      
      if (currentTabResult) {
        // Then initialize other tabs
        const otherTabs = Object.keys(tabStates.value)
          .filter(tab => tab !== currentTab.value);

        //console.log('Initializing other tabs:', otherTabs);
        for (const tabKey of otherTabs) {
          await initializeTabSpreadsheet(tabKey);
        }
      }

      //console.log('Initialization complete');
      isInitializing.value = false;
      
    } catch (error) {
      console.error('Error during initialization:', error);
      isInitializing.value = false;
    }
  }
}, { deep: true });

onMounted(() => {
  // Add beforeunload event listener
  window.addEventListener('beforeunload', handleBeforeUnload);
});

const isInitializing = ref(true)
const showSaveDialog = ref(false)
const showHistoryDialog = ref(false)
const changeDescription = ref('')
const descriptionError = ref('')
const isSaving = ref(false)
const selectedVersion = ref(null)
const selectedVersionForDiff = ref(null)
const versionDiff = ref([])

// Create initial tab state structure
const createInitialTabState = () => ({
  spreadsheetInitialized: false,
  spreadsheetInstance: null,
  hasUnsavedChanges: false,
  initialState: null,
  spreadsheetData: [Array(5).fill('')],
  totalItemsRef: '',
  totalRef: '',
  vatAmountRef: '',
  grandTotalRef: '',
  enableRetention: false,
  totalAfterRetentionRef: '',
  vatAfterRetentionRef: '',
  grandTotalAfterRetentionRef: '',
  totalItems: '',
  total: '',
  vatAmount: '',
  grandTotal: '',
  totalAfterRetention: '',
  vatAfterRetention: '',
  grandTotalAfterRetention: '',
  dataLoaded: false
})

// Initialize state for all tabs
const tabStates = ref({
  tab1: createInitialTabState(),
  tab2: createInitialTabState(),
  tab3: createInitialTabState(),
  tab4: createInitialTabState()
})

// Computed Properties
const currentTabState = computed(() => tabStates.value[currentTab.value])

const versions = computed(() => {
  try {
    return props.project?.items_log ? JSON.parse(props.project.items_log) : []
  } catch (e) {
    console.error('Error parsing versions:', e)
    return []
  }
})

const hasUnsavedChanges = computed(() => 
  Object.values(tabStates.value).some(state => 
    state.hasUnsavedChanges && 
    state.spreadsheetInitialized && 
    state.initialState !== null
  )
)

// Utility Functions
function formatCurrency(value) {
  if (!value) return '0.00'
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED'
  }).format(parseFloat(value))
}

function convertToColumnName(num) {
  let columnName = '';
  while (num >= 0) {
    columnName = String.fromCharCode(65 + (num % 26)) + columnName;
    num = Math.floor(num / 26) - 1;
  }
  return columnName;
}

function parseColumnName(columnName) {
  return columnName.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1
}

function getCellValue(cellRef, hot) {
  if (!cellRef || !hot) return '';

  try {
    const match = cellRef.match(/([A-Z]+)(\d+)/);
    if (!match) return '';

    const col = parseColumnName(match[1]);
    const row = parseInt(match[2]) - 1;

    if (isNaN(row) || isNaN(col)) return '';

    const calculatedValue = hot.getDataAtCell(row, col);
    const cellProperties = hot.getCellMeta(row, col);
    
    const rawValue = hot.getSourceDataAtCell(row, col);
    const isFormula = typeof rawValue === 'string' && rawValue.startsWith('=');
    
    return isFormula ? calculatedValue : rawValue;
  } catch (error) {
    console.error('Error getting cell value:', error);
    return '';
  }
}

// Delta Versioning Functions
function formatDiffForDisplay(diff) {
  const changes = []
  
  function formatValue(value) {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  function processCell(path, oldValue, newValue) {
    if (oldValue === undefined && newValue !== undefined) {
      changes.push({
        type: 'added',
        path,
        value: `Added: ${formatValue(newValue)}`
      })
    } else if (oldValue !== undefined && newValue === undefined) {
      changes.push({
        type: 'removed',
        path,
        value: `Removed: ${formatValue(oldValue)}`
      })
    } else if (oldValue !== newValue) {
      changes.push({
        type: 'removed',
        path,
        value: `Old: ${formatValue(oldValue)}`
      })
      changes.push({
        type: 'added',
        path,
        value: `New: ${formatValue(newValue)}`
      })
    }
  }

  function processData(obj, path = '') {
    if (!obj || typeof obj !== 'object') return
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (item && Array.isArray(item) && item.length === 2) {
          processCell(`${path}[${index}]`, item[0], item[1])
        }
      })
      return
    }

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key
      
      if (key === 'data' && Array.isArray(value)) {
        value.forEach((row, rowIndex) => {
          if (Array.isArray(row)) {
            row.forEach((cell, colIndex) => {
              if (cell && Array.isArray(cell)) {
                processCell(`Cell R${rowIndex + 1}C${colIndex + 1}`, cell[0], cell[1])
              }
            })
          }
        })
      } else if (key === 'references' || key === 'values') {
        Object.entries(value).forEach(([refKey, refValue]) => {
          if (refValue && Array.isArray(refValue)) {
            processCell(`${key}.${refKey}`, refValue[0], refValue[1])
          }
        })
      } else if (value && typeof value === 'object') {
        processData(value, currentPath)
      }
    })
  }
  
  processData(diff)
  return changes.filter(change => change.value !== undefined && change.value !== '')
}

// Spreadsheet State Management
function getSpreadsheetState(hot, tabKey) {
  if (!hot) return null

  try {
    const rawData = hot.getData()
    const lastRowWithData = rawData.reduce((lastRow, currentRow, index) => {
      return currentRow.some(cell => cell !== null && cell !== '') ? index : lastRow
    }, -1)
    
    const data = Array.from({ length: lastRowWithData + 2 }, (_, rowIndex) =>
      Array.from({ length: hot.countCols() }, (_, colIndex) => {
        const sourceData = hot.getSourceDataAtCell(rowIndex, colIndex)
        return sourceData !== null ? sourceData : ''
      })
    )
    
    return {
      tabKey,
      data,
      colHeaders: hot.getColHeader(),
      rowHeaders: hot.getRowHeader(),
      columnWidths: Array.from({ length: hot.countCols() }, (_, i) => hot.getColWidth(i)),
      rowHeights: Array.from({ length: data.length }, (_, i) => hot.getRowHeight(i)),
      merges: hot.getPlugin('mergeCells').mergedCellsCollection.mergedCells
    }
  } catch (error) {
    console.error('Error getting spreadsheet state:', error)
    return null
  }
}

function getReferencesState(state, tabKey) {
  return {
    tabKey,
    references: {
      total_items_ref: state.totalItemsRef || '',
      total_ref: state.totalRef || '',
      vat_amount_ref: state.vatAmountRef || '',
      grand_total_ref: state.grandTotalRef || '',
      enable_retention: state.enableRetention || false,
      total_after_retention_ref: state.totalAfterRetentionRef || '',
      vat_after_retention_ref: state.vatAfterRetentionRef || '',
      grand_total_after_retention_ref: state.grandTotalAfterRetentionRef || ''
    }
  }
}

// Spreadsheet Configuration
function createHandsontableConfig(data, tabKey) {
  return {
    data: data || [Array(5).fill('')],
    colHeaders: true,
    rowHeaders: true,
    formulas: {
      engine: HyperFormula,
      sheetName: `Sheet_${tabKey}`,
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
    licenseKey: 'non-commercial-and-evaluation',
    // Add these properties
    outsideClickDeselects: true,
    width: '100%',
    renderAllRows: false,
    viewportColumnRenderingOffset: 10,
    viewportRowRenderingOffset: 10,
    // Adjust table dimensions
    wordWrap: true,
    colWidths: 100,
    rowHeights: 23,
    // Better scrolling
    fixedRowsTop: 0,
    fixedColumnsLeft: 0
  }
}

// Initialization Functions
async function initializeCurrentTab() {
  const maxRetries = 5;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    if (spreadsheetRefs.value[currentTab.value]) {
      await initializeTabSpreadsheet(currentTab.value);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    retryCount++;
  }
  console.error(`Failed to initialize current tab after ${maxRetries} retries`);
}

async function initializeOtherTabs() {
  const otherTabs = Object.keys(tabStates.value).filter(tab => tab !== currentTab.value);
  for (const tabKey of otherTabs) {
    if (spreadsheetRefs.value[tabKey]) {
      await initializeTabSpreadsheet(tabKey);
    }
  }
}

// Add this utility function
function getTabSuffix(tabKey) {
  return tabKey === 'tab1' ? '' : `_${tabKey.slice(-1)}`;
}
async function initializeTabSpreadsheet(tabToInitialize) {
  const state = tabStates.value[tabToInitialize];
  const container = spreadsheetRefs.value[tabToInitialize];
  const suffix = getTabSuffix(tabToInitialize); // Add this line

  if (!container) {
    //console.error(`No container available for ${tabToInitialize}`);
    return null;
  }

  try {
    // Clear any existing instance
    if (state.spreadsheetInstance) {
      state.spreadsheetInstance.destroy();
      state.spreadsheetInstance = null;
    }

    // Initialize with default empty state
    let initialData = [Array(5).fill('')];
    let initialConfig = {};

    // Load versions list eagerly
    const versionsList = props.project?.items_log ? 
      JSON.parse(props.project.items_log) : [];
    
    if (versionsList.length) {
      const latestVersion = versionsList[versionsList.length - 1];
      const tabData = latestVersion.tabStates?.find(s => s.tabKey === tabToInitialize);
      
      if (tabData?.state?.data) {
        //console.log(`Found existing data for ${tabToInitialize}`);
        initialData = tabData.state.data;
        initialConfig = {
          colHeaders: tabData.state.colHeaders,
          colWidths: tabData.state.columnWidths,
          rowHeights: tabData.state.rowHeights,
          mergeCells: tabData.state.merges || []
        };
        
        const tabRefs = latestVersion.references?.find(r => r.tabKey === tabToInitialize);
        if (tabRefs?.references) {
          Object.assign(state, {
            totalItemsRef: tabRefs.references.total_items_ref || '',
            totalRef: tabRefs.references.total_ref || '',
            vatAmountRef: tabRefs.references.vat_amount_ref || '',
            grandTotalRef: tabRefs.references.grand_total_ref || '',
            enableRetention: tabRefs.references.enable_retention || false,
            totalAfterRetentionRef: tabRefs.references.total_after_retention_ref || '',
            vatAfterRetentionRef: tabRefs.references.vat_after_retention_ref || '',
            grandTotalAfterRetentionRef: tabRefs.references.grand_total_after_retention_ref || ''
          });
        }
      } else {
        //console.log(`No existing data found for ${tabToInitialize} in versions`);
      }
    }
    
    // If no version data, try to load from project
    if (!state.totalItemsRef) {
      //console.log(`Loading project data for ${tabToInitialize}`);
      Object.assign(state, {
        totalItemsRef: props.project[`total_items_ref${suffix}`] || '',
        totalRef: props.project[`total_ref${suffix}`] || '',
        vatAmountRef: props.project[`vat_amount_ref${suffix}`] || '',
        grandTotalRef: props.project[`grand_total_ref${suffix}`] || '',
        enableRetention: props.project[`enable_retention${suffix}`] || false,
        totalAfterRetentionRef: props.project[`total_after_retention_ref${suffix}`] || '',
        vatAfterRetentionRef: props.project[`vat_after_retention_ref${suffix}`] || '',
        grandTotalAfterRetentionRef: props.project[`grand_total_after_retention_ref${suffix}`] || ''
      });
    }


    // Create Handsontable instance
    const config = {
      ...createHandsontableConfig(initialData, tabToInitialize),
      ...initialConfig,
      afterChange: (changes, source) => {
        if (!changes || source === 'loadData') return;
        handleSpreadsheetChanges(state, hot);
      },
      afterCreateRow: () => {
        handleSpreadsheetChanges(state, hot);
      },
      afterMergeCells: () => {
        handleSpreadsheetChanges(state, hot);
      },
      afterUnmergeCells: () => {
        handleSpreadsheetChanges(state, hot);
      }
    };

    const hot = new Handsontable(container, config);

    // Set tabKey on state
    state.tabKey = tabToInitialize;  // Add this line to ensure tabKey is set

    // Update state
    state.spreadsheetInstance = hot;
    state.spreadsheetInitialized = true;
    state.initialState = getSpreadsheetState(hot, tabToInitialize);
    state.dataLoaded = true;
    
    await debouncedUpdateTotals(state, hot);
    
    //console.log(`Successfully initialized ${tabToInitialize}`);
    return hot;

  } catch (error) {
    console.error(`Error initializing ${tabToInitialize}:`, error);
    state.spreadsheetInitialized = false;
    state.dataLoaded = false;
    return null;
  }
}

// Spreadsheet Changes Handler
function handleSpreadsheetChanges(state, hot) {
  if (!state || !hot) return;

  const data = hot.getData();
  
  // Check for the last row with data
  const lastRowWithData = data.reduce((lastRow, currentRow, index) => {
    return currentRow.some(cell => cell !== null && cell !== '') ? index : lastRow;
  }, -1);

  // Insert a new row if the last row with data is near the bottom
  if (lastRowWithData >= hot.countRows() - 2) {
    hot.alter('insert_row_below', hot.countRows() - 1, 1);
  }

  // Get the current state of the spreadsheet
  const currentState = getSpreadsheetState(hot, state.tabKey);

  // Detect unsaved changes by comparing current state to initial state
  const isStateChanged = currentState && state.initialState
    ? JSON.stringify(currentState.data) !== JSON.stringify(state.initialState.data)
    : false;

  // Now check if any referenced cells have changed (for totals update)
  const referencedCells = [
    state.totalItemsRef,
    state.totalRef,
    state.vatAmountRef,
    state.grandTotalRef,
    ...(state.enableRetention ? [
      state.totalAfterRetentionRef,
      state.vatAfterRetentionRef,
      state.grandTotalAfterRetentionRef
    ] : [])
  ].filter(Boolean);

  // Update totals if any referenced cell has changed
  if (referencedCells.length > 0 || isStateChanged) {
    debouncedUpdateTotals(state, hot);
  }

  // Mark the state as having unsaved changes if there's a meaningful difference
  state.hasUnsavedChanges = isStateChanged || referencedCells.length > 0;
}

// Version Management
async function openHistoryDialog() {
  showHistoryDialog.value = true;
  selectedVersion.value = null;
  selectedVersionForDiff.value = null;
  versionDiff.value = [];
}

async function showDiff(version) {
  try {
    selectedVersionForDiff.value = version;
    const versionIndex = versions.value.findIndex(v => v.timestamp === version.timestamp);
    
    if (versionIndex > 0) {
      const previousVersion = versions.value[versionIndex - 1];
      const delta = diffPatcher.diff({
        spreadsheet: previousVersion.tabStates,
        references: previousVersion.references
      }, {
        spreadsheet: version.tabStates,
        references: version.references
      });
      
      versionDiff.value = formatDiffForDisplay(delta);
    } else {
      versionDiff.value = [{
        type: 'added',
        path: 'Initial Version',
        value: `Created by ${version.user} on ${new Date(version.timestamp).toLocaleString()}`
      }];
    }
  } catch (error) {
    console.error('Error showing diff:', error);
  }
}

async function applyVersion(version) {
  if (!version || !version.tabStates) {
    return;
  }

  try {
    // Apply version state to all tabs
    for (const [tabKey, tabState] of Object.entries(tabStates.value)) {
      const versionTabState = version.tabStates.find(s => s.tabKey === tabKey);
      if (!versionTabState?.state || !tabState.spreadsheetInstance) continue;

      const hot = tabState.spreadsheetInstance;

      if (!Array.isArray(versionTabState.state.data)) {
        throw new Error(`Invalid data format for tab ${tabKey}`);
      }

      hot.loadData(versionTabState.state.data);

      const settings = {
        colHeaders: versionTabState.state.colHeaders,
        mergeCells: versionTabState.state.merges || [],
      };

      if (Array.isArray(versionTabState.state.columnWidths)) {
        settings.colWidths = versionTabState.state.columnWidths;
      }

      if (Array.isArray(versionTabState.state.rowHeights)) {
        settings.rowHeights = versionTabState.state.rowHeights;
      }

      hot.updateSettings(settings);

      const versionRefs = version.references?.find(r => r.tabKey === tabKey);
      if (versionRefs) {
        Object.assign(tabState, {
          totalItemsRef: versionRefs.references.total_items_ref || '',
          totalRef: versionRefs.references.total_ref || '',
          vatAmountRef: versionRefs.references.vat_amount_ref || '',
          grandTotalRef: versionRefs.references.grand_total_ref || '',
          enableRetention: versionRefs.references.enable_retention || false,
          totalAfterRetentionRef: versionRefs.references.total_after_retention_ref || '',
          vatAfterRetentionRef: versionRefs.references.vat_after_retention_ref || '',
          grandTotalAfterRetentionRef: versionRefs.references.grand_total_after_retention_ref || ''
        });
      }

      tabState.initialState = getSpreadsheetState(hot, tabKey);
      tabState.hasUnsavedChanges = false;

      await debouncedUpdateTotals(tabState, hot);
    }

    showHistoryDialog.value = false;

  } catch (error) {
    console.error('Error applying version:', error);
  }
}

// Save Version Dialog
async function openSaveDialog() {
  changeDescription.value = '';
  descriptionError.value = '';
  showSaveDialog.value = true;
}

// Save Version
async function saveVersion() {
  try {
    //console.log('Save Version started');
    //console.log('Change description:', changeDescription.value);

    if (!changeDescription.value.trim()) {
      descriptionError.value = 'Please describe the changes made in this version';
      return;
    }

    isSaving.value = true;
    //console.log('isSaving set to true');

    const allTabStates = Object.entries(tabStates.value).map(([tabKey, tabState]) => {
      //console.log(`Processing tab: ${tabKey}`);
      
      if (!spreadsheetRefs.value[tabKey] || !tabState.spreadsheetInstance) {
        console.warn(`No container or instance for tab ${tabKey}, using existing data`);
        return {
          tabKey,
          state: {
            tabKey,
            data: tabState.spreadsheetData || [Array(5).fill('')],
            colHeaders: true,
            rowHeaders: true,
            columnWidths: [],
            rowHeights: [],
            merges: []
          },
          references: getReferencesState(tabState, tabKey)
        };
      }

      const state = getSpreadsheetState(tabState.spreadsheetInstance, tabKey);
      if (!state) {
        console.error(`Failed to get state for tab ${tabKey}`);
        throw new Error(`Failed to get state for tab ${tabKey}`);
      }
      
      return {
        tabKey,
        state,
        references: getReferencesState(tabState, tabKey)
      };
    });

    //console.log('All tab states:', allTabStates);

    let versionsList = versions.value || [];

    const newVersion = {
      timestamp: new Date().toISOString(),
      user: session.user,
      description: changeDescription.value.trim(),
      tabStates: allTabStates.map(tab => ({
        tabKey: tab.tabKey,
        state: tab.state
      })),
      references: allTabStates.map(tab => tab.references),
      delta: versionsList.length ? diffPatcher.diff({
        tabStates: versionsList[versionsList.length - 1].tabStates,
        references: versionsList[versionsList.length - 1].references
      }, {
        tabStates: allTabStates.map(tab => ({
          tabKey: tab.tabKey,
          state: tab.state
        })),
        references: allTabStates.map(tab => tab.references)
      }) : null
    };

    versionsList.push(newVersion);

    const updateData = {
      name: props.project.name,
      items_log: JSON.stringify(versionsList)
    };

    Object.entries(tabStates.value).forEach(([tabKey, tabState]) => {
      const suffix = tabKey === 'tab1' ? '' : `_${tabKey.slice(-1)}`;

      Object.assign(updateData, {
        [`enable_retention${suffix}`]: tabState.enableRetention || false,
        [`total_items_ref${suffix}`]: tabState.totalItemsRef || '',
        [`total_ref${suffix}`]: tabState.totalRef || '',
        [`vat_amount_ref${suffix}`]: tabState.vatAmountRef || '',
        [`grand_total_ref${suffix}`]: tabState.grandTotalRef || '',
        [`total_after_retention_ref${suffix}`]: tabState.totalAfterRetentionRef || '',
        [`vat_after_retention_ref${suffix}`]: tabState.vatAfterRetentionRef || '',
        [`grand_total_after_retention_ref${suffix}`]: tabState.grandTotalAfterRetentionRef || ''
      });
    });

    //console.log('Update data:', updateData);

    const result = await props.projectResource.setValue.submit(updateData);
    //console.log('Save result:', result);

    Object.values(tabStates.value).forEach(tabState => {
      if (tabState.spreadsheetInstance) {
        const currentState = getSpreadsheetState(tabState.spreadsheetInstance, tabState.tabKey);
        tabState.initialState = currentState;
        tabState.hasUnsavedChanges = false;
      }
    });

    showSaveDialog.value = false;
    changeDescription.value = '';
    descriptionError.value = '';

  } catch (error) {
    console.error('Failed to save version:', error);
    alert(`Failed to save version: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
}

// Totals Update Handler
const debouncedUpdateTotals = debounce(async (state, hot) => {
  if (!state || typeof state === 'object' && !('spreadsheetInstance' in state)) {
    //console.log('Invalid state object received:', state);
    return;
  }

  if (!hot && state.spreadsheetInstance) {
    hot = state.spreadsheetInstance;
  }

  if (!hot) {
    //console.log('No valid spreadsheet instance found');
    return;
  }

  try {
    const parseValue = (value) => {
      if (!value) return '';
      const parsed = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? '' : parsed.toString();
    };

    const rawTotalItems = getCellValue(state.totalItemsRef, hot);
    //console.log('Raw total items value:', rawTotalItems);
    
    state.totalItems = parseValue(rawTotalItems);
    state.total = parseValue(getCellValue(state.totalRef, hot));
    state.vatAmount = parseValue(getCellValue(state.vatAmountRef, hot));
    state.grandTotal = parseValue(getCellValue(state.grandTotalRef, hot));
    state.totalAfterRetention = parseValue(getCellValue(state.totalAfterRetentionRef, hot));
    state.vatAfterRetention = parseValue(getCellValue(state.vatAfterRetentionRef, hot));
    state.grandTotalAfterRetention = parseValue(getCellValue(state.grandTotalAfterRetentionRef, hot));

    const suffix = state.tabKey === 'tab1' ? '' : `_${state.tabKey.slice(-1)}`;

    const updateData = {
      name: props.project.name,
      [`total_items_ref${suffix}`]: state.totalItemsRef,
      [`total_ref${suffix}`]: state.totalRef,
      [`vat_amount_ref${suffix}`]: state.vatAmountRef,
      [`grand_total_ref${suffix}`]: state.grandTotalRef,
      [`total_after_retention_ref${suffix}`]: state.totalAfterRetentionRef,
      [`vat_after_retention_ref${suffix}`]: state.vatAfterRetentionRef,
      [`grand_total_after_retention_ref${suffix}`]: state.grandTotalAfterRetentionRef,
      [`enable_retention${suffix}`]: state.enableRetention
    };

    await props.projectResource.setValue.submit(updateData);
  } catch (error) {
    console.error('Failed to update totals:', error);
  }
}, 500);

// Retention Toggle Handler
function handleRetentionToggle() {
  const state = currentTabState.value;
  if (!state.enableRetention) {
    state.totalAfterRetentionRef = '';
    state.vatAfterRetentionRef = '';
    state.grandTotalAfterRetentionRef = '';
  }
  
  handleSpreadsheetChanges(state, state.spreadsheetInstance);
}

// Tab Change Handler
async function handleTabChange(newTab) {
  if (hasUnsavedChanges.value && currentTab.value !== newTab) {
    const confirmed = window.confirm(
      'You have unsaved changes. Do you want to save before switching tabs?'
    );
    
    if (confirmed) {
      try {
        await saveVersion();
      } catch (error) {
        console.error('Failed to save changes', error);
        return;
      }
    } else {
      return;
    }
  }

  currentTab.value = newTab;
  await initializeTabSpreadsheet(newTab);
}

// Prevent unintended navigation
function handleBeforeUnload(e) {
  if (hasUnsavedChanges.value) {
    e.preventDefault();
    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    return e.returnValue;
  }
}

// Watchers
watch(() => currentTabState.value?.totalItemsRef, (newRef, oldRef) => {
  if (newRef !== oldRef) {
    const state = currentTabState.value;
    if (state?.spreadsheetInstance) {
      debouncedUpdateTotals(state, state.spreadsheetInstance);
      state.hasUnsavedChanges = true;
    }
  }
});

watch(() => currentTabState.value?.totalRef, (newRef, oldRef) => {
  if (newRef !== oldRef) {
    const state = currentTabState.value;
    if (state?.spreadsheetInstance) {
      debouncedUpdateTotals(state, state.spreadsheetInstance);
      state.hasUnsavedChanges = true;
    }
  }
});

watch(() => currentTabState.value?.vatAmountRef, (newRef, oldRef) => {
  if (newRef !== oldRef) {
    const state = currentTabState.value;
    if (state?.spreadsheetInstance) {
      debouncedUpdateTotals(state, state.spreadsheetInstance);
      state.hasUnsavedChanges = true;
    }
  }
});

watch(() => currentTabState.value?.grandTotalRef, (newRef, oldRef) => {
  if (newRef !== oldRef) {
    const state = currentTabState.value;
    if (state?.spreadsheetInstance) {
      debouncedUpdateTotals(state, state.spreadsheetInstance);
      state.hasUnsavedChanges = true;
    }
  }
});

watch(() => currentTabState.value?.totalAfterRetentionRef, (newRef, oldRef) => {
  if (newRef !== oldRef && currentTabState.value?.enableRetention) {
    const state = currentTabState.value;
    if (state?.spreadsheetInstance) {
      debouncedUpdateTotals(state, state.spreadsheetInstance);
      state.hasUnsavedChanges = true;
    }
  }
});

watch(() => currentTabState.value?.vatAfterRetentionRef, (newRef, oldRef) => {
  if (newRef !== oldRef && currentTabState.value?.enableRetention) {
    const state = currentTabState.value;
    if (state?.spreadsheetInstance) {
      debouncedUpdateTotals(state, state.spreadsheetInstance);
      state.hasUnsavedChanges = true;
    }
  }
});

watch(() => currentTabState.value?.grandTotalAfterRetentionRef, (newRef, oldRef) => {
  if (newRef !== oldRef && currentTabState.value?.enableRetention) {
    const state = currentTabState.value;
    if (state?.spreadsheetInstance) {
      debouncedUpdateTotals(state, state.spreadsheetInstance);
      state.hasUnsavedChanges = true;
    }
  }
});


// Lifecycle Hooks
onMounted(async () => {
  try {
    //console.log('Component mounted, starting initialization');
    
    // Add beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Initial delay to allow refs to be set
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    //console.log('Initializing current tab:', currentTab.value);
    const currentTabResult = await initializeTabSpreadsheet(currentTab.value);

    if (currentTabResult) {
      // Initialize other tabs
      const otherTabs = Object.keys(tabStates.value)
        .filter(tab => tab !== currentTab.value);

      //console.log('Initializing other tabs:', otherTabs);
      
      for (const tabKey of otherTabs) {
        await initializeTabSpreadsheet(tabKey);
      }
    }

    //console.log('All tabs initialized');
    isInitializing.value = false;

  } catch (error) {
    console.error('Error during initialization:', error);
    isInitializing.value = false;
  }
});

onBeforeUnmount(() => {
  // Remove beforeunload event listener
  window.removeEventListener('beforeunload', handleBeforeUnload);
  
  // Destroy all spreadsheet instances
  Object.values(tabStates.value).forEach(state => {
    if (state.spreadsheetInstance) {
      state.spreadsheetInstance.destroy();
    }
  });
});
</script>