# ProjectItems.vue
<template>
  <div class="space-y-8" v-if="projectResource">
    <!-- Loading State - Only show when not locked -->
    <div v-if="isLoading && !isLocked" class="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <div class="text-gray-700">
          <p class="font-medium">{{ loadingMessage }}</p>
          <p class="text-sm text-gray-500">{{ loadingDetail }}</p>
        </div>
      </div>
    </div>

    <!-- Error State - Only show when not locked -->
    <div v-if="initializationError && !isLocked" class="p-4 bg-red-100 text-red-700 rounded">
      Failed to initialize Univer: {{ initializationError.message }}
    </div>

    <!-- Header Section -->
    <div class="px-6 py-4 bg-white border-b flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <h1 class="text-xl font-semibold text-gray-900">Project Items</h1>
        <span
          v-if="isHotMode && !isLocked"
          class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
        >
          🔥 Hot Mode
        </span>
        <span
          v-if="!isHotMode && !isLocked"
          class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
        >
          😌 Relaxed Mode
        </span>

        <!-- Lock/Unlock Button -->
        <Button
          :variant="'outline'"
          theme="gray"
          size="sm"
          @click="handleLockClick"
        >
          <template #default>
            <div class="flex items-center gap-2">
              <FeatherIcon :name="isLocked ? 'lock' : 'unlock'" class="w-4 h-4" />
              <span>{{ isLocked ? 'Locked' : 'Unlocked' }}</span>
            </div>
          </template>
        </Button>
      </div>

      <!-- Active Users Display - Only show when not locked -->
      <div v-if="!isLocked" class="flex items-center space-x-2">
        <template v-for="(user, index) in activeUsers" :key="user">
          <Tooltip :text="user" placement="bottom">
            <Avatar
              shape="circle"
              :label="user"
              size="xl"
              :class="['ring-2', getUserColor(index)]"
            />
          </Tooltip>
        </template>
      </div>
    </div>

    <!-- Locked State -->
    <template v-if="isLocked">
      <div class="p-4 bg-yellow-50" style="margin: 0 !important">
        <p class="text-yellow-800">
          Items have been locked by
          {{ lockedData?.user === session.user ? 'you' : lockedData?.user || 'an unknown user' }}.
          {{ session.user === lockedData?.user 
            ? 'Click the unlock button to modify the data.' 
            : 'Please ask the user to unlock it if you need to make changes.' }}
        </p>
      </div>

      <!-- Locked Items List -->
      <div class="overflow-x-auto">
        <div class="border-b min-w-[800px]">
          <!-- Table Header -->
          <div class="flex items-center px-6 py-2">
            <div class="flex-1 grid grid-cols-9 gap-4">
              <!-- Header columns -->
              <div v-for="header in tableHeaders" 
                   :key="header.key"
                   class="flex items-center gap-2 text-sm font-medium text-gray-700"
                   :class="{ 'justify-end': header.align === 'right' }"
              >
                <FeatherIcon :name="header.icon" class="w-4 h-4" v-if="header.icon" />
                {{ header.label }}
              </div>
            </div>
          </div>
        </div>

        <!-- Table Body -->
        <div class="divide-y">
          <template v-if="lockedRows?.length">
            <!-- Item Rows -->
            <div v-for="row in lockedRows" 
                 :key="row.id"
                 class="hover:bg-gray-50 transition-colors min-w-[800px]"
            >
              <div class="flex items-center px-6 py-3">
                <div class="flex-1 grid grid-cols-9 gap-4">
                  <div v-for="header in tableHeaders" 
                       :key="header.key"
                       :class="[
                         'text-sm',
                         header.align === 'right' ? 'text-right' : '',
                         header.key === 'Item Name' ? 'text-gray-900' : 'text-gray-600',
                         header.emphasis ? 'font-medium' : ''
                       ]"
                  >
                    <Tooltip v-if="header.key === 'Item Name' && row.Description"
                            :text="row.Description"
                            placement="top"
                    >
                      <span>{{ row[header.key] }}</span>
                    </Tooltip>
                    <span v-else>{{ row[header.key] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Empty State -->
          <div v-else class="flex flex-col items-center justify-center py-12 min-w-[800px]">
            <FeatherIcon name="box" class="w-12 h-12 text-gray-400 mb-4" />
            <p class="text-base font-medium text-gray-900">No Items Found</p>
            <p class="text-sm text-gray-600">There are no locked items to display.</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Spreadsheet Container - Only initialize and show when not locked -->
    <template v-else>
      <div class="relative w-full h-full" style="height: calc(100vh - 12rem); margin: 0 !important">
        <div id="univer-container" class="absolute inset-0"></div>
      </div>
    </template>

    <!-- Dialogs -->
    <Dialog
      v-model="showLockDialog"
      :options="lockDialogOptions"
    />

    <Dialog
      v-model="showUnauthorizedDialog"
      :options="unauthorizedDialogOptions"
    />

    <Dialog
      v-model="showActiveUsersDialog"
      :options="activeUsersDialogOptions"
    />

    <!-- Save Status Indicator -->
    <div
      v-if="(!isLocked && saveStatus) || (!isLocked && unsavedChanges > 0)"
      class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg"
      :class="saveStatusClasses"
    >
      <span class="text-white text-sm">{{ saveStatusMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { session } from '../data/session'
import { Avatar, Tooltip, Button, Dialog, debounce, FeatherIcon } from 'frappe-ui'
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import UniverPresetSheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'
import { getServerDate } from '@/utils/format'

// Props
const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'doc' in value
    }
  }
})

