<template>
	<div class="space-y-6">
		<!-- Search and Filters Section -->
		<div class="flex items-center gap-2 overflow-x-auto p-2">
			<!-- Search -->
			<FormControl
				type="search"
				size="sm"
				variant="subtle"
				placeholder="Search parties..."
				:modelValue="searchQuery"
				@update:modelValue="handleSearch"
				class="w-40 min-w-[8rem]"
			/>

			<!-- Sort Fields Dropdown -->
			<FormControl
				type="select"
				:options="sortFieldOptions"
				size="sm"
				variant="subtle"
				placeholder="Sort"
				:modelValue="sortField"
				@update:modelValue="handleSortFieldChange"
				class="w-32 min-w-[6rem] flex-shrink-0"
			/>

			<!-- Sort Direction Button -->
			<Button variant="subtle" size="sm" @click="toggleSortDirection" class="flex-shrink-0">
				<FeatherIcon
					:name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
					class="w-4 h-4"
				/>
			</Button>

			<!-- Add Filter Button -->
			<Button
				variant="subtle"
				size="sm"
				@click="showFilterDialog = true"
				class="flex-shrink-0"
			>
				<FeatherIcon name="filter" class="w-4 h-4" />
			</Button>

			<!-- Active Filters Display -->
			<div v-if="activeFilters.length" class="flex gap-1 overflow-x-auto flex-shrink-0">
				<div
					v-for="(filter, index) in activeFilters"
					:key="index"
					class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs whitespace-nowrap"
				>
					<span>{{ getFieldLabel(filter.field) }}: {{ filter.value }}</span>
					<button class="text-gray-500 hover:text-gray-700" @click="removeFilter(index)">
						<FeatherIcon name="x" class="w-3 h-3" />
					</button>
				</div>
			</div>
		</div>

		<!-- Parties Grid -->
		<div v-if="list.list.loading" class="flex justify-center">
			<LoadingIndicator />
		</div>

		<div v-else-if="!list.data?.length" class="text-center py-8">
			<div class="text-gray-600">No parties found</div>
		</div>

		<div v-else class="grid gap-6 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
			<div
				v-for="party in list.data"
				:key="party.name"
				class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
				@click="showPartyDetails(party)"
			>
            
				<!-- Party Card -->
				<div class="relative h-48">
					<img
						v-if="party.image"
						:src="party.image"
						:alt="party.party"
						class="h-full w-full object-contain rounded-t-lg"
						@error="$event.target.style.display = 'none'"
					/>
                    
					<div
						v-else
						class="h-full w-full flex items-center justify-center bg-gray-100 rounded-t-lg"
					>
						<FeatherIcon name="briefcase" class="w-12 h-12 text-gray-400" />
					</div>
				</div>

				<!-- Party Details -->
				<div class="p-4 space-y-3">
					<h3 class="font-semibold text-lg">{{ party.party }}</h3>
					<div class="space-y-2 text-sm text-gray-600">
						<div class="flex items-center gap-2">
							<FeatherIcon name="tag" class="w-4 h-4" />
							<span>{{ party.type }}</span>
						</div>
						<div class="flex items-center gap-2">
							<FeatherIcon name="map-pin" class="w-4 h-4" />
							<span>{{ party.emirate }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- New Party Dialog -->
		<Dialog
			v-model="showNewPartyDialog"
			:options="{
				title: 'Add New Party',
				size: 'lg',
				actions: [
					{
						label: 'Create',
						variant: 'solid',
						loading: list.insert.loading,
						onClick: () => createParty(),
					},
				],
			}"
		>
			<template #body-content>
				<div class="space-y-4">
					<!-- Party Details Form -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="space-y-1">
							<FormControl
								type="text"
								label="Party Name"
								required
								v-model="newParty.party"
							/>
							<span
								v-if="!newParty.party && formSubmitted"
								class="text-sm text-red-500"
							>
								Party name is required
							</span>
						</div>

						<div class="space-y-1">
							<FormControl
								type="select"
								label="Type"
								required
								:options="typeOptions"
								v-model="newParty.type"
							/>
							<span
								v-if="!newParty.type && formSubmitted"
								class="text-sm text-red-500"
							>
								Type is required
							</span>
						</div>

						<div class="space-y-1">
							<FormControl type="tel" label="Phone" v-model="newParty.phone" />
						</div>

						<div class="space-y-1">
							<FormControl type="email" label="Email" v-model="newParty.email" />
						</div>

						<div class="space-y-1">
							<FormControl type="text" label="TRN" v-model="newParty.trn" />
						</div>

						<div class="space-y-1">
							<FormControl
								type="select"
								label="Emirate"
								required
								:options="emirateOptions"
								v-model="newParty.emirate"
							/>
							<span
								v-if="!newParty.emirate && formSubmitted"
								class="text-sm text-red-500"
							>
								Emirate is required
							</span>
						</div>
					</div>
				</div>
			</template>
		</Dialog>

		<!-- Party Details Dialog -->
		<Dialog
			v-model="showPartyDialog"
			:options="{
				title: selectedParty?.party,
				size: 'md',
			}"
		>
			<template #body-content>
				<div class="space-y-6">
					<!-- Party Image -->
					<div class="flex justify-center">
						<div class="relative group cursor-pointer" @click="openImageDialog">
							<div class="w-24 h-24 rounded-full overflow-hidden">
								<div v-if="selectedParty?.image">
									<img
										:src="selectedParty.image"
										:alt="selectedParty.party"
										class="w-full h-full object-cover"
										@error="$event.target.style.display = 'none'"
									/>
								</div>
								<div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
									<FeatherIcon name="briefcase" class="w-12 h-12 text-gray-400" />
								</div>
							</div>
							<!-- Hover overlay -->
							<div class="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								<div class="text-white flex items-center">
									<FeatherIcon name="camera" class="w-5 h-5" />
								</div>
							</div>
						</div>
					</div>

					<!-- Party Details -->
					<div class="grid grid-cols-1 gap-4">
						<div v-if="selectedParty?.phone" class="flex items-center space-x-2">
							<FeatherIcon name="phone" class="w-4 h-4 text-gray-400" />
							<a
								:href="'tel:' + selectedParty.phone"
								class="text-sm text-blue-600 hover:text-blue-800"
							>
								{{ selectedParty.phone }}
							</a>
						</div>

						<div v-if="selectedParty?.email" class="flex items-center space-x-2">
							<FeatherIcon name="mail" class="w-4 h-4 text-gray-400" />
							<a
								:href="'mailto:' + selectedParty.email"
								class="text-sm text-blue-600 hover:text-blue-800"
							>
								{{ selectedParty.email }}
							</a>
						</div>

						<div v-if="selectedParty?.trn" class="flex items-center space-x-2">
							<FeatherIcon name="hash" class="w-4 h-4 text-gray-400" />
							<span class="text-sm text-gray-600">TRN: {{ selectedParty.trn }}</span>
						</div>

						<div class="flex items-center space-x-2">
							<FeatherIcon name="tag" class="w-4 h-4 text-gray-400" />
							<span class="text-sm text-gray-600">{{ selectedParty?.type }}</span>
						</div>

						<div class="flex items-center space-x-2">
							<FeatherIcon name="map-pin" class="w-4 h-4 text-gray-400" />
							<span class="text-sm text-gray-600">{{ selectedParty?.emirate }}</span>
						</div>
					</div>
				</div>
			</template>
			<template #actions>
				<div class="flex justify-between w-full">
					<div class="space-x-2">
						<Button
							variant="outline"
							theme="red"
							:loading="removing"
							@click="openDeleteDialog"
						>
							Delete Party
						</Button>
					</div>
					<Button variant="solid" @click="openEditDialog"> Edit Party </Button>
				</div>
			</template>
		</Dialog>

		<!-- Party Image Dialog -->
		<Dialog
			v-model="showImageDialog"
			:options="{
				title: 'Update Party Image',
				size: 'sm',
			}"
		>
			<template #body-content>
				<div class="space-y-4">
					<FileUploader
						v-model="newImage"
						:accept="['image/*']"
						:max-size="5000000"
						:upload-args="{
							doctype: 'RUA Party',
							docname: selectedParty?.name,
							fieldname: 'image',
							private: false,
						}"
						@success="handleUploadSuccess"
						v-slot="{ openFileSelector, file, uploading, progress, error }"
					>
						<div
							class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
							@click="openFileSelector"
							@dragover.prevent="
								$event.currentTarget.classList.add('border-blue-500')
							"
							@dragleave.prevent="
								$event.currentTarget.classList.remove('border-blue-500')
							"
							@drop.prevent="handleDrop($event)"
						>
							<div class="flex flex-col items-center justify-center space-y-2">
								<div v-if="!file" class="text-center">
									<FeatherIcon
										name="upload-cloud"
										class="w-8 h-8 text-gray-400 mx-auto mb-2"
									/>
									<div class="text-sm font-medium text-gray-900">
										Click to upload an image
									</div>
									<div class="text-xs text-gray-500">or drag and drop</div>
								</div>
								<div v-else class="w-full">
									<div class="flex items-center justify-between mb-2">
										<div class="flex items-center space-x-2">
											<FeatherIcon
												name="file"
												class="w-4 h-4 text-gray-400"
											/>
											<span class="text-sm text-gray-900">{{
												file.name
											}}</span>
										</div>
										<button
											v-if="!uploading"
											class="text-sm text-red-500 hover:text-red-700"
											@click.stop="newImage = null"
										>
											Remove
										</button>
									</div>
									<div
										v-if="uploading"
										class="w-full bg-gray-200 rounded-full h-2"
									>
										<div
											class="bg-blue-500 h-2 rounded-full transition-all duration-300"
											:style="{ width: progress + '%' }"
										></div>
									</div>
								</div>
								<div v-if="error" class="text-sm text-red-500">{{ error }}</div>
							</div>
						</div>
					</FileUploader>
					<div class="text-sm text-gray-500">
						Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
					</div>
				</div>
			</template>
			<template #actions>
				<div class="flex justify-end gap-2">
					<Button variant="subtle" @click="showImageDialog = false"> Cancel </Button>
					<Button
						:loading="isUploading"
						:disabled="!uploadedResult?.file_url"
						@click="updateImage"
					>
						Update Picture
					</Button>
				</div>
			</template>
		</Dialog>

		<!-- Edit Party Dialog -->
		<Dialog
			v-model="showEditDialog"
			:options="{
				title: 'Edit Party',
				size: 'lg',
				actions: [
					{
						label: 'Save Changes',
						variant: 'solid',
						loading: list.setValue.loading,
						onClick: () => updateParty(),
					},
				],
			}"
		>
			<template #body-content>
				<div class="space-y-4">
					<!-- Party Edit Form -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="space-y-1">
							<FormControl
								type="text"
								label="Party Name"
								required
								v-model="editingParty.party"
							/>
							<span
								v-if="!editingParty.party && formSubmitted"
								class="text-sm text-red-500"
							>
								Party name is required
							</span>
						</div>

						<div class="space-y-1">
							<FormControl
								type="select"
								label="Type"
								required
								:options="typeOptions"
								v-model="editingParty.type"
							/>
							<span
								v-if="!editingParty.type && formSubmitted"
								class="text-sm text-red-500"
							>
								Type is required
							</span>
						</div>

						<div class="space-y-1">
							<FormControl type="tel" label="Phone" v-model="editingParty.phone" />
						</div>

						<div class="space-y-1">
							<FormControl type="email" label="Email" v-model="editingParty.email" />
						</div>

						<div class="space-y-1">
							<FormControl type="text" label="TRN" v-model="editingParty.trn" />
						</div>

						<div class="space-y-1">
							<FormControl
								type="select"
								label="Emirate"
								required
								:options="emirateOptions"
								v-model="editingParty.emirate"
							/>
							<span
								v-if="!editingParty.emirate && formSubmitted"
								class="text-sm text-red-500"
							>
								Emirate is required
							</span>
						</div>
					</div>
				</div>
			</template>
		</Dialog>

		<!-- Delete Confirmation Dialog -->
		<Dialog
			v-model="showDeleteConfirmDialog"
			:options="{
				title: 'Confirm Delete',
				size: 'sm',
				icon: {
					name: 'alert-triangle',
					appearance: 'danger',
				},
				actions: [
					{
						label: 'Delete',
						theme: 'red',
						variant: 'solid',
						loading: removing,
						disabled: !isDeleteConfirmed,
						onClick: () => confirmRemove(),
					},
				],
			}"
		>
			<template #body-content>
				<div class="space-y-4">
					<p class="text-gray-600">
						This action cannot be undone. Please type
						<strong>{{ selectedParty?.party }}</strong> to confirm deletion.
					</p>
					<FormControl
						type="text"
						placeholder="Enter party name"
						v-model="deleteConfirmation"
					/>
				</div>
			</template>
		</Dialog>

		<!-- Filter Dialog -->
		<Dialog
			v-model="showFilterDialog"
			:options="{
				title: 'Add Filter',
				icon: {
					name: 'filter',
					appearance: 'primary',
				},
				size: 'sm',
				actions: [
					{
						label: 'Apply',
						variant: 'solid',
						onClick: () => {
							addFilter()
							showFilterDialog = false
						},
					},
				],
			}"
		>
			<template #body-content>
				<div class="space-y-4">
					<FormControl
						type="select"
						:options="filterFieldOptions"
						label="Field"
						required
						v-model="newFilter.field"
					/>

					<FormControl
						type="select"
						:options="operatorOptions"
						label="Operator"
						required
						v-model="newFilter.operator"
					/>

					<FormControl
						v-if="newFilter.field === 'type'"
						type="select"
						:options="typeOptions"
						label="Value"
						required
						v-model="newFilter.value"
					/>
					<FormControl
						v-else-if="newFilter.field === 'emirate'"
						type="select"
						:options="emirateOptions"
						label="Value"
						required
						v-model="newFilter.value"
					/>
					<FormControl
						v-else
						type="text"
						label="Value"
						required
						v-model="newFilter.value"
					/>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, computed, inject, h } from 'vue'
