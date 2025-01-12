# Template section
<template>
	<div class="space-y-8" v-if="projectResource">
		<!-- Loading State - Only show when not locked -->
		<div
			v-if="isLoading && !isLocked"
			class="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center"
		>
			<div class="text-center space-y-4">
				<div
					class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"
				></div>
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
					v-if="isManager || isLocked"
					:variant="'outline'"
					theme="gray"
					size="sm"
					@click="handleLockClick"
				>
					<template #default>
						<div class="flex items-center gap-2">
							<FeatherIcon name="unlock" class="w-4 h-4" v-if="!isLocked" />
							<FeatherIcon name="lock" class="w-4 h-4" v-else />
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

		<!-- Locked State Message and ListView -->
		<template v-if="isLocked">
			<div class="p-4 bg-yellow-50" style="margin:0 !important">
				<p class="text-yellow-800">
					Items have been locked by {{ lockedData?.user == session.user ? 'you' : lockedData?.user || 'an unknown user' }}.
					{{
						session.user === lockedData?.user
							? 'Click the unlock button to modify the data.'
							: 'Please ask the user to unlock it if you need to make changes.'
					}}
				</p>
			</div>

			<!-- Locked Data ListView -->
			<ListView
				class="mt-4 border border-gray-300 rounded-md"
				:columns="lockedColumns"
				:rows="lockedRows"
				:options="{
					showTooltip: false,
					resizeColumn: true,
					selectable: false,
				}"
				row-key="id"
			/>
		</template>

		<!-- Spreadsheet Container - Only initialize and show when not locked -->
		<template v-else>
			<div
				class="relative w-full h-full"
				style="height: calc(100vh - 12rem); margin: 0 !important"
			>
				<div ref="univerContainer" class="absolute inset-0"></div>
			</div>
		</template>

		<!-- Lock Confirmation Dialog -->
		<Dialog
			v-model="showLockDialog"
			:options="{
				title: isLocked ? 'Unlock Items' : 'Lock Items',
				size: 'sm',
			}"
			style="z-index: 999999 !important"
		>
			<template #body-content>
				<p v-if="!isLocked">
					Are you sure you want to lock the current state of items? This will prevent any
					further modifications until unlocked.
				</p>
				<p v-else>
					Are you sure you want to unlock these items? This will allow users to modify
					the data.
				</p>
			</template>
			<template #actions>
				<div class="flex justify-end gap-2">
					<Button variant="subtle" @click="showLockDialog = false"> Cancel </Button>
					<Button :loading="projectResource.setValue.loading" @click="handleLockConfirm">
						{{ isLocked ? 'Unlock' : 'Lock' }}
					</Button>
				</div>
			</template>
		</Dialog>

		<!-- Unauthorized User Dialog -->
		<Dialog
			v-model="showUnauthorizedDialog"
			style="z-index: 999999 !important"
			:options="{
				title: 'Unauthorized Action',
				message: `Only ${lockedData?.user} can unlock these items.`,
				size: 'sm',
				icon: {
					name: 'alert-triangle',
					appearance: 'danger',
				},
				actions: [
					{
						label: 'Close',
						variant: 'subtle',
						onClick: () => {
							showUnauthorizedDialog = false
						},
					},
				],
			}"
		/>

		<!-- Active Users Warning Dialog -->
		<Dialog
			v-model="showActiveUsersDialog"
			style="z-index: 999999 !important"
			:options="{
				title: 'Cannot Lock Items',
				message:
					'Cannot lock items while other users are active. Please try again when you\'re the only active user.',
				size: 'sm',
				icon: {
					name: 'users',
					appearance: 'warning',
				},
				actions: [
					{
						label: 'Close',
						variant: 'subtle',
						onClick: () => {
							showActiveUsersDialog = false
						},
					},
				],
			}"
		/>

		<!-- Save Status Indicator - Only show when not locked -->
		<div
			v-if="(!isLocked && saveStatus) || (!isLocked && unsavedChanges > 0)"
			class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg"
			:class="{
				'bg-green-500': saveStatus === 'saved',
				'bg-yellow-500': saveStatus === 'saving',
				'bg-red-500': saveStatus === 'error',
				'bg-blue-500': !saveStatus && unsavedChanges > 0,
			}"
		>
			<span class="text-white text-sm">
				{{
					saveStatus
						? saveStatus === 'saved'
							? 'Changes saved'
							: saveStatus === 'saving'
								? 'Saving...'
								: 'Error saving'
						: `${unsavedChanges} unsaved ${unsavedChanges === 1 ? 'change' : 'changes'}`
				}}
			</span>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { session } from '../data/session'