// Constants
const USER_RING_COLORS = [
  'ring-blue-500', 'ring-green-500', 'ring-red-500', 'ring-yellow-500',
  'ring-purple-500', 'ring-pink-500', 'ring-indigo-500', 'ring-teal-500',
  'ring-orange-500', 'ring-cyan-500'
]
const SAVE_THRESHOLD = 10
const COMMAND_DEBOUNCE = 1000

// State
const isLoading = ref(true)
const loadingMessage = ref('Initializing spreadsheet...')
const loadingDetail = ref('Loading required resources')
const initializationError = ref(null)
const showLockDialog = ref(false)
const showUnauthorizedDialog = ref(false)
const showActiveUsersDialog = ref(false)
const isInitialized = ref(false)
const saveStatus = ref('')
const unsavedChanges = ref(0)
const lastSaveTime = ref(Date.now())
const lastChangeTime = ref(Date.now())
const activeUsers = ref([])
let univerAPI = null
let saveTimeout = null
let documentWatcher = null
const lockedData = ref(null)
const isLocked = computed(() => {
  const locked = props.projectResource.doc?.locked
  return locked && 
         typeof locked === 'string' && 
         locked.trim() !== '' && 
         locked !== '[]' && 
         locked !== '{}'
})


const lockedRows = computed(() => {
  if (!lockedData.value?.data?.rows) return []
  
  return lockedData.value.data.rows.map((row, index) => ({
    id: index + 1,
    ...row
  }))
})

const lockedHeaders = computed(() => {
  if (!lockedData.value?.data?.headers) return {}
  return lockedData.value.data.headers
})


const isHotMode = computed(() => activeUsers.value.length > 1)

const saveStatusClasses = computed(() => ({
  'bg-green-500': saveStatus.value === 'saved',
  'bg-yellow-500': saveStatus.value === 'saving',
  'bg-red-500': saveStatus.value === 'error',
  'bg-blue-500': !saveStatus.value && unsavedChanges.value > 0
}))

const saveStatusMessage = computed(() => {
  if (saveStatus.value) {
    switch (saveStatus.value) {
      case 'saved': return 'Changes saved'
      case 'saving': return 'Saving...'
      case 'error': return 'Error saving'
    }
  }
  return `${unsavedChanges.value} unsaved ${unsavedChanges.value === 1 ? 'change' : 'changes'}`
})

// Dialog Options
const lockDialogOptions = computed(() => ({
  title: isLocked.value ? 'Unlock Items' : 'Lock Items',
  size: 'sm',
  message: isLocked.value 
    ? 'Are you sure you want to unlock these items? This will allow users to modify the data.'
    : 'Are you sure you want to lock the current state of items? This will prevent any further modifications until unlocked.',
  actions: [
    {
      label: 'Cancel',
      variant: 'subtle',
      onClick: () => showLockDialog.value = false
    },
    {
      label: isLocked.value ? 'Unlock' : 'Lock',
      variant: 'solid',
      loading: props.projectResource.setValue.loading,
      onClick: handleLockConfirm
    }
  ]
}))

const unauthorizedDialogOptions = computed(() => ({
  title: 'Unauthorized Action',
  message: `Only ${lockedData.value?.user} can unlock these items.`,
  size: 'sm',
  icon: {
    name: 'alert-triangle',
    appearance: 'danger'
  },
  actions: [
    {
      label: 'Close',
      variant: 'subtle',
      onClick: () => showUnauthorizedDialog.value = false
    }
  ]
}))