import { Button, FormControl, Dialog, FeatherIcon, LoadingIndicator, debounce, FileUploader } from 'frappe-ui'
import { partyResource } from '../data/party'

const setHeaderAction = inject('setHeaderAction')
setHeaderAction(
	h(
		Button,
		{
			variant: 'solid',
			onClick: () => (showNewPartyDialog.value = true),
		},
		() => 'Add Party',
	),
)

const sortField = ref('creation')
const sortDirection = ref('desc')
const activeFilters = ref([])
const showFilterDialog = ref(false)
const showNewPartyDialog = ref(false)
const showPartyDialog = ref(false)
const formSubmitted = ref(false)
const searchQuery = ref('')
const selectedParty = ref(null)
const removing = ref(false)
const showEditDialog = ref(false)
const showDeleteConfirmDialog = ref(false)
const deleteConfirmation = ref('')
const showImageDialog = ref(false)
const newImage = ref(null)
const uploadedResult = ref(null)
const isUploading = ref(false)

const newParty = ref({
	party: '',
	type: '',
	phone: '',
	email: '',
	trn: '',
	emirate: '',
})

const newFilter = ref({
	field: '',
	operator: '=',
	value: '',
})

const typeOptions = [
	{ label: 'Supplier: Glass', value: 'Supplier: Glass' },
	{ label: 'Supplier: Aluminum', value: 'Supplier: Aluminum' },
	{ label: 'Supplier: Cladding', value: 'Supplier: Cladding' },
	{ label: 'Consultant', value: 'Consultant' },
	{ label: 'Client', value: 'Client' },
]

