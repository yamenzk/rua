<!-- ProjectLayout.vue -->
<template>
	<div v-if="isLoading" class="flex min-h-screen items-center justify-center">
	  <div class="text-gray-600">Loading project...</div>
	</div>
  
	<div v-else class="min-h-screen bg-gray-50">
	  <!-- Collapsible Sidebar for Desktop -->
	  <aside 
		class="fixed inset-y-0 left-0 z-30 hidden flex-col transition-all duration-300 md:flex border-r border-gray-200"
		:class="[isCollapsed ? 'w-16' : 'w-64']"
	  >
		<!-- Header Section -->
		<div class="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
		  <div class="flex items-center gap-3" v-show="!isCollapsed">
			<button
			  @click="handleBackNavigation"
			  class="flex items-center gap-2 text-gray-500 hover:text-gray-900"
			>
			  <FeatherIcon name="arrow-left" class="h-5 w-5" />
			  <span class="text-sm font-medium">Back</span>
			</button>
		  </div>
		  <button 
			@click="isCollapsed = !isCollapsed"
			class="rounded-lg p-1.5 hover:bg-gray-100"
		  >
			<FeatherIcon
			  :name="isCollapsed ? 'chevron-right' : 'chevron-left'"
			  class="h-5 w-5 text-gray-500"
			/>
		  </button>
		</div>
  
		<!-- Project Info -->
		<div class="border-b border-gray-200 bg-white p-4" v-show="!isCollapsed">
		  <div class="flex items-center gap-3">
			<Avatar
			  :shape="'square'"
			  :ref_for="true"
			  :image="selectedProject?.image"
			  :label="selectedProject?.project_name?.substring(0, 2)"
			  size="lg"
			  class="flex-shrink-0"
			/>
			<div class="min-w-0 flex-1">
			  <div class="flex items-center gap-2">
				<h2 class="truncate text-base font-semibold text-gray-900">
				  {{ selectedProject?.project_name }}
				</h2>
				<Badge
				  v-if="selectedProject?.serial_number"
				  :variant="'solid'"
				  :ref_for="true"
				  theme="gray"
				  size="sm"
				>
				  #{{ selectedProject?.serial_number }}
				</Badge>
			  </div>
			  <div class="mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
				:class="{
				  'bg-purple-100 text-purple-800': selectedProject?.status === 'Tender',
				  'bg-blue-100 text-blue-800': selectedProject?.status === 'Job in Hand',
				  'bg-yellow-100 text-yellow-800': selectedProject?.status === 'In Progress',
				  'bg-green-100 text-green-800': selectedProject?.status === 'Completed',
				  'bg-red-100 text-red-800': selectedProject?.status === 'Cancelled',
				}"
			  >
				{{ selectedProject?.status }}
			  </div>
			</div>
		  </div>
		</div>
  
		<!-- Navigation -->
		<nav class="flex-1 space-y-1 bg-white px-3 py-4">
		  <router-link
			v-for="item in navigation"
			:key="item.name"
			:to="item.to"
			class="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
			:class="[
			  isRouteActive(item.to)
				? 'bg-gray-50 text-gray-900' 
				: 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
			]"
		  >
			<div class="relative flex items-center gap-3">
			  <FeatherIcon
				:name="item.icon"
				class="h-5 w-5 transition-all duration-200"
				:class="[
				  isRouteActive(item.to)
					? 'text-gray-900'
					: 'text-gray-400 group-hover:text-gray-900 hover:text-gray-900'
				]"
			  />
			  <span 
				:class="[isCollapsed ? 'opacity-0' : 'opacity-100']"
				class="whitespace-nowrap transition-opacity duration-200"
			  >
				{{ item.name }}
			  </span>
			</div>
  
			<!-- Active Indicator -->
			<div
			  v-if="route.path === item.to && shouldShowIndicator"
			  class="absolute inset-y-0 right-0 w-1 rounded-l-lg bg-gray-600"
			></div>
  
		  </router-link>
		</nav>
  
		<!-- Map Section -->
		<div class="border-t bg-white p-4">
  <ProjectMap
    v-if="!isCollapsed"
    :coords="selectedProject?.coords"
    :mini-map="true"
    @update:coords="updateProjectCoords"
    class="mb-4 transition-all duration-300"
  />
  <Button
    v-if="!isCollapsed"
    variant="subtle"
    theme="gray"
    size="lg"
    @click="showSettingsDialog = true"
    class="w-full"
  >
    <template #prefix>
      <FeatherIcon name="settings" class="h-4 w-4" />
    </template>
    Project Settings
  </Button>
  
  <!-- Collapsed state -->
  <div v-else class="flex justify-center">
    <button 
      @click="showSettingsDialog = true"
      class="rounded-lg p-2 hover:bg-gray-100"
      title="Project Settings"
    >
      <FeatherIcon name="settings" class="h-5 w-5 text-gray-500" />
    </button>
  </div>
