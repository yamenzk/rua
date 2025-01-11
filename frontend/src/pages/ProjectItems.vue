<template>
	<div class="space-y-8" v-if="projectResource">
		<!-- Title Section -->
		<div class="px-6 py-4 bg-white border-b flex justify-between items-center">
			<h1 class="text-xl font-semibold text-gray-900">Project Items</h1>
			<!-- Active Users Display -->
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
const isInitialized = ref(false)
const univerContainer = ref(null)
let saveTimeout = null
let univerAPI = null

// Load Univer resources
function loadUniverResources() {
	// return new Promise((resolve, reject) => {
	//   const resources = [
	//     {
	//       type: 'script',
	//       src: 'https://unpkg.com/react@18.3.1/umd/react.production.min.js'
	//     },
	//     {
	//       type: 'script',
	//       src: 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js'
	//     },
	//     {
	//       type: 'script',
	//       src: 'https://unpkg.com/rxjs/dist/bundles/rxjs.umd.min.js'
	//     },
	//     {
	//       type: 'script',
	//       src: 'https://unpkg.com/@univerjs/presets/lib/umd/index.js'
	//     },
	//     {
	//       type: 'script',
	//       src: 'https://unpkg.com/@univerjs/preset-sheets-core/lib/umd/index.js'
	//     },
	//     {
	//       type: 'script',
	//       src: 'https://unpkg.com/@univerjs/preset-sheets-core/lib/umd/locales/en-US.js'
	//     },
	//     {
	//       type: 'link',
	//       rel: 'stylesheet',
	//       href: 'https://unpkg.com/@univerjs/preset-sheets-core/lib/index.css'
	//     }
	//   ]
	//   let loaded = 0
	//   resources.forEach(resource => {
	//     const element = document.createElement(resource.type)
	//     if (resource.type === 'link') {
	//       element.rel = resource.rel
	//       element.href = resource.href
	//     } else {
	//       element.src = resource.src
	//     }
	//     element.onload = () => {
	//       loaded++
	//       if (loaded === resources.length) {
	//         resolve()
	//       }
	//     }
	//     element.onerror = reject
	//     document.head.appendChild(element)
	//   })
	// })
}



async function initUniver() {
  try {
    await loadUniverResources()

    if (!window.UniverPresets || !window.UniverPresetSheetsCore) {
      throw new Error('Required Univer libraries not loaded')
    }

    console.log('🚀 Initializing Univer API...')
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
    univerAPI.onCommandExecuted((command) => {
      if (command.id === 'formula.mutation.set-formula-calculation-notification') {
      console.log('📊 Change detected, queuing save...')
      handleSave()
    }
})

    // univerAPI.getSheetHooks().onBeforeCellEdit((params) => {
    //   handleSave()
    // })

  } catch (error) {
    console.error('❌ Failed to initialize Univer:', error)
  }
}

watch(
  () => props.projectResource.doc?.univer,
  (newValue) => {
    if (!isInitialized.value && univerAPI) {
      try {
        // Parse the JSON value if it exists
        const parsedValue = newValue ? JSON.parse(newValue) : null
        
        // Check if the parsed value has actual content
        const hasData = parsedValue && 
          (Array.isArray(parsedValue) ? parsedValue.length > 0 : Object.keys(parsedValue).length > 0)

        if (hasData) {
          console.log('📄 Found existing sheet data, initializing from saved data...')
          univerAPI.createUniverSheet(parsedValue)
        } else {
          console.log('📝 No meaningful data found (empty or {},[]), creating new empty sheet...')
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
  },
  { immediate: true }
)

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

onMounted(() => {
	initUniver()
})

onUnmounted(() => {
	if (univerAPI) {
		univerAPI.dispose()
	}
})
</script>