const emirateOptions = [
	{ label: 'Abu Dhabi', value: 'Abu Dhabi' },
	{ label: 'Dubai', value: 'Dubai' },
	{ label: 'Sharjah', value: 'Sharjah' },
	{ label: 'Ajman', value: 'Ajman' },
	{ label: 'Umm Al-Quwain', value: 'Umm Al-Quwain' },
	{ label: 'Ras Al-Khaimah', value: 'Ras Al-Khaimah' },
	{ label: 'Fujairah', value: 'Fujairah' },
]

const fieldOptions = [
	{ label: 'Creation Date', value: 'creation', sortOnly: true },
	{ label: 'Party Name', value: 'party' },
	{ label: 'Type', value: 'type' },
	{ label: 'Emirate', value: 'emirate' },
]

const filterFieldOptions = fieldOptions.filter((field) => !field.sortOnly)
const sortFieldOptions = fieldOptions

const operatorOptions = [
	{ label: 'Equals', value: '=' },
	{ label: 'Not Equals', value: '!=' },
	{ label: 'Like', value: 'like' },
]

const list = partyResource

const handleSearch = debounce((value) => {
	searchQuery.value = value
	if (value) {
		activeFilters.value = activeFilters.value.filter((f) => f.field !== 'party')
		activeFilters.value.push({
			field: 'party',
			operator: 'like',
			value: value,
		})
	} else {
		activeFilters.value = activeFilters.value.filter((f) => f.field !== 'party')
	}
	updateListFilters()
}, 300)