</div>
	  </aside>
  
	  <!-- Mobile Header -->
	  <header class="fixed left-0 right-0 top-0 z-20 flex grow h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden">
		<div class="flex items-center gap-3 overflow-hidden grow">
		  <button
			@click="handleBackNavigation"
			class="flex-shrink-0 text-gray-500 hover:text-gray-700"
		  >
			<FeatherIcon name="arrow-left" class="h-5 w-5" />
		  </button>
		  <Avatar
			:shape="'square'"
			:ref_for="true"
			:image="selectedProject?.image"
			:label="selectedProject?.project_name?.substring(0, 2)"
			size="md"
			class="flex-shrink-0"
		  />
		  <div class="flex justify-between grow">
			<div class="flex items-center gap-2">
			  <h1 class="truncate text-base font-semibold text-gray-900">
				{{ selectedProject?.project_name }}
			  </h1>
			  <Badge
				v-if="selectedProject?.serial_number"
				:variant="'solid'"
				:ref_for="true"
				theme="gray"
				size="sm"
			  >
				#{{ selectedProject?.serial_number }}
			  </Badge>
			</div>
			<div class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
			  :class="{
				'bg-purple-100 text-purple-800': selectedProject?.status === 'Tender',
				'bg-blue-100 text-blue-800': selectedProject?.status === 'Job in Hand',
				'bg-yellow-100 text-yellow-800': selectedProject?.status === 'In Progress',
				'bg-green-100 text-green-800': selectedProject?.status === 'Completed',
				'bg-red-100 text-red-800': selectedProject?.status === 'Cancelled',
			  }"
			>
			  {{ selectedProject?.status }}
			</div>
		  </div>
		</div>
	  </header>
  
	  <!-- Main Content Area -->
	  <div 
  class="transition-all duration-300"
  :class="{
    'md:pl-64': !isCollapsed,
    'md:pl-16': isCollapsed
  }"
>
  <main 
    class="min-h-screen pb-16 pt-16 md:pb-0 md:pt-0"
    :class="{ 'chat-layout': isChatRoute }"
  >
    <router-view
      v-if="selectedProjectResource"
      :projectResource="selectedProjectResource"
      :isCollapsed="isCollapsed"
    ></router-view>
  </main>
</div>
  
	  <!-- Bottom navigation for mobile -->
	  <nav class="fixed bottom-0 left-0 right-0 z-20 border-t bg-white md:hidden">
		<div class="flex justify-around px-2 py-1">
		  <router-link
			v-for="item in navigation"
			:key="item.name"
			:to="item.to"
			class="flex flex-col items-center rounded-lg px-3 py-2 transition-all duration-200"
			:class="[
			  isRouteActive(item.to)
				? 'text-gray-900' 
				: 'text-gray-400 hover:text-gray-900'
			]"
		  >
			<FeatherIcon 
			  :name="item.icon" 
			  class="h-5 w-5 transition-all duration-200"
			  :class="[
				isRouteActive(item.to)
				  ? 'text-gray-900'
				  : 'text-gray-400'
			  ]"  
			/>
			<span class="mt-1 text-xs">{{ item.name }}</span>
		  </router-link>
		</div>
	  </nav>
	</div>

	<!-- Settings Dialog -->
	<Dialog
		v-model="showSettingsDialog"
		:options="{
			title: 'Project Settings',
			size: 'lg',
		}"
	>
		<template #body-content>
			<div class="space-y-6">
        <!-- Basic Information -->
<div class="space-y-4">
  <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
  
  <div class="grid gap-4">
    <!-- Project Name -->
	<FormControl
  type="text"
  label="Project Name"
  variant="outline"
  v-model="projectName"
  required
  :disabled="true"
  :placeholder="selectedProjectResource.value?.doc?.project_name"
