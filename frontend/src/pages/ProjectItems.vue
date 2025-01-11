# Template section
<template>
  <div class="space-y-8" v-if="projectResource">
    <!-- Loading State -->
    <div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <div class="text-gray-700">
          <p class="font-medium">{{ loadingMessage }}</p>
          <p class="text-sm text-gray-500">{{ loadingDetail }}</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="initializationError" class="p-4 bg-red-100 text-red-700 rounded">
      Failed to initialize Univer: {{ initializationError.message }}
    </div>

    <!-- Header Section -->
    <div class="px-6 py-4 bg-white border-b flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <h1 class="text-xl font-semibold text-gray-900">Project Items</h1>
        <span v-if="isHotMode" class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Hot Mode
        </span>
        <span v-else class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          Relaxed Mode
        </span>
      </div>
      
      <!-- Active Users Display -->
      <div v-if="project" class="flex items-center space-x-2">
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

    <!-- Spreadsheet Container -->
    <div
      class="relative w-full h-full"
      style="height: calc(100vh - 12rem); margin: 0 !important"
    >
      <div ref="univerContainer" class="absolute inset-0"></div>
    </div>

    <!-- Save Status Indicator -->
    <div
      v-if="saveStatus || unsavedChanges > 0"
      class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg"
      :class="{
        'bg-green-500': saveStatus === 'saved',
        'bg-yellow-500': saveStatus === 'saving',
        'bg-red-500': saveStatus === 'error',
        'bg-blue-500': !saveStatus && unsavedChanges > 0
      }"
    >
      <span class="text-white text-sm">
        {{
          saveStatus
            ? (saveStatus === 'saved'
                ? 'Changes saved'
                : saveStatus === 'saving'
                  ? 'Saving...'
                  : 'Error saving')
            : `${unsavedChanges} unsaved ${unsavedChanges === 1 ? 'change' : 'changes'}`
        }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { session } from '../data/session'
import { Avatar, Tooltip, debounce } from 'frappe-ui'

// Props
const props = defineProps({
  project: {
    type: Object,
    default: null,
  },
  projectResource: {
    type: Object,
    required: true,
  },
})

// Constants
const USER_RING_COLORS = [
  'ring-blue-500', 'ring-green-500', 'ring-red-500', 'ring-yellow-500',
  'ring-purple-500', 'ring-pink-500', 'ring-indigo-500', 'ring-teal-500',
  'ring-orange-500', 'ring-cyan-500',
]
const SAVE_THRESHOLD = 10
const SAVE_TIMEOUT = 3 * 60 * 1000 // 3 minutes
const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const COMMAND_DEBOUNCE = 1000 // 1 second

// State Management
const saveStatus = ref('')
const activeUsers = ref([])
const isInitialized = ref(false)
const univerContainer = ref(null)
const isResourcesLoaded = ref(false)
const initializationError = ref(null)
const isLoading = ref(true)
const loadingMessage = ref('Initializing spreadsheet...')
const loadingDetail = ref('Loading required resources')
const unsavedChanges = ref(0)
const lastSaveTime = ref(Date.now())
const lastChangeTime = ref(Date.now())

// Global References
let univerAPI = null
let saveTimeout = null
let heartbeatInterval = null
let documentWatcher = null

// Computed Properties
const isHotMode = computed(() => activeUsers.value.length > 1)

// Resource Management
async function loadResource(resource) {
  return new Promise((resolve, reject) => {
    const element = document.createElement(resource.type)

    element.onload = () => {
      if (resource.verify) {
        setTimeout(() => {
          try {
            if (resource.verify()) {
              resolve()
            } else {
              reject(new Error(`Verification failed for ${resource.src}`))
            }
          } catch (error) {
            reject(error)
          }
        }, 100)
      } else {
        resolve()
      }
    }
    element.onerror = () =>
      reject(new Error(`Failed to load ${resource.src || resource.href}`))

    if (resource.type === 'link') {
      element.rel = resource.rel
      element.href = resource.href
    } else {
      if (resource.defer) element.defer = true
      if (resource.async) element.async = true
      element.src = resource.src
    }

    document.head.appendChild(element)
  })
}

async function verifyGlobals() {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const maxAttempts = 20 // 2 seconds maximum wait

    const checkGlobals = () => {
      if (
        window.React &&
        window.ReactDOM &&
        window.rxjs &&
        window.UniverPresets &&
        window.UniverPresetSheetsCore
      ) {
        resolve()
      } else if (attempts >= maxAttempts) {
        reject(new Error('Timeout waiting for Univer libraries to load'))
      } else {
        attempts++
        setTimeout(checkGlobals, 100)
      }
    }

    checkGlobals()
  })
}