import { Avatar, Tooltip, Button, Dialog, debounce, FeatherIcon, ListView } from 'frappe-ui'

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
const SAVE_THRESHOLD = 10
const SAVE_TIMEOUT = 3 * 60 * 1000 // 3 minutes
const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const COMMAND_DEBOUNCE = 1000 // 1 second
const showLockDialog = ref(false)
const lockedData = ref(props.project?.locked ? JSON.parse(props.project.locked) : null)
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
const showUnauthorizedDialog = ref(false)
const showActiveUsersDialog = ref(false)

const isManager = computed(() => {
	return session.userRoles.some((role) => ['RUA Manager', 'RUA Project Manager'].includes(role))
})
const isLocked = computed(() => {
	return (
		props.project?.locked &&
		typeof props.project.locked === 'string' &&
		props.project.locked.trim() !== '' &&
		props.project.locked !== '[]' &&
		props.project.locked !== '{}'
	)
})

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
			// Check if any of our required globals already exist
			const existingGlobals = [
				'React',
				'ReactDOM',
				'rxjs',
				'UniverPresets',
				'UniverPresetSheetsCore',
			].filter((global) => window[global] !== undefined)

			if (existingGlobals.length > 0) {
				//console.warn('⚠️ Found existing globals:', existingGlobals)
				cleanupResources() // Force cleanup if we find existing globals
			}

			// Now check if all required globals are present
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
	//console.log('🔄 Starting to load Univer resources...')

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
		//console.log(`✅ Loaded ${resource.src || resource.href}`)
	}

	loadingDetail.value = 'Verifying installation'
	await verifyGlobals()
}