/>
	<FormControl
  type="select"
  label="Project Status"
  variant="outline"
  v-model="projectStatus"
  :options="statusOptions"
  required
/>

<FormControl
    type="number"
    :ref_for="true"
    size="sm"
    variant="outline"
    :disabled="false"
    label="Contract Value"
    v-model="contractValue"
    :placeholder="selectedProjectResource.value?.doc?.contract_value?.toString() || 'Enter contract value'"
/>

    <!-- Location -->
    <FormControl
      type="text"
      label="Location"
	  variant="outline"
      v-model="projectLocation"
      :placeholder="selectedProjectResource.value?.doc?.location || 'Enter project location'"
    />

    <!-- Description -->
    <div>
      <FormControl
        type="textarea"
        label="Description"
		variant="outline"
        v-model="projectDescription"
        :placeholder="selectedProjectResource.value?.doc?.description || 'Enter project description'"
        :rows="4"
      />
    </div>
  </div>
</div>


				<!-- Danger Zone -->
				<div class="border-t pt-4">
					<h3 class="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
					<p class="text-sm text-gray-600 mb-4">
						Once you delete a project, there is no going back. Please be certain.
					</p>
					<Button
						variant="outline"
						theme="red"
						size="sm"
						@click="initiateProjectDeletion"
						class="w-full"
					>
						<template #prefix>
							<FeatherIcon name="trash-2" class="w-4 h-4" />
						</template>
						Delete Project
					</Button>
				</div>
			</div>
		</template>

		<template #actions>
			<div class="flex justify-end gap-2">
				<Button variant="subtle" @click="showSettingsDialog = false"> Cancel </Button>
				<Button
  variant="solid"
  :loading="savingSettings"
  @click="saveSettings"
  :disabled="!hasBasicFieldsChanged"
>
  Save Changes
</Button>
			</div>
		</template>
	</Dialog>

	<!-- Project Name Confirmation Dialog -->
	<Dialog
		v-model="showDeleteConfirmDialog"
		:options="{
			title: 'Confirm Project Deletion',
			size: 'md',
			icon: {
				name: 'alert-triangle',
				appearance: 'danger',
			},
		}"
	>
	<template #body-content>
    <div class="space-y-4">
        <p class="text-sm text-gray-600">
            Please type "{{ selectedProject?.project_name }}" to confirm.
        </p>
        <FormControl
            type="text"
			variant="outline"
            v-model="confirmProjectName"
            placeholder="Enter project name"
            :error="nameConfirmError"
        />
    </div>
</template>
		<template #actions>
			<div class="flex justify-end gap-2">
				<Button variant="subtle" @click="cancelDeletion"> Cancel </Button>
				<Button
  variant="solid"
  theme="red"
  :disabled="confirmProjectName !== selectedProject?.project_name"
  @click="proceedToPasskey"
>
  Continue
</Button>
			</div>
		</template>
	</Dialog>

	<!-- Passkey Dialog -->
	<Dialog
		v-model="showPasskeyDialog"
		:options="{
			title: 'Enter Passkey',
			size: 'md',
			icon: {
				name: 'key',
				appearance: 'danger',
			},
		}"
	>
		<template #body-content>
			<div class="space-y-4">
				<p class="text-sm text-gray-600">
					Please enter your passkey to proceed with deletion.
				</p>
				<div class="space-y-1">
					<FormControl
						type="password"
						v-model="passkeyInput"
						placeholder="Enter passkey"
						:error="passkeyError"
					/>
					<p v-if="passkeyError" class="text-sm text-red-600 m-2">
						{{ passkeyError }}
					</p>
				</div>
			</div>
		</template>
		<template #actions>
			<div class="flex justify-end gap-2">
				<Button variant="subtle" @click="cancelDeletion"> Cancel </Button>
				<Button
					variant="solid"
					theme="red"
					:loading="validateLoading"
					@click="validatePasskeyAndDelete"
				>
					Delete Project
				</Button>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Avatar, FeatherIcon, Button, Dialog, FormControl, Badge } from 'frappe-ui'