const activeUsersDialogOptions = computed(() => ({
  title: 'Cannot Lock Items',
  message: 'Cannot lock items while other users are active. Please try again when you\'re the only active user.',
  size: 'sm',
  icon: {
    name: 'users',
    appearance: 'warning'
  },
  actions: [
    {
      label: 'Close',
      variant: 'subtle',
      onClick: () => showActiveUsersDialog.value = false
    }
  ]
}))

// Table Configuration
const tableHeaders = computed(() => [
  { key: 'Item Name', label: 'Item', icon: 'box', align: 'left' },
  { key: 'Qty', label: 'Qty', align: 'right' },
  { key: 'Width', label: 'Width', align: 'right' },
  { key: 'Height', label: 'Height', align: 'right' },
  { key: 'Area', label: 'Area', align: 'right' },
  { key: 'Amount', label: 'Amount', align: 'right', emphasis: true },
  { key: 'Total', label: 'Total', align: 'right', emphasis: true },
  { key: 'Vat Amount', label: 'VAT', align: 'right' },
  { key: 'Grand Total', label: 'Grand Total', align: 'right', emphasis: true }
])

// Methods
async function initUniver() {
  if (isLocked.value) return

  try {
    isLoading.value = true
    loadingMessage.value = 'Initializing spreadsheet...'
    loadingDetail.value = 'Preparing spreadsheet'

    const { univer, univerAPI: api } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge({}, UniverPresetSheetsCoreEnUS),
      },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({
          container: 'univer-container',
        }),
      ],
    })

    univerAPI = api
    setupCommandHandler()

    if (props.projectResource?.doc?.univer && !isInitialized.value) {
  loadingDetail.value = 'Loading spreadsheet data'
  initializeSheetData(props.projectResource.doc.univer)  // Add this line
  isInitialized.value = true
}
    isInitialized.value = true
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
  }
}

function initializeSheetData(univerData) {
  try {
    const parsedValue = univerData ? JSON.parse(univerData) : null
    const hasData = parsedValue && 
      (Array.isArray(parsedValue) ? parsedValue.length > 0 : Object.keys(parsedValue).length > 0)

    if (hasData) {
      univerAPI.createUniverSheet(parsedValue)
    } else {
      // Generate unique IDs for sheets
      const mainSheetId = 'sheet1_' + Math.random().toString(36).substr(2, 9)
      const printSheetId = 'sheet2_' + Math.random().toString(36).substr(2, 9)

      // Define the workbook structure
      const workbookData = createInitialWorkbook(mainSheetId, printSheetId)
      univerAPI.createUniverSheet(workbookData)
    }

    isInitialized.value = true
  } catch (error) {
    console.error('Failed to create sheet:', error)
  }
}

function createInitialWorkbook(mainSheetId, printSheetId) {
  return {
    id: 'workbook_' + Math.random().toString(36).substr(2, 9),
    appVersion: '0.5.0',
    locale: 'enUS',
    name: 'Project Workbook',
    sheetOrder: [mainSheetId, printSheetId],
    styles: {
      header_style: {
        bl: 1,
        bg: { rgb: '#f3f4f6' },
        ht: 2,
        vt: 2,
      },
    },
    sheets: {
      [mainSheetId]: createMainSheet(mainSheetId),
      [printSheetId]: createPrintSheet(printSheetId),
    },
  }
}

function createMainSheet(id) {
  return {
    id,
    name: 'Project Items',
    rowCount: 50,
    columnCount: 26,
    tabColor: '',
    hidden: 0,
    freezeOptions: {
      startRow: -1,
      startColumn: -1,
      ySplit: 0,
      xSplit: 0,
    },
    rowHeader: {
      width: 46,
      hidden: 0,
    },
    columnHeader: {
      height: 20,
      hidden: 0,
    },
    showGridlines: 1,
    defaultColumnWidth: 73,
    defaultRowHeight: 23,
    zoomRatio: 1,
    cellData: {},
    rowData: {},
    columnData: {},
  }
}