function handleSortFieldChange(value) {
	sortField.value = value
	list.orderBy = `${value} ${sortDirection.value}`
	list.reload()
}

function toggleSortDirection() {
	sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
	list.orderBy = `${sortField.value} ${sortDirection.value}`
	list.reload()
}

function addFilter() {
	activeFilters.value.push({
		field: newFilter.value.field,
		operator: newFilter.value.operator,
		value: newFilter.value.value,
	})
	updateListFilters()
	newFilter.value = { field: '', operator: '=', value: '' }
}

function removeFilter(index) {
	activeFilters.value.splice(index, 1)
	updateListFilters()
}

function updateListFilters() {
	list.filters = activeFilters.value.map((filter) => {
		let value = filter.value
		if (filter.operator === 'like') {
			value = `%${value}%`
		}
		return [filter.field, filter.operator, value]
	})
	list.reload()
}

function getFieldLabel(fieldValue) {
	return filterFieldOptions.find((option) => option.value === fieldValue)?.label || fieldValue
}

async function handleUploadSuccess(result) {
  uploadedResult.value = result
}

async function updateImage() {
  if (!uploadedResult.value?.file_url) return
  
  try {
    isUploading.value = true
    await list.setValue.submit({
      name: selectedParty.value.name,
      image: uploadedResult.value.file_url
    })
    await list.reload()
    showImageDialog.value = false
    newImage.value = null
  } catch (error) {
    console.error('Failed to update party image:', error)
  } finally {
    isUploading.value = false
  }
}