import { projectResource, createProjectResource } from '@/data/project'
import ProjectMap from '../components/project/ProjectMap.vue'
import { inject } from 'vue'
import { invoiceResource } from '@/data/invoice'
const showSettingsDialog = ref(false)
const showDeleteConfirmDialog = ref(false)
const showPasskeyDialog = ref(false)
const confirmProjectName = ref('')
const passkeyInput = ref('')
const nameConfirmError = ref('')
const passkeyError = ref('')
const validateLoading = ref(false)
const savingSettings = ref(false)
const settingsError = ref('')
const $socket = inject('$socket')
const router = useRouter()
const route = useRoute()
const projectName = ref('')
const projectLocation = ref('')
const contractValue = ref('')
const projectDescription = ref('')
const projectStatus = ref('')
const statusOptions = [
  { label: 'Tender', value: 'Tender' },
  { label: 'Job in Hand', value: 'Job in Hand' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' }
]

// State
const isLoading = ref(true)
const selectedProjectResource = ref(null)
const initializationTimeout = ref(null)
const isCollapsed = ref(false)
const shouldShowIndicator = ref(false)

const isRouteActive = (itemPath) => {
  // Extract the section from the path (e.g., 'overview', 'chat', etc.)
  const currentSection = route.path.split('/').pop()
  const itemSection = itemPath.split('/').pop()
  
  // Special case for invoicing section
  if (itemPath.includes('invoicing') && route.path.includes('invoicing')) {
    return true
  }
  
  // Check if the current route matches the navigation item's path
  return currentSection === itemSection
}

// Get selected project from the list resource
const selectedProject = computed(() => {
	return projectResource.data?.find((proj) => proj.name === route.params.id)
})

const hasBasicFieldsChanged = computed(() => {
  const projectDoc = selectedProjectResource.value?.doc
  return projectName.value !== projectDoc?.project_name ||
         projectLocation.value !== projectDoc?.location ||
         contractValue.value !== projectDoc?.contract_value ||
         projectDescription.value !== projectDoc?.description ||
         projectStatus.value !== projectDoc?.status
})


// Detect if current route is chat
const isChatRoute = computed(() => {
	return route.path.includes('/chat')
})

// Watch for changes in project ID and recreate document resource
watch(
	() => route.params.id,
	(newId) => {
		if (newId && $socket?.connected) {
			initializeProjectResource(newId)
		}
	},
)

watch(
  () => selectedProjectResource.value?.doc,
  (newDoc) => {
    if (newDoc) {
      projectName.value = newDoc.project_name || ''
      projectLocation.value = newDoc.location || ''
      contractValue.value = newDoc.contract_value || ''
      projectDescription.value = newDoc.description || ''
      projectStatus.value = newDoc.status || ''
    }
  }
)

async function handleBackNavigation() {
    if (selectedProject.value?.is_child && selectedProject.value?.parent1) {
        // If it's a branch, navigate to parent project
        router.push(`/project/${selectedProject.value.parent1}/branches`)
    } else {
        // Otherwise go to projects list
        router.push('/projects')
    }
}

// Initialize document resource for selected project
async function initializeProjectResource(projectId) {
	try {
		selectedProjectResource.value = await createProjectResource(projectId, $socket)
		isLoading.value = false
	} catch (error) {
		console.error('Error creating project resource:', error)
		router.push('/projects')
	}
}

async function saveSettings() {
  if (!selectedProjectResource.value) return


  settingsError.value = ''
  savingSettings.value = true

  try {
    await selectedProjectResource.value.setValue.submit({
      project_name: projectName.value,
      location: projectLocation.value,
      contract_value: contractValue.value,
      description: projectDescription.value,
      status: projectStatus.value,
    })

    showSettingsDialog.value = false
  } catch (error) {
    settingsError.value = error.message || 'Failed to save settings'
  } finally {
    savingSettings.value = false
  }
}

// Handle initialization with timeout
async function waitForInitialization() {
	const maxAttempts = 50 // 5 seconds with 100ms intervals
	let attempts = 0

	while (attempts < maxAttempts) {
		if ($socket?.connected && projectResource.data?.length > 0) {
			if (selectedProject.value) {
				await initializeProjectResource(route.params.id)
				return true
			} else {
				router.push('/projects')
				return false
			}
		}

		await new Promise((resolve) => setTimeout(resolve, 100))
		attempts++
	}

	return false
}

onMounted(() => {
  // Get the current project doc from the resource
  const projectDoc = selectedProjectResource.value?.doc
  projectName.value = projectDoc?.project_name || ''
  projectLocation.value = projectDoc?.location || ''
  contractValue.value = projectDoc?.contract_value || ''
  projectDescription.value = projectDoc?.description || ''
  projectStatus.value = projectDoc?.status || ''
})

onMounted(async () => {
	try {
		// Set a timeout for the entire initialization process
		const timeoutPromise = new Promise((_, reject) => {
			initializationTimeout.value = setTimeout(() => {
				reject(new Error('Initialization timeout'))
			}, 5000)
		})

		// Race between initialization and timeout
		await Promise.race([waitForInitialization(), timeoutPromise])
	} catch (error) {
		console.error('Failed to initialize project:', error)
		router.push('/projects')
	} finally {
		if (initializationTimeout.value) {
			clearTimeout(initializationTimeout.value)
		}
	}
})



// Handle map coordinate updates
async function updateProjectCoords(newCoords) {
	if (!selectedProjectResource.value) return
	try {
		await selectedProjectResource.value.setValue.submit({
			coords: JSON.stringify(newCoords),
		})
		await selectedProjectResource.value.reload()
	} catch (error) {
		console.error('Failed to update coordinates:', error)
	}
}

const navigation = computed(() => {
  // Base navigation items
  const baseNav = [
    { name: 'Overview', to: `/project/${route.params.id}/overview`, icon: 'home' },
    { name: 'Chat', to: `/project/${route.params.id}/chat`, icon: 'message-square' },
    { name: 'Items', to: `/project/${route.params.id}/items`, icon: 'package' },
    { name: 'Invoicing', to: `/project/${route.params.id}/invoicing`, icon: 'file-text' },
	{ name: 'Files', to: `/project/${route.params.id}/files`, icon: 'folder' }
  ]

  // Add Branches section only if this is NOT a child project
  if (!selectedProject.value?.is_child) {
    baseNav.splice(3, 0, {
      name: 'Branches',
      to: `/project/${route.params.id}/branches`,
      icon: 'git-branch'
    })
  }

  return baseNav
})

function initiateProjectDeletion() {
	showSettingsDialog.value = false
	showDeleteConfirmDialog.value = true
	confirmProjectName.value = ''
	passkeyInput.value = ''
	nameConfirmError.value = ''
	passkeyError.value = ''
}

function cancelDeletion() {
	showDeleteConfirmDialog.value = false
	showPasskeyDialog.value = false
	confirmProjectName.value = ''
	passkeyInput.value = ''
	nameConfirmError.value = ''
	passkeyError.value = ''
}

function proceedToPasskey() {
  if (confirmProjectName.value === selectedProjectResource.value?.doc?.project_name) {
    showDeleteConfirmDialog.value = false
    showPasskeyDialog.value = true
  }
}

async function validatePasskeyAndDelete() {
	if (!selectedProjectResource.value || !passkeyInput.value) return

	validateLoading.value = true
	passkeyError.value = ''

	try {
		const response = await fetch(
			`/api/method/rua.api.delete_rua_document?docname=${selectedProject.value.name}&passkey=${passkeyInput.value}`,
		)
		const result = await response.json()

		if (!response.ok) {
			// Parse the server messages from Frappe's response
			if (result._server_messages) {
				try {
					const serverMessages = JSON.parse(result._server_messages)
					const firstMessage = JSON.parse(serverMessages[0])
					throw new Error(firstMessage.message)
				} catch {
					// If parsing fails, try to get message from exception
					if (result.exception) {
						const exceptionMessage = result.exception.split(':').pop().trim()
						throw new Error(exceptionMessage)
					}
					throw new Error('Invalid passkey')
				}
			}
			throw new Error('Invalid passkey')
		}

		// If validation successful, proceed with deletion
		await selectedProjectResource.value.delete.submit()
		router.push('/projects')
	} catch (error) {
		// Set the error message to be displayed in the dialog
		passkeyError.value = error.message
		passkeyInput.value = '' // Clear the passkey input on error
	} finally {
		validateLoading.value = false
	}
}
</script>

<style>
/* Ensure header stays above Leaflet controls */
.leaflet-control {
	z-index: 1000;
}

/* Chat-specific layout styles */
.chat-layout {
	@apply relative overflow-hidden;
	height: calc(100vh - 4rem); /* 4rem = h-16 of header */
}

@media (min-width: 768px) {
	.chat-layout {
		height: calc(100vh - 4rem);
	}
}
</style>