// Univer Initialization
async function initUniver() {
	//console.log(isLocked.value)
	if (isLocked.value) return
	try {
		isLoading.value = true
		loadingMessage.value = 'Initializing spreadsheet...'

		if (!isResourcesLoaded.value) {
			await loadUniverResources()
			isResourcesLoaded.value = true
			await new Promise((resolve) => setTimeout(resolve, 200))
		}

		if (!window.UniverPresets || !window.UniverPresetSheetsCore) {
			throw new Error('Required Univer libraries not loaded')
		}

		//console.log('🚀 Initializing Univer API...')
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
		//console.error('❌ Failed to initialize Univer:', error)
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
			//console.log('📄 Found existing sheet data, initializing from saved data...')
			univerAPI.createUniverSheet(parsedValue)
		} else {
			//console.log('📝 No meaningful data found, creating new sheets...')

			// Generate unique IDs for sheets
			const mainSheetId = 'sheet1_' + Math.random().toString(36).substr(2, 9)
			const printSheetId = 'sheet2_' + Math.random().toString(36).substr(2, 9)

			// Define the workbook structure
			const workbookData = {
				id: 'workbook_' + Math.random().toString(36).substr(2, 9),
				appVersion: '0.5.0',
				locale: 'enUS',
				name: 'Project Workbook',
				sheetOrder: [mainSheetId, printSheetId],
				styles: {
					header_style: {
						bl: 1, // Bold
						bg: {
							// Light gray background
							rgb: '#f3f4f6',
						},
						ht: 2, // Center align
						vt: 2, // Vertical center
					},
				},
				sheets: {
					[mainSheetId]: {
						id: mainSheetId,
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
					},
					[printSheetId]: {
						id: printSheetId,
						name: '_print',
						rowCount: 50,
						columnCount: 10,
						freeze: { xSplit: 1, ySplit: 1, startRow: 1, startColumn: 1 },
						tabColor: '#FBC418',
						hidden: 0,
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
						cellData: {
							0: {
								// Header row
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
							0: { w: 150, hd: 0 }, // Item Name
							1: { w: 200, hd: 0 }, // Description
							2: { w: 80, hd: 0 }, // Qty
							3: { w: 80, hd: 0 }, // Width
							4: { w: 80, hd: 0 }, // Height
							5: { w: 80, hd: 0 }, // Area
							6: { w: 100, hd: 0 }, // Amount
							7: { w: 100, hd: 0 }, // Total
							8: { w: 100, hd: 0 }, // Vat Amount
							9: { w: 100, hd: 0 }, // Grand Total
						},
					},
				},
			}

			// Create the workbook with both sheets
			univerAPI.createUniverSheet(workbookData)
		}

		isInitialized.value = true
		//console.log('✨ Sheet initialization complete!')
	} catch (error) {
		//console.error('❌ Failed to create sheet:', error)
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
		'sheet.mutation.set-range-styles',
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
			//console.error('Failed to save sheet data:', error)
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
	//console.log(`🔄 Transitioning to ${newMode} mode`)

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
	//console.log('🔥 Setting up hot mode')
	setupDocumentChangeWatcher()
}

function setupRelaxedMode() {
	//console.log('😌 Setting up relaxed mode')
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
					//console.log('📥 External changes detected - updating sheet')
					await reinitializeWithData(parsedData)
				}
			} catch (error) {
				//console.error('❌ Failed to update from document change:', error)
			}
		},
		{ deep: true },
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
		//console.error('Failed to parse active users:', error)
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
			updatedUsers = currentUsers.filter((user) => !users.includes(user))
		}

		if (JSON.stringify(currentUsers) !== JSON.stringify(updatedUsers)) {
			await props.projectResource.setValue.submit({
				name: props.project.name,
				active_users: JSON.stringify(updatedUsers),
			})
		}
	} catch (error) {
		//console.error('Failed to update active users:', error)
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

// Locking

// ListView columns configuration
// Column width configurations
const COLUMN_WIDTHS = {
	'Item Name': '150px',
	Description: '200px',
	Qty: '80px',
	Width: '100px',
	Height: '100px',
	Area: '120px',
	Amount: '130px',
	Total: '130px',
	'Vat Amount': '130px',
	'Grand Total': '130px',
}

// Helper function to determine if a column should be right-aligned
const isRightAligned = (header) => {
	return [
		'Qty',
		'Width',
		'Height',
		'Area',
		'Amount',
		'Total',
		'Vat Amount',
		'Grand Total',
	].includes(header)
}

// ListView columns configuration
const lockedColumns = computed(() => {
	if (!lockedData.value?.data?.headers) return []

	return Object.entries(lockedData.value.data.headers).map(([key, header]) => {
		// Get original header with unit if present
		const originalHeader = lockedData.value.data.headers[key]

		return {
			label: originalHeader, // Keep the original header with units
			key: header, // Use the clean header (without units) as the key
			width: COLUMN_WIDTHS[header] || '100px',
			align: isRightAligned(header) ? 'right' : 'left',
		}
	})
})

// ListView rows
const lockedRows = computed(() => {
	if (!lockedData.value?.data?.rows) return []

	return lockedData.value.data.rows.map((row, index) => {
		// Create a new object with id
		const formattedRow = {
			id: index + 1,
		}

		// Copy over all values, they should already be formatted from extractPrintSheetData
		Object.entries(row).forEach(([key, value]) => {
			formattedRow[key] = value
		})

		return formattedRow
	})
})

// Function to extract necessary data from the spreadsheet
function extractPrintSheetData(univerData) {
    try {
        const data = JSON.parse(univerData)
        const printSheet = Object.values(data.sheets).find((sheet) => sheet.name === '_print')
        if (!printSheet) return null

        const headers = {}
        const headerUnits = {}
        const rows = []

        // Helper function to extract unit from header
        function extractUnit(headerText) {
            const match = headerText.match(/\[(.*?)\]/)
            return match ? match[1] : null
        }

        // Helper function to format number with commas and handle decimal zeros
        function formatNumber(value, decimals = 0) {
            if (typeof value !== 'number') return value

            // First format with fixed decimals
            const formatted = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            }).format(value)

            // If decimals are all zeros, remove the decimal part
            if (decimals > 0) {
                const parts = formatted.split('.')
                if (parts[1] && !parts[1].split('').some((digit) => digit !== '0')) {
                    return parts[0]
                }
            }

            return formatted
        }

        // Helper function to format value based on column type
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

        // Extract headers and their units
        if (printSheet.cellData['0']) {
            Object.entries(printSheet.cellData['0']).forEach(([col, cell]) => {
                let headerText = ''
                let headerUnit = null

                // Handle regular header cells
                if (cell.v) {
                    headerText = cell.v
                }
                // Handle nested header cells (Width, Height, Area)
                else if (cell.p?.body?.dataStream) {
                    headerText = cell.p.body.dataStream.trim()
                }

                if (headerText) {
                    // Extract header name and unit for special columns
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
            if (rowIndex === '0') return // Skip header row

            const row = {}
            let hasValues = false

            Object.entries(rowData).forEach(([col, cell]) => {
                const header = headers[col]
                if (header) {
                    const unit = headerUnits[header]
                    const formattedValue = formatValue(cell.v, header, unit)
                    row[header] = formattedValue
                    
                    // Check if this cell has a non-empty value
                    if (formattedValue !== '') {
                        hasValues = true
                    }
                }
            })

            // Check required fields and ensure row has actual content
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
// Lock/Unlock handlers
async function handleLockClick() {
	if (isLocked.value) {
		if (session.user === lockedData.value?.user) {
			showLockDialog.value = true
		} else {
			showUnauthorizedDialog.value = true
		}
		return
	}

	// Check if there's only one active user
	if (activeUsers.value.length > 1) {
		showActiveUsersDialog.value = true
		return
	}

	// Save current state before locking
	await forceSave()
	showLockDialog.value = true
}

async function handleLockConfirm() {
	if (isLocked.value) {
		// Unlocking
		await props.projectResource.setValue.submit({
			name: props.project.name,
			locked: '',
		})
		// Reload page after unlocking
		window.location.reload()
	} else {
		// Locking
		const printData = extractPrintSheetData(props.project.univer)
		const lockData = {
			user: session.user,
			timestamp: new Date().toISOString(),
			data: printData,
		}

		await props.projectResource.setValue.submit({
			name: props.project.name,
			locked: JSON.stringify(lockData),
		})
	}

	showLockDialog.value = false
}

// Cleanup
async function cleanup() {
	//console.log('🧹 Starting cleanup process...')

	// Clear all intervals and timeouts first
	if (heartbeatInterval) {
		clearInterval(heartbeatInterval)
		heartbeatInterval = null
	}

	if (saveTimeout) {
		clearTimeout(saveTimeout)
		saveTimeout = null
	}

	// Clear the document watcher
	if (documentWatcher) {
		documentWatcher()
		documentWatcher = null
	}

	// Dispose of Univer API
	if (univerAPI) {
		try {
			univerAPI.dispose()
			univerAPI = null
		} catch (error) {
			//console.error('Error disposing Univer API:', error)
		}
	}

	// Wait a small moment to ensure dispose completes
	await new Promise((resolve) => setTimeout(resolve, 100))

	// Clean up resources last
	cleanupResources()

	//console.log('🏁 Cleanup complete')
}

function cleanupResources() {
	if (!isResourcesLoaded.value) return

	// Track elements to remove
	const elementsToRemove = []

	// Find all relevant scripts and styles
	const resourceUrls = ['univerjs', 'react@18.3.1', 'react-dom@18.3.1', 'rxjs', '@univerjs']

	// Find scripts and links that match our URLs
	resourceUrls.forEach((url) => {
		const scripts = document.querySelectorAll(`script[src*="${url}"]`)
		const links = document.querySelectorAll(`link[href*="${url}"]`)
		scripts.forEach((script) => elementsToRemove.push(script))
		links.forEach((link) => elementsToRemove.push(link))
	})

	// Remove all found elements
	elementsToRemove.forEach((element) => {
		element.remove()
		//console.log(`🧹 Cleaned up resource: ${element.src || element.href}`)
	})

	// Reset the global variables to ensure clean slate
	window.React = undefined
	window.ReactDOM = undefined
	window.rxjs = undefined
	window.UniverPresets = undefined
	window.UniverPresetSheetsCore = undefined
	window.UniverPresetSheetsCoreEnUS = undefined

	isResourcesLoaded.value = false
	//console.log('🔄 Resources cleanup complete')
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
	const handleKeyPress = (event) => {
		// Ctrl/Cmd + S
		if ((event.ctrlKey || event.metaKey) && event.key === 's') {
			event.preventDefault()
			if (unsavedChanges.value > 0) {
				//console.log('⌨️ Save shortcut detected - saving changes')
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
		//console.log('📤 Page hidden - handling departure')
		await handleUserDeparture()
	} else {
		//console.log('📥 Page visible - handling arrival')
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
	},
)

watch(
	() => props.project?.active_users,
	(newValue) => {
		if (newValue !== undefined) {
			activeUsers.value = parseActiveUsers(newValue)
		}
	},
	{ immediate: true },
)

// Component Lifecycle
onMounted(async () => {
	document.addEventListener('visibilitychange', handleVisibilityChange)
	const cleanupKeyboardShortcuts = setupKeyboardShortcuts()

	await initUniver()
	await handleUserArrival()

	heartbeatInterval = setInterval(async () => {
		if (!document.hidden) {
			await handleUserArrival()
		}
	}, HEARTBEAT_INTERVAL)
})

watch(
	() => props.project?.locked,
	(newValue) => {
		if (newValue) {
			try {
				lockedData.value = JSON.parse(newValue)
			} catch (error) {
				//console.error('Error parsing locked data:', error)
				lockedData.value = null
			}
		} else {
			lockedData.value = null
		}
	},
	{ immediate: true },
)

// Separate onUnmounted hook to ensure it runs properly during navigation
onUnmounted(async () => {
	//console.log('📤 Component unmounting - cleaning up user presence')
	document.removeEventListener('visibilitychange', handleVisibilityChange)

	if (heartbeatInterval) {
		clearInterval(heartbeatInterval)
	}

	try {
		// Make sure to handle user departure before other cleanup
		await handleUserDeparture()
	} catch (error) {
		//console.error('Error during user departure:', error)
	} finally {
		// Other cleanup tasks
		cleanup()
	}
})
</script>