async function loadUniverResources() {
  console.log('🔄 Starting to load Univer resources...')
  
  const resources = [
    {
      type: 'script',
      src: 'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
      verify: () => window.React !== undefined,
    },
    {
      type: 'script',
      src: 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
      verify: () => window.ReactDOM !== undefined,
    },
    {
      type: 'script',
      src: 'https://unpkg.com/rxjs/dist/bundles/rxjs.umd.min.js',
      verify: () => window.rxjs !== undefined,
    },
    {
      type: 'script',
      src: 'https://unpkg.com/@univerjs/presets/lib/umd/index.js',
      verify: () => window.UniverPresets !== undefined,
    },
    {
      type: 'script',
      src: 'https://unpkg.com/@univerjs/preset-sheets-core/lib/umd/index.js',
      verify: () => window.UniverPresetSheetsCore !== undefined,
    },
    {
      type: 'script',
      src: 'https://unpkg.com/@univerjs/preset-sheets-core/lib/umd/locales/en-US.js',
    },
    {
      type: 'link',
      rel: 'stylesheet',
      href: 'https://unpkg.com/@univerjs/preset-sheets-core/lib/index.css',
    },
  ]

  for (const resource of resources) {
    loadingDetail.value = `Loading ${resource.type === 'link' ? 'styles' : 'script'}`
    await loadResource(resource)
    console.log(`✅ Loaded ${resource.src || resource.href}`)
  }

  loadingDetail.value = 'Verifying installation'
  await verifyGlobals()
}

// Univer Initialization
async function initUniver() {
  try {
    isLoading.value = true
    loadingMessage.value = 'Initializing spreadsheet...'

    if (!isResourcesLoaded.value) {
      await loadUniverResources()
      isResourcesLoaded.value = true
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    if (!window.UniverPresets || !window.UniverPresetSheetsCore) {
      throw new Error('Required Univer libraries not loaded')
    }

    console.log('🚀 Initializing Univer API...')
    loadingDetail.value = 'Preparing spreadsheet'

    const { createUniver, defaultTheme, LocaleType, merge } = window.UniverPresets
    const { UniverSheetsCorePreset } = window.UniverPresetSheetsCore

    const { univerAPI: api } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge({}, window.UniverPresetSheetsCoreEnUS),
      },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({
          container: univerContainer.value,
        }),
      ],
    })

    univerAPI = api
    setupCommandHandler()

    if (props.projectResource?.doc?.univer && !isInitialized.value) {
      loadingDetail.value = 'Loading spreadsheet data'
      initializeSheetData(props.projectResource.doc.univer)
    }

    isLoading.value = false
  } catch (error) {
    console.error('❌ Failed to initialize Univer:', error)
    initializationError.value = error
    isLoading.value = false
  }
}

// Sheet Data Management
function initializeSheetData(univerData) {
  try {
    const parsedValue = univerData ? JSON.parse(univerData) : null
    const hasData =
      parsedValue &&
      (Array.isArray(parsedValue)
        ? parsedValue.length > 0
        : Object.keys(parsedValue).length > 0)

    if (hasData) {
      console.log('📄 Found existing sheet data, initializing from saved data...')
      univerAPI.createUniverSheet(parsedValue)
    } else {
      console.log(
        '📝 No meaningful data found (empty or {},[]), creating new empty sheet...',
      )
      univerAPI.createUniverSheet({
        name: 'Project Items',
        rowCount: 50,
        columnCount: 26,
      })
    }

    isInitialized.value = true
    console.log('✨ Sheet initialization complete!')
  } catch (error) {
    console.error('❌ Failed to create sheet:', error)
  }
}

