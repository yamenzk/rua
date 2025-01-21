<!-- ProjectLayout.vue -->
<template>
	<div v-if="isLoading" class="min-h-screen flex items-center justify-center">
		<div class="text-gray-600">Loading project...</div>
	</div>

	<div v-else class="min-h-screen flex flex-col">
		<!-- Header -->
		<header
			class="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b"
		>
			<div class="flex items-center gap-3 overflow-hidden">
				<button
    @click="handleBackNavigation"
    class="flex-shrink-0 text-gray-500 hover:text-gray-700"
>
    <FeatherIcon name="arrow-left" class="w-5 h-5" />
</button>
				<Avatar
					:shape="'square'"
					:ref_for="true"
					:image="selectedProject?.image"
					:label="selectedProject?.project_name?.substring(0, 2)"
					size="md"
					class="flex-shrink-0"
				/>	
				<div class="flex items-center gap-3 min-w-0">
					<h1 class="text-xl font-bold text-gray-900 truncate">
						{{ selectedProject?.project_name }}
						<Badge v-if="selectedProject?.serial_number"
  :variant="'solid'"
  :ref_for="true"
  theme="gray"
  size="sm"
  label="Badge"
>
  #{{ selectedProject?.serial_number }}
</Badge>
					</h1>
					<div
						class="flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium"
						:class="{
							'bg-purple-100 text-purple-800': selectedProject?.status === 'Tender',
							'bg-blue-100 text-blue-800': selectedProject?.status === 'Job in Hand',
							'bg-yellow-100 text-yellow-800':
								selectedProject?.status === 'In Progress',
							'bg-green-100 text-green-800': selectedProject?.status === 'Completed',
							'bg-red-100 text-red-800': selectedProject?.status === 'Cancelled',
						}"
					>
						{{ selectedProject?.status }}
					</div>
				</div>
			</div>
		</header>

		<div class="flex flex-1 pt-16 pb-16 md:pb-0">
			<!-- Sidebar for desktop -->
			<aside
				class="hidden md:block md:fixed md:w-64 bg-white border-r flex flex-col justify-between h-full pb-16"
			>
				<div class="flex flex-col h-full justify-between">
					<nav class="flex-1 px-4 py-4 space-y-1">
						<router-link
							v-for="item in navigation"
							:key="item.name"
							:to="item.to"
							class="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
							:class="{ 'bg-gray-100': route.path === item.to }"
						>
							<FeatherIcon :name="item.icon" class="h-5 w-5 mr-3 text-gray-500" />
							{{ item.name }}
						</router-link>
					</nav>

					<!-- Sidebar Map -->
					<div class="px-4 pb-4 mt-auto">
						<ProjectMap
							:coords="selectedProject?.coords"
							:is-manager="isManager"
							:mini-map="true"
							@update:coords="updateProjectCoords"
						/>
						<div v-if="isManager" class="mt-2">
							<Button
								variant="solid"
								theme="gray"
								size="lg"
								@click="showSettingsDialog = true"
								class="w-full"
							>
								<template #prefix>
									<FeatherIcon name="settings" class="w-4 h-4" />
								</template>
								Project Settings
							</Button>
						</div>
					</div>
				</div>
			</aside>

			<!-- Main content with chat layout support -->
			<main
				class="flex-1 overflow-y-auto bg-gray-50 md:ml-64"
				:class="{ 'chat-layout': isChatRoute }"
			>
				<router-view
					v-if="selectedProjectResource"
					:projectResource="selectedProjectResource"
				></router-view>
			</main>

			<!-- Bottom navigation for mobile -->
			<nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
				<div class="flex justify-around px-4 py-2">
					<router-link
						v-for="item in navigation"
						:key="item.name"
						:to="item.to"
						class="flex flex-col items-center px-2 py-1 min-w-[4rem]"
						:class="{
							'text-gray-900': route.path === item.to,
							'text-gray-500': route.path !== item.to,
						}"
					>
						<FeatherIcon :name="item.icon" class="h-6 w-6" />
						<span class="text-xs mt-1 whitespace-nowrap">{{ item.name }}</span>
					</router-link>
				</div>
			</nav>
		</div>
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
  v-model="projectName"
  required
  :disabled="true"
  :placeholder="selectedProjectResource.value?.doc?.project_name"
/>
	<FormControl
  type="select"
  label="Project Status"
  v-model="projectStatus"
  :options="statusOptions"
  required
/>

<FormControl
    type="number"
    :ref_for="true"
    size="sm"
    variant="subtle"
    :disabled="false"
    label="Contract Value"
    v-model="contractValue"
    :placeholder="selectedProjectResource.value?.doc?.contract_value?.toString() || 'Enter contract value'"
