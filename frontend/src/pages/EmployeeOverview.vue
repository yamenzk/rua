// EmployeeOverview.vue
<template>
	<div class="space-y-8" v-if="employee">
		<!-- Hero Section -->
		<div class="h-64 md:h-96">
			<div class="w-full h-full">
				<div
					v-if="employee?.image"
					:style="{
						backgroundPosition: 'top center',
						backgroundSize: 'cover',
						width: '100%',
						height: '100%',
						overflow: 'hidden',
					}"
					class="w-full h-full bg-gray-300"
				>
					<img
						:src="employee.image"
						:alt="employee?.employee_name"
						class="w-full h-full object-contain"
						@error="$event.target.style.display = 'none'"
					/>
				</div>
				<div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
					<FeatherIcon name="user" class="w-12 h-12 text-gray-400" />
				</div>
	
			</div>
		</div>

		<!-- Employee Details -->
		<div class="px-6">
			<!-- Personal Information -->

			<div class="mb-8">
				<div class="flex items-center justify-between mb-4">
				<h3 class="text-sm font-medium text-gray-500 mb-4">Personal Information</h3>
				<div class="flex gap-2" v-if="isManager">
					<Button variant="solid" size="sm" @click="openEditDialog">
						<div class="flex items-center">
							<FeatherIcon name="edit" class="w-4 h-4 mr-2" />
							<span>Edit Employee</span>
						</div>
					</Button>
				</div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Basic Details -->
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-500"
								>Full Name</label
							>
							<div class="mt-1 text-lg text-gray-900">
								{{ employee?.employee_name }}
							</div>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-500">Gender</label>
							<div class="mt-1 text-lg text-gray-900">{{ employee?.gender }}</div>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-500"
								>Date of Birth</label
							>
							<div class="mt-1 text-lg text-gray-900">
								{{ formatDate(employee?.date_of_birth) }}
							</div>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-500"
								>Nationality</label
							>
							<div class="mt-1 text-lg text-gray-900">
								{{ employee?.nationality }}
							</div>
						</div>
					</div>

					<!-- Employment Details -->
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-500">Position</label>
							<div class="mt-1 text-lg text-gray-900">{{ employee?.position }}</div>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-500">Salary</label>
							<div class="mt-1 text-lg text-gray-900">
								{{ formatCurrency(employee?.salary) }}
							</div>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-500"
								>Employee ID</label
							>
							<div class="mt-1 text-lg text-gray-900">{{ employee?.name }}</div>
						</div>
						<div v-if="employee?.user">
							<label class="block text-sm font-medium text-gray-500"
								>Associated System User</label
							>
							<div class="mt-1 text-lg text-gray-900">{{ employee?.user }}</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Stats Overview -->
			<div class="mb-8">
				<h3 class="text-sm font-medium text-gray-500 mb-4">Overview</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<!-- Attendance Rate -->
					<div class="bg-white rounded-lg shadow p-6">
						<div class="flex items-center">
							<div class="p-3 rounded-full bg-green-100">
								<FeatherIcon name="check-circle" class="w-6 h-6 text-green-600" />
							</div>
							<div class="ml-4">
								<div class="text-sm font-medium text-gray-500">
									Attendance Rate
								</div>
								<div class="text-2xl font-bold text-gray-900">
									{{ attendanceRate }}%
								</div>
							</div>
						</div>
					</div>

					<!-- Current Month Overtime -->
					<div class="bg-white rounded-lg shadow p-6">
						<div class="flex items-center">
							<div class="p-3 rounded-full bg-blue-100">
								<FeatherIcon name="clock" class="w-6 h-6 text-blue-600" />
							</div>
							<div class="ml-4">
								<div class="text-sm font-medium text-gray-500">
									{{ currentMonth }} Overtime
								</div>
								<div class="text-2xl font-bold text-gray-900">
									{{ Number(currentMonthOvertime).toString() }}h
								</div>
							</div>
						</div>
					</div>

					<!-- Total Overtime Hours -->
					<div class="bg-white rounded-lg shadow p-6">
						<div class="flex items-center">
							<div class="p-3 rounded-full bg-purple-100">
								<FeatherIcon name="clock" class="w-6 h-6 text-purple-600" />
							</div>
							<div class="ml-4">
								<div class="text-sm font-medium text-gray-500">Total Overtime</div>
								<div class="text-2xl font-bold text-gray-900">
									{{ Number(totalOvertime).toString() }}h
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Monthly Attendance Records -->
			<div class="mb-8">
				<h3 class="text-sm font-medium text-gray-500 mb-4">
					{{ currentMonth }} Attendance Record
				</h3>
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th
									class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Date
								</th>
								<th
									class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Status
								</th>
								<th
									class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Overtime Hours
								</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							<tr v-for="record in monthlyAttendanceRecords" :key="record.date">
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{{ formatDate(record.date) }}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<span
											class="w-2.5 h-2.5 rounded-full mr-2"
											:class="{
												'bg-yellow-400': record.status === 'late',
												'bg-red-500': record.status === 'absent',
												'bg-green-500': record.status === 'present',
											}"
										></span>
										<span class="text-sm text-gray-900 capitalize">{{
											record.status
										}}</span>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{{ record.overtime > 0 ? `${record.overtime}h` : '-' }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<!-- Image Upload Dialog -->
	<Dialog
		v-model="showImageDialog"
		:options="{
			title: 'Update Profile Picture',
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
						doctype: 'RUA Employee',
						docname: employee?.name,
						fieldname: 'image',
						private: false,
					}"
					@success="handleUploadSuccess"
					v-slot="{ openFileSelector, file, uploading, progress, error }"
				>
					<div
						class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
						@click="openFileSelector"
						@dragover.prevent="$event.currentTarget.classList.add('border-blue-500')"
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
										<FeatherIcon name="file" class="w-4 h-4 text-gray-400" />
										<span class="text-sm text-gray-900">{{ file.name }}</span>
									</div>
									<button
										v-if="!uploading"
										class="text-sm text-red-500 hover:text-red-700"
										@click.stop="newImage = null"
									>
										Remove
									</button>
								</div>
								<div v-if="uploading" class="w-full bg-gray-200 rounded-full h-2">
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

	<!-- Edit Employee Dialog -->
	<Dialog
		v-model="showEditDialog"
		:options="{
			title: 'Edit Employee',
			size: 'lg',
			actions: [
				{
					label: 'Remove Employee',
					variant: 'outline',
					theme: 'red',
					loading: removing,
					onClick: () => openDeleteDialog(), // Changed this line
				},
				{
					label: 'Save Changes',
					variant: 'solid',
					loading: employeeResource.setValue.loading,
					onClick: () => updateEmployee(),
				},
			],
		}"
	>
		<template #body-content>
			<div class="space-y-4">
				<div class="flex justify-center">
					<div class="relative group cursor-pointer" @click="handleImageClick">
						<div class="w-24 h-24 rounded-full overflow-hidden">
							<img
								v-if="employee?.image"
								:src="employee.image"
								:alt="employee?.employee_name"
								class="w-full h-full object-cover"
								@error="$event.target.style.display = 'none'"
							/>
							<div
								v-else
								class="w-full h-full bg-gray-100 flex items-center justify-center"
							>
								<FeatherIcon name="user" class="w-12 h-12 text-gray-400" />
							</div>
						</div>
						<!-- Hover overlay -->
						<div
							class="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
						>
							<div class="text-white flex items-center">
								<FeatherIcon name="camera" class="w-5 h-5" />
							</div>
						</div>
					</div>
				</div>
				<!-- Employee Edit Form -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-1">
						<FormControl
							type="text"
							label="Employee Name"
							required
							v-model="editingEmployee.employee_name"
						/>
						<span
							v-if="!editingEmployee.employee_name && formSubmitted"
							class="text-sm text-red-500"
						>
							Employee name is required
						</span>
					</div>

					<div class="space-y-1">
						<FormControl
							type="date"
							label="Date of Birth"
							required
							variant="subtle"
							v-model="editingEmployee.date_of_birth"
						/>
						<span
							v-if="!editingEmployee.date_of_birth && formSubmitted"
							class="text-sm text-red-500"
						>
							Date of birth is required
						</span>
					</div>

					<div class="space-y-1">
						<FormControl
							type="select"
							label="Gender"
							required
							:options="genderOptions"
							v-model="editingEmployee.gender"
						/>
						<span
							v-if="!editingEmployee.gender && formSubmitted"
							class="text-sm text-red-500"
						>
							Gender is required
						</span>
					</div>

					<div class="space-y-1">
						<label class="block text-sm font-medium text-gray-700">Nationality</label>
						<Autocomplete
							:options="countryOptions"
							v-model="editingEmployee.nationality"
							placeholder="Select country"
							class="w-full"
						>
							<template #item-prefix="{ option }">
								<img :src="flags[option.value]" class="h-4 w-4 rounded-full" />
							</template>
						</Autocomplete>
						<span
							v-if="!editingEmployee.nationality && formSubmitted"
							class="text-sm text-red-500"
						>
							Nationality is required
						</span>
					</div>

					<div class="space-y-1">
						<FormControl
							type="select"
							label="Position"
							required
							:options="positionOptions"
							v-model="editingEmployee.position"
						/>
						<span
							v-if="!editingEmployee.position && formSubmitted"
							class="text-sm text-red-500"
						>
							Position is required
						</span>
					</div>

					<div class="space-y-1">
						<FormControl
							type="number"
							label="Salary"
							required
							v-model="editingEmployee.salary"
						/>
						<span
							v-if="!editingEmployee.salary && formSubmitted"
							class="text-sm text-red-500"
						>
							Salary is required
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
			actions: [
				{
					label: 'Delete',
					variant: 'solid',
					theme: 'red',
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
					<strong>{{ employee?.employee_name }}</strong> to confirm deletion.
				</p>
				<FormControl
					type="text"
					placeholder="Enter employee name"
					v-model="deleteConfirmation"
				/>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FeatherIcon, Dialog, Button, FileUploader, FormControl, Autocomplete } from 'frappe-ui'
import { session } from '@/data/session'
import { attendanceResource } from '@/data/attendance'
import { hasRole } from '@/data/roles'
import { useRouter } from 'vue-router'
const router = useRouter()
import { genderOptions, positionOptions } from '../data/employeeOptions'
import countries from '../data/countries.json'
import flags from '../data/flags.json'

const props = defineProps({
	employee: {
		type: Object,
		required: true,
	},
	employeeResource: {
		type: Object,
		required: true,
	},
})

// Role-based access control
const isManager = hasRole('RUA Manager')

// Image upload state
const showImageDialog = ref(false)
const newImage = ref(null)
const isUploading = ref(false)
const uploadedResult = ref(null)
const showEditDialog = ref(false)
const editingEmployee = ref({})
const removing = ref(false)
const showDeleteConfirmDialog = ref(false)
const deleteConfirmation = ref('')
const countryOptions = countries.map((country) => ({
	label: country.name,
	value: country.alpha2,
}))
const formSubmitted = ref(false)
const isDeleteConfirmed = computed(() => {
	return deleteConfirmation.value === props.employee?.employee_name
})

// Image handlers

async function updateEmployee() {
	if (!validateEditForm()) return

	try {
		const employeeData = {
			name: props.employee.name,
			employee_name: editingEmployee.value.employee_name,
			gender: editingEmployee.value.gender,
			date_of_birth: editingEmployee.value.date_of_birth,
			nationality: editingEmployee.value.nationality.label, // Use the label for nationality
			position: editingEmployee.value.position, // Position is already a string
			salary: Number(editingEmployee.value.salary),
		}

		await props.employeeResource.setValue.submit(employeeData)
		showEditDialog.value = false
		await props.employeeResource.reload()
	} catch (error) {
		console.error('Error updating employee:', error)
	}
}

// When opening the edit dialog, convert nationality to the correct format
function openEditDialog() {
	// Find the country option that matches the employee's nationality
	const nationalityOption = countryOptions.find(
		(option) => option.label === props.employee.nationality,
	)

	editingEmployee.value = {
		...props.employee,
		nationality: nationalityOption || null, // Set the full country object for the Autocomplete
		position: props.employee.position, // Keep position as string, not object
	}
	showEditDialog.value = true
}

function openDeleteDialog() {
	showDeleteConfirmDialog.value = true
	showEditDialog.value = false
}

function validateEditForm() {
	formSubmitted.value = true
	return (
		editingEmployee.value.employee_name &&
		editingEmployee.value.date_of_birth &&
		editingEmployee.value.gender &&
		editingEmployee.value.nationality?.label && // Check for nationality label
		editingEmployee.value.position && // Position is just a string
		editingEmployee.value.salary
	)
}

async function confirmRemove() {
	try {
		removing.value = true
		await props.employeeResource.delete.submit(props.employee.name)
		showDeleteConfirmDialog.value = false
		router.push('/employees')
	} catch (error) {
		console.error('Error removing employee:', error)
	} finally {
		removing.value = false
	}
}

function handleImageClick() {
	showEditDialog.value = false
	showImageDialog.value = true
}

async function handleUploadSuccess(result) {
	uploadedResult.value = result
}

async function updateImage() {
	if (!uploadedResult.value?.file_url) return

	try {
		isUploading.value = true
		await props.employeeResource.setValue.submit({
			name: props.employee.name,
			image: uploadedResult.value.file_url,
		})
		await props.employeeResource.reload()
		showImageDialog.value = false
		newImage.value = null
	} catch (error) {
		console.error('Failed to update profile picture:', error)
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

// Utility functions
function formatDate(date) {
	if (!date) return 'Not specified'
	return new Date(date).toLocaleDateString('en-AE', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

function formatCurrency(value) {
	if (!value) return 'AED 0'
	return `AED ${Math.floor(value).toLocaleString()}`
}

// Computed properties for date handling
const currentMonth = computed(() => {
	return new Date().toLocaleString('default', { month: 'long' })
})

const currentMonthStart = computed(() => {
	const date = new Date()
	return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
})

const currentMonthEnd = computed(() => {
	const date = new Date()
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
})

// Process attendance data
const processedAttendance = computed(() => {
	if (!attendanceResource.data || !props.employee?.name) return []

	return attendanceResource.data.map((record) => {
		const attendanceLog = JSON.parse(record.attendance_log || '{}')
		const employeeLog = attendanceLog[props.employee.name] || {}

		return {
			date: record.date,
			status: employeeLog.absent ? 'absent' : employeeLog.late ? 'late' : 'present',
			overtime: employeeLog.overtime || 0,
		}
	})
})

// Calculate statistics
const attendanceRate = computed(() => {
	if (!processedAttendance.value.length) return 0

	const presentDays = processedAttendance.value.filter(
		(record) => record.status === 'present',
	).length

	return Math.round((presentDays / processedAttendance.value.length) * 100)
})

const currentMonthOvertime = computed(() => {
	return processedAttendance.value
		.filter((record) => {
			return record.date >= currentMonthStart.value && record.date <= currentMonthEnd.value
		})
		.reduce((sum, record) => sum + (record.overtime || 0), 0)
})

const totalOvertime = computed(() => {
	return processedAttendance.value.reduce((sum, record) => sum + (record.overtime || 0), 0)
})

const monthlyAttendanceRecords = computed(() => {
	return processedAttendance.value
		.filter((record) => {
			return (
				record.date >= currentMonthStart.value &&
				record.date <= currentMonthEnd.value &&
				(record.status !== 'present' || record.overtime > 0)
			)
		})
		.sort((a, b) => new Date(b.date) - new Date(a.date))
})
</script>
