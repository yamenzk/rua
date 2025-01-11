<template>
	
	<div class="space-y-8" v-if="projectResource">
		<div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
  <div class="text-center space-y-4">
    <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
    <div class="text-gray-700">
      <p class="font-medium">{{ loadingMessage }}</p>
      <p class="text-sm text-gray-500">{{ loadingDetail }}</p>
    </div>
  </div>
</div>
		<!-- Add error display -->
		<div v-if="initializationError" class="p-4 bg-red-100 text-red-700 rounded">
			Failed to initialize Univer: {{ initializationError.message }}
		</div>
		<!-- Title Section -->
		<div class="px-6 py-4 bg-white border-b flex justify-between items-center">
			<h1 class="text-xl font-semibold text-gray-900">Project Items</h1>
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

		<!-- Univer Container -->
		<div
			class="relative w-full h-full"
			style="height: calc(100vh - 12rem); margin: 0 !important"
		>
			<div ref="univerContainer" class="absolute inset-0"></div>
		</div>

		<!-- Save Status -->
		<div
			v-if="saveStatus"
			class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg"
			:class="{
				'bg-green-500': saveStatus === 'saved',
				'bg-yellow-500': saveStatus === 'saving',
				'bg-red-500': saveStatus === 'error',
			}"
		>
			<span class="text-white text-sm">
				{{
					saveStatus === 'saved'
						? 'Changes saved'
						: saveStatus === 'saving'
							? 'Saving...'
							: 'Error saving'
				}}
			</span>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { session } from '../data/session'
import { Avatar, Tooltip } from 'frappe-ui'

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

// Role-based access control
const isManager = computed(() => {
	return session.userRoles.some((role) => ['RUA Manager', 'RUA Project Manager'].includes(role))
})

const USER_RING_COLORS = [
	'ring-blue-500',
	'ring-green-500',
	'ring-red-500',
	'ring-yellow-500',
	'ring-purple-500',
	'ring-pink-500',
	'ring-indigo-500',
	'ring-teal-500',
	'ring-orange-500',
	'ring-cyan-500',
]

const saveStatus = ref('')
const activeUsers = ref([])
const userColorMap = ref(new Map())
const isInitialized = ref(false)
const univerContainer = ref(null)
const isResourcesLoaded = ref(false)
const initializationError = ref(null)
let saveTimeout = null
let univerAPI = null
const isLoading = ref(true)
const loadingMessage = ref('Initializing spreadsheet...')
const loadingDetail = ref('Loading required resources')