/>

    <!-- Location -->
    <FormControl
      type="text"
      label="Location"
      v-model="projectLocation"
      :placeholder="selectedProjectResource.value?.doc?.location || 'Enter project location'"
    />

    <!-- Description -->
    <div>
      <FormControl
        type="textarea"
        label="Description"
        v-model="projectDescription"
        :placeholder="selectedProjectResource.value?.doc?.description || 'Enter project description'"
        :rows="4"
      />
    </div>
  </div>
</div>

<!-- Separator -->
<div class="border-t"></div>
				<!-- Retention Settings -->
<div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Retention Settings</h3>

    <!-- Disabled State Warning -->
    <div
        v-if="!canEditRetention"
        class="bg-yellow-50 border border-yellow-200 rounded-md p-4"
    >
        <div class="flex items-center">
            <FeatherIcon name="alert-triangle" class="w-5 h-5 text-yellow-400" />
            <p class="ml-3 text-sm text-yellow-700">
                Retention settings cannot be modified as there are existing
                invoices for this project.
            </p>
        </div>
    </div>

    <div class="space-y-4" :class="{ 'opacity-50': !canEditRetention }">
        <!-- Retention Status Select -->
        <FormControl
            type="select"
            label="Retention Status"
            v-model="retentionStatus"
            :options="retentionStatusOptions"
            :disabled="!canEditRetention"
            required
        />

        <!-- Retention Percentage and Invoicing -->
        <div v-if="retentionStatus === 'Enabled'" class="space-y-4">
            <FormControl
                type="number"
                label="Retention Percentage"
                v-model="retentionPercentage"
                :disabled="!canEditRetention"
                min="0"
                max="100"
                step="0.01"
                placeholder="Enter percentage (e.g. 5)"
                required
            />
            <p class="text-sm text-gray-500">Enter a value between 0 and 100</p>
            
            <!-- Added Retention Invoicing Checkbox -->
            <FormControl
                type="checkbox"
                size="sm"
                variant="subtle"
                :disabled="!canEditRetention"
                label="Enable Retention Invoicing"
                v-model="retentionInvoicing"
            />
        </div>
    </div>

    <!-- Error Message -->
    <p v-if="settingsError" class="text-sm text-red-600">
        {{ settingsError }}
    </p>
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
  :disabled="!retentionStatus || (!hasBasicFieldsChanged && retentionStatus === selectedProject?.retention_status && retentionPercentage === selectedProject?.retention_percentage)"
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
import { hasRole } from '@/data/roles'
import ProjectMap from '../pages/ProjectMap.vue'
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
const retentionStatus = ref('')
const retentionPercentage = ref(0)
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
const retentionInvoicing = ref(false)
const statusOptions = [
  { label: 'Tender', value: 'Tender' },
  { label: 'Job in Hand', value: 'Job in Hand' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' }
]

const retentionStatusOptions = [
	{ label: 'Select status', value: '' },
	{ label: 'Enabled', value: 'Enabled' },
	{ label: 'Disabled', value: 'Disabled' },
]

// State
const isLoading = ref(true)
const selectedProjectResource = ref(null)
const initializationTimeout = ref(null)

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

const projectInvoices = computed(() => {
	return (
		invoiceResource.data?.filter(
			(invoice) => invoice.project === selectedProject.value?.name,
		) || []
	)
})

const canEditRetention = computed(() => {
  return projectInvoices.value.length === 0 && selectedProjectResource.value?.doc
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
      retentionStatus.value = newDoc.retention_status || ''
      retentionPercentage.value = newDoc.retention_percentage || 0
      retentionInvoicing.value = newDoc.retention_invoicing || false
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
        // If it's a subproject, navigate to parent project
        router.push(`/project/${selectedProject.value.parent1}/overview`)
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

  if (!retentionStatus.value) {
    settingsError.value = 'Please select a retention status'
    return
  }

  settingsError.value = ''
  savingSettings.value = true

  try {
    await selectedProjectResource.value.setValue.submit({
      project_name: projectName.value,
      location: projectLocation.value,
      contract_value: contractValue.value,
      description: projectDescription.value,
      status: projectStatus.value,
      retention_status: retentionStatus.value,
      retention_percentage: retentionStatus.value === 'Enabled' ? retentionPercentage.value : 0,
      retention_invoicing: retentionStatus.value === 'Enabled' ? retentionInvoicing.value : false  // Add this line
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

  retentionStatus.value = projectDoc?.retention_status || ''
  retentionPercentage.value = projectDoc?.retention_percentage || 0
  retentionInvoicing.value = projectDoc?.retention_invoicing || false
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

// Role-based access control
const isManager = hasRole('RUA Project Manager')

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
  ]

  // Add Sub Projects section only if this is NOT a child project
  if (!selectedProject.value?.is_child) {
    baseNav.splice(3, 0, {
      name: 'Sub Projects',
      to: `/project/${route.params.id}/sub-projects`,
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