function createPrintSheet(id) {
  return {
    id,
    name: '_print',
    rowCount: 50,
    columnCount: 10,
    freeze: { xSplit: 1, ySplit: 1, startRow: 1, startColumn: 1 },
    tabColor: '#FBC418',
    hidden: 0,
    rowHeader: { width: 46, hidden: 0 },
    columnHeader: { height: 20, hidden: 0 },
    showGridlines: 1,
    defaultColumnWidth: 73,
    defaultRowHeight: 23,
    zoomRatio: 1,
    cellData: {
      0: {
        0: { v: 'Item Name', t: 1, s: 'header_style' },
        1: { v: 'Description', t: 1, s: 'header_style' },
        2: { v: 'Qty', t: 1, s: 'header_style' },
        3: { v: 'Width [m]', t: 1, s: 'header_style' },
        4: { v: 'Height [m]', t: 1, s: 'header_style' },
        5: { v: 'Area [SQM]', t: 1, s: 'header_style' },
        6: { v: 'Amount', t: 1, s: 'header_style' },
        7: { v: 'Total', t: 1, s: 'header_style' },
        8: { v: 'Vat Amount', t: 1, s: 'header_style' },
        9: { v: 'Grand Total', t: 1, s: 'header_style' },
      },
    },
    rowData: {},
    columnData: {
      0: { w: 150, hd: 0 },
      1: { w: 200, hd: 0 },
      2: { w: 80, hd: 0 },
      3: { w: 80, hd: 0 },
      4: { w: 80, hd: 0 },
      5: { w: 80, hd: 0 },
      6: { w: 100, hd: 0 },
      7: { w: 100, hd: 0 },
      8: { w: 100, hd: 0 },
      9: { w: 100, hd: 0 },
    },
  }
}

async function reinitializeWithData(data) {
  if (univerAPI) {
    univerAPI.dispose()
  }

  const { univer, univerAPI: api } = createUniver({
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: merge({}, UniverPresetSheetsCoreEnUS),
    },
    theme: defaultTheme,
    presets: [
      UniverSheetsCorePreset({
        container: 'univer-container',
      }),
    ],
  })

  univerAPI = api
  univerAPI.createUniverSheet(data)
  setupCommandHandler()
}

const debouncedHandleChange = debounce(() => {
  lastChangeTime.value = Date.now()
  unsavedChanges.value++

  if (isHotMode.value || unsavedChanges.value >= SAVE_THRESHOLD) {
    handleSave()
  }
}, COMMAND_DEBOUNCE)

function setupCommandHandler() {
  if (!univerAPI) return

  const relevantCommands = new Set([
    'formula.mutation.set-formula-calculation-notification',
    'sheet.mutation.set-range-values',
    'sheet.mutation.set-range-styles',
  ])

  univerAPI.onCommandExecuted((command) => {
    if (relevantCommands.has(command.id)) {
      debouncedHandleChange()
    }
  })
}

async function handleSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  // Add a flag to prevent multiple simultaneous save attempts
  if (window.isSaving) return

  saveStatus.value = 'saving'
  window.isSaving = true

  saveTimeout = setTimeout(async () => {
    try {
      await forceSave()
    } catch (error) {
      console.error('Failed to save sheet data:', error)
      saveStatus.value = 'error'
    } finally {
      window.isSaving = false
    }
  }, 300)
}

async function forceSave() {
  try {
    const sheetData = univerAPI.getActiveWorkbook().save()
    await props.projectResource.setValue.submit({
      name: props.projectResource.name,
      univer: JSON.stringify(sheetData),
    })

    saveStatus.value = 'saved'
    unsavedChanges.value = 0
    lastSaveTime.value = Date.now()

    setTimeout(() => {
      saveStatus.value = ''
    }, 2000)
  } catch (error) {
    throw error
  }
}

async function handleModeTransition(newMode) {
  if (unsavedChanges.value > 0) {
    await forceSave()
  }

  if (newMode === 'hot') {
    setupHotMode()
  } else {
    setupRelaxedMode()
  }
}

function setupHotMode() {
  setupDocumentChangeWatcher()
}

function setupRelaxedMode() {
  clearDocumentChangeWatcher()
}

function setupDocumentChangeWatcher() {
  if (documentWatcher) return

  documentWatcher = watch(
    () => props.projectResource.doc?.univer,
    async (newValue, oldValue) => {
      // Additional checks to prevent unnecessary updates
      if (!isInitialized.value || 
          !newValue || 
          newValue === oldValue || 
          window.isReinitializingDocument) {
        return
      }

      try {
        window.isReinitializingDocument = true

        const parsedData = JSON.parse(newValue)
        const currentData = univerAPI.getActiveWorkbook().save()

        if (JSON.stringify(currentData) !== JSON.stringify(parsedData)) {
          await reinitializeWithData(parsedData)
        }
      } catch (error) {
        console.error('Failed to update from document change:', error)
      } finally {
        // Reset the flag after a delay
        setTimeout(() => {
          window.isReinitializingDocument = false
        }, 1000)
      }
    },
    { deep: true }
  )
}