function handleDrop(event) {
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    event.currentTarget.classList.remove('border-blue-500')
    const input = document.querySelector('input[type="file"]')
    if (input) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }
}

function validateForm() {
	formSubmitted.value = true
	return newParty.value.party && newParty.value.type && newParty.value.emirate
}

async function createParty() {
	if (!validateForm()) return

	try {
		const partyData = {
			party: newParty.value.party,
			type: newParty.value.type,
			phone: newParty.value.phone,
			email: newParty.value.email,
			trn: newParty.value.trn,
			emirate: newParty.value.emirate,
		}

		await list.insert.submit(partyData)

		showNewPartyDialog.value = false
		newParty.value = {
			party: '',
			type: '',
			phone: '',
			email: '',
			trn: '',
			emirate: '',
		}
		formSubmitted.value = false

		await list.reload()
	} catch (error) {
		console.error('Error creating party:', error)
	}
}

function showPartyDetails(party) {
	selectedParty.value = party
	showPartyDialog.value = true
}

const editingParty = ref({
	party: '',
	type: '',
	phone: '',
	email: '',
	trn: '',
	emirate: '',
})

const isDeleteConfirmed = computed(() => {
	return deleteConfirmation.value === selectedParty.value?.party
})

function openEditDialog() {
	showPartyDialog.value = false
	editingParty.value = { ...selectedParty.value }
	showEditDialog.value = true
}

function openDeleteDialog() {
	showPartyDialog.value = false
	showDeleteConfirmDialog.value = true
}

function openImageDialog() {
	showPartyDialog.value = false
	showImageDialog.value = true
}

async function updateParty() {
	if (!validateEditForm()) return

	try {
		const partyData = {
			name: selectedParty.value.name,
			party: editingParty.value.party,
			type: editingParty.value.type,
			phone: editingParty.value.phone,
			email: editingParty.value.email,
			trn: editingParty.value.trn,
			emirate: editingParty.value.emirate,
		}

		await list.setValue.submit(partyData)
		showEditDialog.value = false
		showPartyDialog.value = false
		await list.reload()
	} catch (error) {
		console.error('Error updating party:', error)
	}
}

function validateEditForm() {
	formSubmitted.value = true
	return editingParty.value.party && editingParty.value.type && editingParty.value.emirate
}

async function confirmRemove() {
	try {
		removing.value = true
		await list.delete.submit(selectedParty.value.name)
		showDeleteConfirmDialog.value = false
		showPartyDialog.value = false
		deleteConfirmation.value = ''
	} catch (error) {
		console.error('Error removing party:', error)
	} finally {
		removing.value = false
	}
}
</script>