// Load Univer resources
function loadResource(resource) {
	return new Promise((resolve, reject) => {
		const element = document.createElement(resource.type)

		element.onload = () => {
			if (resource.verify) {
				// Add a small delay to ensure script execution
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
				}, 100) // Small delay to ensure script execution
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

// Wait for Univer libraries to load
function verifyGlobals() {
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

// Main resource loading function
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

	try {
		// Load React first
		loadingDetail.value = 'Loading React'
		await loadResource(resources[0])
		console.log('✅ React loaded')

		// Load ReactDOM
		loadingDetail.value = 'Loading ReactDOM'
		await loadResource(resources[1])
		console.log('✅ ReactDOM loaded')

		// Load RxJS
		loadingDetail.value = 'Loading RxJS'
		await loadResource(resources[2])
		console.log('✅ RxJS loaded')

		// Load Univer resources
		loadingDetail.value = 'Loading Univer Presets'
		await loadResource(resources[3])
		console.log('✅ Univer Presets loaded')

		loadingDetail.value = 'Loading Univer Sheets Core'
		await loadResource(resources[4])
		console.log('✅ Univer Sheets Core loaded')

		// Load remaining resources
		loadingDetail.value = 'Loading final components'
		await Promise.all([loadResource(resources[5]), loadResource(resources[6])])

		// Final verification of all required globals
		loadingDetail.value = 'Verifying installation'
		await verifyGlobals()

		console.log('✅ All Univer resources loaded and verified')
	} catch (error) {
		console.error('❌ Error loading Univer resources:', error)
		throw error
	}
}

async function initUniver() {
	try {
		isLoading.value = true
    	loadingMessage.value = 'Initializing spreadsheet...'
		if (!isResourcesLoaded.value) {
			console.log('🚀 Loading required resources...')
			await loadUniverResources()
			isResourcesLoaded.value = true

			// Add a small delay after resources are loaded
			loadingDetail.value = 'Finalizing setup'
			await new Promise((resolve) => setTimeout(resolve, 200))
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
		console.log('✅ Univer API initialized successfully')

		// Initialize sheet data immediately if available
		if (props.projectResource?.doc?.univer && !isInitialized.value) {
			loadingDetail.value = 'Loading spreadsheet data'
			initializeSheetData(props.projectResource.doc.univer)
		}

		univerAPI.onCommandExecuted((command) => {
			if (command.id === 'formula.mutation.set-formula-calculation-notification') {
				console.log('📊 Change detected, queuing save...')
				handleSave()
			}
		})
		isLoading.value = false
	} catch (error) {
		console.error('❌ Failed to initialize Univer:', error)
		isLoading.value = false
	}
}

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

// Handle saving changes
async function handleSave() {
	if (saveTimeout) {
		clearTimeout(saveTimeout)
	}

	saveStatus.value = 'saving'

	saveTimeout = setTimeout(async () => {
		try {
			const sheetData = univerAPI.getActiveWorkbook().save()
			await props.projectResource.setValue.submit({
				name: props.project.name,
				univer: JSON.stringify(sheetData),
			})
			saveStatus.value = 'saved'
			setTimeout(() => {
				saveStatus.value = ''
			}, 2000)
		} catch (error) {
			console.error('Failed to save sheet data:', error)
			saveStatus.value = 'error'
		}
	}, 1000)
}

// Get color for user
function getUserColor(index) {
  return USER_RING_COLORS[index % USER_RING_COLORS.length]
}

// Parse active users from string
function parseActiveUsers(activeUsersStr) {
  if (!activeUsersStr) return []
  try {
    return typeof activeUsersStr === 'string' ? JSON.parse(activeUsersStr) : []
  } catch (error) {
    console.error('Failed to parse active users:', error)
    return []
  }
}

// Update active users
async function updateActiveUsers(users, operation = 'add') {
  if (!props.project) return
  
  try {
    // Get current users from the project
    const currentUsers = parseActiveUsers(props.project.active_users)
    
    let updatedUsers
    if (operation === 'add') {
      // Add new users while removing duplicates
      updatedUsers = [...new Set([...currentUsers, ...users])]
    } else if (operation === 'remove') {
      // Remove specified users
      updatedUsers = currentUsers.filter(user => !users.includes(user))
    }

    console.log('Updating active users:', { current: currentUsers, updated: updatedUsers, operation })
    
    await props.projectResource.setValue.submit({
      name: props.project.name,
      active_users: JSON.stringify(updatedUsers)
    })
  } catch (error) {
    console.error('Failed to update active users:', error)
  }
}

// Watch for document changes
// watch(
// 	() => props.projectResource.doc?.univer,
// 	(newValue, oldValue) => {
// 		if (!isInitialized.value || !newValue || newValue === oldValue) return

// 		try {
// 			const parsedData = JSON.parse(newValue)
// 			const currentData = univerAPI.getActiveWorkbook().save()

// 			if (JSON.stringify(currentData) !== JSON.stringify(parsedData)) {
// 				univerAPI.dispose()
// 				// Reinitialize with the new data
// 				const { createUniver, defaultTheme, LocaleType, merge } = window.UniverPresets
// 				const { UniverSheetsCorePreset } = window.UniverPresetSheetsCore

// 				const { univerAPI: api } = createUniver({
// 					locale: LocaleType.EN_US,
// 					locales: {
// 						[LocaleType.EN_US]: merge({}, window.UniverPresetSheetsCoreEnUS),
// 					},
// 					theme: defaultTheme,
// 					presets: [
// 						UniverSheetsCorePreset({
// 							container: univerContainer.value,
// 						}),
// 					],
// 				})

// 				univerAPI = api
// 				univerAPI.createUniverSheet(parsedData)
// 			}
// 		} catch (error) {
// 			console.error('Failed to update from document change:', error)
// 		}
// 	},
// )

function cleanupResources() {
	if (!isResourcesLoaded.value) return

	const resources = document.querySelectorAll('script[src*="univerjs"], link[href*="univerjs"]')
	resources.forEach((resource) => resource.remove())
	isResourcesLoaded.value = false
}

// Modified watch handler
watch(
	() => props.projectResource.doc?.univer,
	(newValue) => {
		console.log('Debug: Watch triggered with value:', newValue)
		if (!isInitialized.value && univerAPI) {
			initializeSheetData(newValue)
		}
	},
	{ immediate: true },
)

// Add new watcher for projectResource itself
watch(
	() => props.projectResource,
	(newValue) => {
		console.log('Debug: projectResource changed:', !!newValue)
		if (newValue && univerAPI && !isInitialized.value) {
			initializeSheetData(newValue.doc?.univer)
		}
	},
	{ immediate: true },
)

// Watch for active users changes
watch(
  () => props.project?.active_users,
  (newValue) => {
    if (newValue !== undefined) {
      activeUsers.value = parseActiveUsers(newValue)
    }
  },
  { immediate: true }
)

onMounted(async () => {
  initUniver()
  
  // Wait for project to be available
  await nextTick()
  if (!props.project) return
  
  // Add current user to active users
  await updateActiveUsers([session.user], 'add')
  
  // Initialize activeUsers ref with current state
  activeUsers.value = parseActiveUsers(props.project.active_users)
})


onUnmounted(async () => {
  if (univerAPI) {
    univerAPI.dispose()
  }
  cleanupResources()
  
  // Remove current user from active users
  await updateActiveUsers([session.user], 'remove')
})
</script>