function clearDocumentChangeWatcher() {
  if (documentWatcher) {
    documentWatcher()
    documentWatcher = null
  }
}

function getUserColor(index) {
  return USER_RING_COLORS[index % USER_RING_COLORS.length]
}

function parseActiveUsers(activeUsersStr) {
  if (!activeUsersStr) return []
  try {
    return typeof activeUsersStr === 'string' ? JSON.parse(activeUsersStr) : []
  } catch (error) {
    console.error('Failed to parse active users:', error)
    return []
  }
}

async function updateActiveUsers(users, operation = 'add') {
  if (!props.projectResource.doc) return

  // Add a flag to prevent rapid successive calls
  if (window.isUpdatingActiveUsers) return

  try {
    window.isUpdatingActiveUsers = true

    const currentUsers = parseActiveUsers(props.projectResource.doc.active_users)
    let updatedUsers

    if (operation === 'add') {
      updatedUsers = [...new Set([...currentUsers, ...users])]
    } else {
      updatedUsers = currentUsers.filter(user => !users.includes(user))
    }

    // Only update if there's an actual change
    if (JSON.stringify(currentUsers) !== JSON.stringify(updatedUsers)) {
      await props.projectResource.setValue.submit({
        name: props.projectResource.doc.name,
        active_users: JSON.stringify(updatedUsers)
      })
    }
  } catch (error) {
    console.error('Failed to update active users:', error)
  } finally {
    // Reset the flag after a short delay
    setTimeout(() => {
      window.isUpdatingActiveUsers = false
    }, 1000)
  }
}

async function handleUserArrival() {
  await updateActiveUsers([session.user], 'add')
}

async function handleUserDeparture() {
  if (unsavedChanges.value > 0) {
    await forceSave()
  }
  await updateActiveUsers([session.user], 'remove')
}

async function handleLockClick() {
  if (isLocked.value) {
    if (session.user === lockedData.value?.user) {
      showLockDialog.value = true
    } else {
      showUnauthorizedDialog.value = true
    }
    return
  }

  if (activeUsers.value.length > 1) {
    showActiveUsersDialog.value = true
    return
  }

  await forceSave()
  showLockDialog.value = true
}

async function handleLockConfirm() {
  if (isLocked.value) {
    await props.projectResource.setValue.submit({
      name: props.projectResource.doc.name,
      locked: '',
    })
    window.location.reload()
  } else {
    const printData = extractPrintSheetData(props.projectResource.doc.univer)
    const lockData = {
      user: session.user,
      timestamp: new Date().toISOString(),
      data: printData,
    }

    await props.projectResource.setValue.submit({
      name: props.projectResource.doc.name,
      locked: JSON.stringify(lockData),
    })
  }

  showLockDialog.value = false
}

function extractPrintSheetData(univerData) {
  try {
    const data = JSON.parse(univerData)
    const printSheet = Object.values(data.sheets).find(sheet => sheet.name === '_print')
    if (!printSheet) return null

    const headers = {}
    const headerUnits = {}
    const rows = []

    function extractUnit(headerText) {
      const match = headerText.match(/\[(.*?)\]/)
      return match ? match[1] : null
    }

    function formatNumber(value, decimals = 0) {
      if (typeof value !== 'number') return value

      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value)

      if (decimals > 0) {
        const parts = formatted.split('.')
        if (parts[1] && !parts[1].split('').some(digit => digit !== '0')) {
          return parts[0]
        }
      }

      return formatted
    }

    function formatValue(value, header, unit) {
      if (value === null || value === undefined) return ''

      switch (header) {
        case 'Qty':
          return formatNumber(value, 0)
        case 'Width':
        case 'Height':
        case 'Area':
          return unit ? `${formatNumber(value, 2)} ${unit}` : formatNumber(value, 2)
        case 'Amount':
        case 'Total':
        case 'Vat Amount':
        case 'Grand Total':
          return `${formatNumber(value, 2)} AED`
        default:
          return value
      }
    }

    // Extract headers and units
    if (printSheet.cellData['0']) {
      Object.entries(printSheet.cellData['0']).forEach(([col, cell]) => {
        let headerText = ''
        let headerUnit = null

        if (cell.v) {
          headerText = cell.v
        } else if (cell.p?.body?.dataStream) {
          headerText = cell.p.body.dataStream.trim()
        }

        if (headerText) {
          if (headerText.includes('[')) {
            const baseName = headerText.split('[')[0].trim()
            const unit = extractUnit(headerText)
            headers[col] = baseName
            headerUnits[baseName] = unit
          } else {
            headers[col] = headerText
          }
        }
      })
    }

    // Extract and format rows
    Object.entries(printSheet.cellData).forEach(([rowIndex, rowData]) => {
      if (rowIndex === '0') return

      const row = {}
      let hasValues = false

      Object.entries(rowData).forEach(([col, cell]) => {
        const header = headers[col]
        if (header) {
          const unit = headerUnits[header]
          const formattedValue = formatValue(cell.v, header, unit)
          row[header] = formattedValue
          if (formattedValue !== '') {
            hasValues = true
          }
        }
      })

      const hasRequiredFields = Boolean(row['Item Name'] || row['Description'])
      if (Object.keys(row).length > 0 && hasRequiredFields && hasValues) {
        rows.push(row)
      }
    })

    return { headers, rows }
  } catch (error) {
    console.error('Error extracting print sheet data:', error)
    return null
  }
}