async function reinitializeWithData(data) {
  const { createUniver, defaultTheme, LocaleType, merge } = window.UniverPresets
  const { UniverSheetsCorePreset } = window.UniverPresetSheetsCore

  if (univerAPI) {
    univerAPI.dispose()
  }

  const { univerAPI: api } = createUniver({
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: merge({}, window.UniverPresetSheetsCoreEnUS),
    },
    theme: defaultTheme,
    presets: [
      UniverSheetsCorePreset({
        container: univerContainer.value,
      }),
    ],
  })

  univerAPI = api
  univerAPI.createUniverSheet(data)
  setupCommandHandler()
}

// Change Detection and Handling
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
    'sheet.mutation.set-range-styles'
  ])

  univerAPI.onCommandExecuted((command) => {
    if (relevantCommands.has(command.id)) {
      debouncedHandleChange()
    }
  })
}

// Save Management
async function handleSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  saveStatus.value = 'saving'

  saveTimeout = setTimeout(async () => {
    try {
      await forceSave()
    } catch (error) {
      console.error('Failed to save sheet data:', error)
      saveStatus.value = 'error'
    }
  }, 1000)
}

async function forceSave() {
  try {
    const sheetData = univerAPI.getActiveWorkbook().save()
    await props.projectResource.setValue.submit({
      name: props.project.name,
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

// Mode Management
async function handleModeTransition(newMode) {
  console.log(`🔄 Transitioning to ${newMode} mode`)
  
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
  console.log('🔥 Setting up hot mode')
  setupDocumentChangeWatcher()
}

function setupRelaxedMode() {
  console.log('😌 Setting up relaxed mode')
  clearDocumentChangeWatcher()
}

// Document Change Watching
function setupDocumentChangeWatcher() {
  if (documentWatcher) return
  
  documentWatcher = watch(
    () => props.projectResource.doc?.univer,
    async (newValue, oldValue) => {
      if (!isInitialized.value || !newValue || newValue === oldValue) return

      try {
        const parsedData = JSON.parse(newValue)
        const currentData = univerAPI.getActiveWorkbook().save()

        // Only update if the data is actually different
        if (JSON.stringify(currentData) !== JSON.stringify(parsedData)) {
          console.log('📥 External changes detected - updating sheet')
          await reinitializeWithData(parsedData)
        }
      } catch (error) {
        console.error('❌ Failed to update from document change:', error)
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

// User Management
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
  if (!props.project) return
  
  try {
    const currentUsers = parseActiveUsers(props.project.active_users)
    
    let updatedUsers
    if (operation === 'add') {
      updatedUsers = [...new Set([...currentUsers, ...users])]
    } else {
      updatedUsers = currentUsers.filter(user => !users.includes(user))
    }
    
    if (JSON.stringify(currentUsers) !== JSON.stringify(updatedUsers)) {
      await props.projectResource.setValue.submit({
        name: props.project.name,
        active_users: JSON.stringify(updatedUsers)
      })
    }
  } catch (error) {
    console.error('Failed to update active users:', error)
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

// Cleanup
function cleanup() {
  if (univerAPI) {
    univerAPI.dispose()
  }
  
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
  }
  
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  
  if (documentWatcher) {
    documentWatcher()
  }
  
  cleanupResources()
}

function cleanupResources() {
  if (!isResourcesLoaded.value) return

  const resources = document.querySelectorAll('script[src*="univerjs"], link[href*="univerjs"]')
  resources.forEach((resource) => resource.remove())
  isResourcesLoaded.value = false
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
  const handleKeyPress = (event) => {
    // Ctrl/Cmd + S
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      if (unsavedChanges.value > 0) {
        console.log('⌨️ Save shortcut detected - saving changes')
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
    console.log('📤 Page hidden - handling departure')
    await handleUserDeparture()
  } else {
    console.log('📥 Page visible - handling arrival')
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
  () => props.project?.active_users,
  (newValue) => {
    if (newValue !== undefined) {
      activeUsers.value = parseActiveUsers(newValue)
    }
  },
  { immediate: true }
)

// Component Lifecycle
onMounted(async () => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  const cleanupKeyboardShortcuts = setupKeyboardShortcuts()
  
  await initUniver()
  await handleUserArrival()
  
  // Setup heartbeat for presence
  heartbeatInterval = setInterval(async () => {
    if (!document.hidden) {
      await handleUserArrival()
    }
  }, HEARTBEAT_INTERVAL)
  
  // Cleanup on unmount
  onUnmounted(async () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    cleanupKeyboardShortcuts()
    await handleUserDeparture()
    cleanup()
  })
})
</script>