// Cleanup function
async function cleanup() {
  if (documentWatcher) {
    documentWatcher()
    documentWatcher = null
  }

  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }

  if (univerAPI) {
    try {
      univerAPI.dispose()
      univerAPI = null
    } catch (error) {
      console.error('Error disposing Univer API:', error)
    }
  }
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
  const handleKeyPress = (event) => {
    // Ctrl/Cmd + S
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      if (unsavedChanges.value > 0) {
        handleSave()
      }
    }
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}

// Visibility Handling
const handleVisibilityChange = async () => {
  if (document.hidden) {
    await handleUserDeparture()
  } else {
    await handleUserArrival()
  }
}

// Watchers
watch(
  () => activeUsers.value.length,
  async (newCount, oldCount) => {
    if (newCount !== oldCount) {
      const newMode = newCount > 1 ? 'hot' : 'relaxed'
      await handleModeTransition(newMode)
    }
  }
)
watch(
  () => props.projectResource.doc,
  async (newDoc) => {
    // Only handle arrival if not hidden and user not already in active users
    if (newDoc && !document.hidden && newDoc.active_users && 
        !parseActiveUsers(newDoc.active_users).includes(session.user)) {
      await handleUserArrival()
    }
  }
)

watch(
  () => props.projectResource.doc?.active_users,
  (newValue) => {
    if (newValue !== undefined) {
      const parsedUsers = parseActiveUsers(newValue)
      
      // Only update if the parsed users are different from current active users
      if (JSON.stringify(parsedUsers) !== JSON.stringify(activeUsers.value)) {
        activeUsers.value = parsedUsers
      }
    }
  }
)

watch(
  () => props.projectResource.doc?.locked,
  (newValue) => {
    if (newValue) {
      try {
        lockedData.value = JSON.parse(newValue)
      } catch (error) {
        lockedData.value = null
      }
    } else {
      lockedData.value = null
    }
  },
  { immediate: true }
)

function setupBeforeUnloadHandler() {
  const handleBeforeUnload = async (event) => {
    if (unsavedChanges.value > 0) {
      event.preventDefault()
      event.returnValue = ''
      
      try {
        // Attempt to save changes
        await forceSave()
      } catch (error) {
        console.error('Failed to save changes before unload:', error)
      }
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}

// Component Lifecycle
onMounted(async () => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  const cleanupKeyboardShortcuts = setupKeyboardShortcuts()
  const cleanupBeforeUnload = setupBeforeUnloadHandler()

  // Small delay to ensure DOM is ready
  await new Promise(resolve => setTimeout(resolve, 100))

  await initUniver()
  await handleUserArrival()

  // Also add a visibility check in case the page was loaded in a background tab
  if (!document.hidden) {
    await handleUserArrival()
  }

  return () => {
    cleanupKeyboardShortcuts()
    cleanupBeforeUnload()
  }
})


onBeforeUnmount(async () => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  try {
    await handleUserDeparture()
  } catch (error) {
    console.error('Error during user departure:', error)
  } finally {
    await cleanup()
  }
})

// Separate onUnmounted hook for navigation cleanup
onUnmounted(async () => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  try {
    await handleUserDeparture()
  } catch (error) {
    console.error('Error during user departure:', error)
  } finally {
    cleanup()
  }
})
</script>