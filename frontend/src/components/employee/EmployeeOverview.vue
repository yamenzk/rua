<template>
	<div class="min-h-full bg-gray-50 pb-8" v-if="employee">
		<!-- Profile Header -->
		<div class="">
			<div v-if="currentLeave" class="border-b border-primary-100 bg-primary-50/50 backdrop-blur-sm">
				<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
					<div class="flex items-center gap-3 py-2">
						<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
							<FeatherIcon name="calendar" class="h-4 w-4 text-primary-600" />
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-sm text-primary-700">
								Currently on {{ currentLeave.leave_type }} Leave · Expected to return on {{ formatDate(currentLeave.return_date) }}
							</p>
						</div>
					</div>
				</div>
			</div>
			<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
				<div class="py-6">
					<div class="flex items-center gap-6">
						<!-- Avatar -->
						<div class="relative">
							<div class="h-24 w-24 overflow-hidden rounded-lg bg-gray-100 ring-4 ring-white">
								<img
									v-if="employee?.image"
									:src="employee.image"
									:alt="employee?.employee_name"
									class="h-full w-full object-cover"
									@error="$event.target.style.display = 'none'"
								/>
								<div v-else class="flex h-full items-center justify-center">
									<FeatherIcon name="user" class="h-12 w-12 text-gray-400" />
								</div>
							</div>
						</div>

						<!-- Employee Info -->
						<div class="flex min-w-0 flex-1 items-center justify-between">
							<div>
								<h1 class="truncate text-2xl font-bold text-gray-900">
									{{ employee?.employee_name }}
								</h1>
								<div class="mt-2 flex items-center gap-3">
									<span class="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-sm font-medium text-primary-700">
										{{ employee?.position }}
									</span>
									<span v-if="employee?.branch" class="inline-flex items-center text-sm text-gray-500">
										<FeatherIcon name="map-pin" class="mr-1.5 h-4 w-4" />
										{{ employee?.branch }}
									</span>
								</div>
							</div>
							<div class="flex gap-3">
								<Button variant="subtle" size="sm" @click="openSignatureDialog">
										<FeatherIcon name="pen-tool" class="h-4 w-4"/>
								</Button>
								<Button variant="solid" size="sm" @click="openEditDialog">
										<FeatherIcon name="edit" class="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="mx-auto max-w-5xl space-y-8 px-4">
			<!-- Employee Details Section -->
			<div class="bg-white p-6 rounded-lg">
				<div class="mb-6 flex items-center justify-between">
					<h2 class="text-lg font-medium text-gray-900">Personal Information</h2>
				</div>

				<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
					<!-- Basic Details -->
					<div class="space-y-6">
						<div>
							<h3 class="text-sm font-medium text-gray-500">Full Name</h3>
							<p class="mt-2 text-base text-gray-900">{{ employee?.employee_name }}</p>
						</div>
						<div>
							<h3 class="text-sm font-medium text-gray-500">Gender</h3>
							<p class="mt-2 text-base text-gray-900">{{ employee?.gender }}</p>
						</div>
						<div>
							<h3 class="text-sm font-medium text-gray-500">Date of Birth</h3>
							<p class="mt-2 text-base text-gray-900">{{ formatDate(employee?.date_of_birth) }}</p>
						</div>
						<div>
							<h3 class="text-sm font-medium text-gray-500">Nationality</h3>
							<p class="mt-2 text-base text-gray-900">{{ employee?.nationality }}</p>
						</div>
						<div v-if="employee?.phone">
							<h3 class="text-sm font-medium text-gray-500">Phone Number</h3>
							<p class="mt-2 text-base text-gray-900">{{ employee?.phone }}</p>
						</div>
					</div>

					<!-- Employment Details -->
					<div class="space-y-6">
						<div>
							<h3 class="text-sm font-medium text-gray-500">Position</h3>
							<p class="mt-2 text-base text-gray-900">{{ employee?.position }}</p>
						</div>
						<div>
							<h3 class="text-sm font-medium text-gray-500">Salary</h3>
							<p class="mt-2 text-base text-gray-900">{{ formatCurrency(employee?.salary) }}</p>
						</div>
						<div>
							<h3 class="text-sm font-medium text-gray-500">Employee ID</h3>
							<p class="mt-2 text-base text-gray-900">{{ employee?.name }}</p>
						</div>
						<div v-if="employee?.user">
							<h3 class="text-sm font-medium text-gray-500">Associated System User</h3>
							<p class="mt-2 text-base text-gray-900">{{ employee?.user }}</p>
						</div>
						<div v-if="employee?.email">
							<h3 class="text-sm font-medium text-gray-500">Email Address</h3>
							<p class="mt-2 text-base text-gray-900">{{ employee?.email }}</p>
						</div>
					</div>

					<!-- Additional Details -->
					<div class="space-y-6">
						<div v-if="employee?.branch">
							<h3 class="text-sm font-medium text-gray-500">Branch</h3>
							<p class="mt-2 text-base text-gray-900">{{ employee?.branch }}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Stats Overview -->
			<div class="bg-white rounded-lg">
				<div class="grid divide-y sm:divide-y-0 sm:divide-x sm:grid-cols-3 divide-gray-100">
					<!-- Attendance Rate -->
					<div class="p-6">
						<div class="flex flex-col">
							<div class="flex items-center gap-3 mb-1">
								<div class="rounded-full bg-green-50 p-1.5">
									<FeatherIcon name="check-circle" class="h-4 w-4 text-green-600" />
								</div>
								<p class="text-sm font-medium text-gray-500">Attendance Rate</p>
							</div>
							<div class="flex items-center gap-2">
								<p class="text-2xl font-semibold text-gray-900">{{ attendanceRate }}%</p>
								<div class="h-1.5 flex-1 rounded-full bg-gray-100 max-w-[100px]">
									<div 
										class="h-1.5 rounded-full bg-green-500"
										:style="{ width: `${attendanceRate}%` }"
									></div>
								</div>
							</div>
						</div>
					</div>

					<!-- Current Month Overtime -->
					<div class="p-6">
						<div class="flex flex-col">
							<div class="flex items-center gap-3 mb-1">
								<div class="rounded-full bg-primary-50 p-1.5">
									<FeatherIcon name="clock" class="h-4 w-4 text-primary-600" />
								</div>
								<p class="text-sm font-medium text-gray-500">{{ currentMonth }} Overtime</p>
							</div>
							<p class="text-2xl font-semibold text-gray-900">{{ totalOvertime }}h</p>
						</div>
					</div>

					<!-- Total Overtime -->
					<div class="p-6">
						<div class="flex flex-col">
							<div class="flex items-center gap-3 mb-1">
								<div class="rounded-full bg-purple-50 p-1.5">
									<FeatherIcon name="clock" class="h-4 w-4 text-purple-600" />
								</div>
								<p class="text-sm font-medium text-gray-500">Total Overtime</p>
							</div>
							<p class="text-2xl font-semibold text-gray-900">{{ totalOvertime }}h</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Leave Records -->
			<div class="rounded-lg bg-white p-6 shadow-sm">
				<h3 class="mb-6 text-lg font-medium text-gray-900">Leave Records</h3>
				<div v-if="leaveRecords.length === 0" class="text-sm text-gray-500">
					No leave records found
				</div>
				<div v-else class="space-y-4">
					<div
						v-for="leave in leaveRecords"
						:key="leave.name"
						class="flex items-center justify-between rounded-lg border p-4"
					>
						<div class="flex items-center gap-4">
							<div class="rounded-full bg-gray-100 p-2">
								<FeatherIcon name="calendar" class="h-5 w-5 text-gray-600" />
							</div>
							<div>
								<p class="font-medium text-gray-900">{{ leave.leave_type }}</p>
								<p class="mt-1 text-sm text-gray-500">
									{{ formatDate(leave.leave_date) }} - {{ formatDate(leave.return_date) }}
									({{ calculateLeaveDuration(leave.leave_date, leave.return_date) }})
								</p>
							</div>
						</div>
						<div class="flex items-center">
							<span
								class="mr-2 h-2.5 w-2.5 rounded-full"
								:class="{
									'bg-green-500': isLeaveCompleted(leave),
									'bg-blue-500': isLeaveOngoing(leave),
								}"
							></span>
							<span class="text-sm text-gray-900">
								{{ getLeaveStatus(leave) }}
							</span>
						</div>
					</div>
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
					onClick: initiateDelete,
				},
				{
					label: 'Save Changes',
					variant: 'solid',
					loading: employeeResource.setValue.loading,
					onClick: updateEmployee,
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
					</div>

					<div class="space-y-1">
						<FormControl
							type="date"
							label="Date of Birth"
							variant="subtle"
							v-model="editingEmployee.date_of_birth"
						/>
					</div>

					<div class="space-y-1">
						<FormControl
							type="select"
							label="Gender"
							:options="genderOptions"
							v-model="editingEmployee.gender"
						/>
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
					</div>

					<div class="space-y-1">
						<FormControl
							type="select"
							label="Position"
							:options="positionOptions"
							v-model="editingEmployee.position"
						/>
					</div>

					<div class="space-y-1">
						<FormControl
							type="number"
							label="Salary"
							v-model="editingEmployee.salary"
						/>
					</div>
					<div class="space-y-1">
						<FormControl type="text" label="Phone" v-model="editingEmployee.phone" />
					</div>
					<div class="space-y-1">
						<FormControl type="text" label="Email" v-model="editingEmployee.email" />
					</div>
					<div class="space-y-1">
						<FormControl
							type="select"
							label="Branch"
							:options="[
								{
									label: 'Main',
									value: 'Main',
								},
								{
									label: 'Branch',
									value: 'Branch',
								},
							]"
							v-model="editingEmployee.branch"
						/>
					</div>
				</div>
			</div>
		</template>
	</Dialog>

	<!-- Delete Confirmation Dialog -->
	<Dialog
		v-model="showDeleteDialog"
		:options="{
			title: 'Delete Employee',
			size: 'md',
			icon: {
				name: 'alert-triangle',
				appearance: 'danger',
			},
		}"
	>
		<template #body-content>
			<div class="space-y-6">
				<p class="text-sm text-gray-600">
					This action cannot be undone. Please complete both fields to confirm deletion.
				</p>

				<!-- Employee Name Confirmation -->
				<div class="space-y-2">
					<FormControl
						type="text"
						label="Confirm Employee Name"
						v-model="deleteForm.confirmName"
						:placeholder="'Type ' + employee?.employee_name"
					/>
					<p class="text-xs text-gray-500">
						Please type "{{ employee?.employee_name }}" to confirm
					</p>
				</div>

				<!-- Passkey Input -->
				<div class="space-y-2">
					<FormControl
						type="password"
						label="Enter Passkey"
						v-model="deleteForm.passkey"
						placeholder="Enter your passkey"
						:error="deleteError"
					/>
				</div>
			</div>
		</template>

		<template #actions>
			<div class="flex justify-end gap-2">
				<Button variant="subtle" @click="cancelDelete"> Cancel </Button>
				<Button
					variant="solid"
					theme="red"
					:loading="validateLoading"
					:disabled="
						deleteForm.confirmName !== employee?.employee_name || !deleteForm.passkey
					"
					@click="validateAndDelete"
				>
					Delete Employee
				</Button>
			</div>
		</template>
	</Dialog>
	<SignDocument
		v-if="showSignatureDialog"
		v-model="showSignatureDialog"
		:doctype="'RUA Employee'"
		:docname="employee.name"
		:is-employee="true"
		@signature-complete="handleSignatureComplete"
	/>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
	FeatherIcon,
	Dialog,
	Button,
	FileUploader,
	FormControl,
	Autocomplete,
	dayjs,
} from 'frappe-ui'
import { attendanceResource } from '@/data/attendance'
import { leaveResource } from '@/data/leave'
import { useRouter } from 'vue-router'
const router = useRouter()
import { genderOptions, positionOptions } from '@/data/employeeOptions'
import countries from '@/data/countries.json'
import flags from '@/data/flags.json'
import {
	getServerDate,
	isBeforeToday,
	isWithinRange,
	formatDateDuration,
	formatDate,
	formatCurrency,
} from '@/utils/format'
import SignDocument from '@/components/common/SignDocument.vue'

const props = defineProps({
	employee: {
		type: Object,
		required: true,
	},
	employeeResource: {
		type: Object,
		required: true,
	},
  isCollapsed: {
    type: Boolean,
    default: false
  }
	
})

// Role-based access control
const leaveRecords = computed(() => {
	if (!leaveResource.data || !props.employee?.name) return []

	return leaveResource.data
		.filter((leave) => leave.employee === props.employee.name)
		.sort((a, b) => dayjs(b.leave_date).diff(dayjs(a.leave_date)))
})

const currentLeave = computed(() => {
	return leaveRecords.value.find((leave) =>
		isWithinRange(getServerDate(), leave.leave_date, leave.return_date),
	)
})

function calculateLeaveDuration(leaveDate, returnDate) {
	return formatDateDuration(leaveDate, returnDate)
}

function isLeaveCompleted(leave) {
	return isBeforeToday(leave.return_date)
}

function isLeaveOngoing(leave) {
	return isWithinRange(getServerDate(), leave.leave_date, leave.return_date)
}

function getLeaveStatus(leave) {
	if (isLeaveOngoing(leave)) return 'Ongoing'
	if (isLeaveCompleted(leave)) return 'Completed'
	return 'Upcoming'
}

// Image upload state
const showImageDialog = ref(false)
const showSignatureDialog = ref(false)
const newImage = ref(null)
const isUploading = ref(false)
const uploadedResult = ref(null)
const showEditDialog = ref(false)
const editingEmployee = ref({})
const showDeleteDialog = ref(false)
const removing = ref(false)
const deleteForm = ref({
	confirmName: '',
	passkey: '',
})
const deleteError = ref('')
const validateLoading = ref(false)
const countryOptions = countries.map((country) => ({
	label: country.name,
	value: country.alpha2,
}))
const formSubmitted = ref(false)

// Image handlers

async function updateEmployee() {
	if (!validateEditForm()) return

	try {
		const employeeData = {
			name: props.employee.name,
			employee_name: editingEmployee.value.employee_name,
		}

		// Add optional fields only if they have values
		if (editingEmployee.value.gender) employeeData.gender = editingEmployee.value.gender
		if (editingEmployee.value.date_of_birth) employeeData.date_of_birth = editingEmployee.value.date_of_birth
		if (editingEmployee.value.nationality?.label) employeeData.nationality = editingEmployee.value.nationality.label
		if (editingEmployee.value.position) employeeData.position = editingEmployee.value.position
		if (editingEmployee.value.salary) employeeData.salary = Number(editingEmployee.value.salary)
		if (editingEmployee.value.phone) employeeData.phone = editingEmployee.value.phone
		if (editingEmployee.value.email) employeeData.email = editingEmployee.value.email
		if (editingEmployee.value.branch) employeeData.branch = editingEmployee.value.branch

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

function openSignatureDialog() {
	showSignatureDialog.value = true
}

function validateEditForm() {
	formSubmitted.value = true
	return editingEmployee.value.employee_name
}

// Add this function in the script setup section
function handleSignatureComplete(signatureUrl) {
  console.log('Success')
}

function cancelDelete() {
	showDeleteDialog.value = false
	deleteForm.value = {
		confirmName: '',
		passkey: '',
	}
	deleteError.value = ''
}

async function validateAndDelete() {
	if (
		deleteForm.value.confirmName !== props.employee?.employee_name ||
		!deleteForm.value.passkey
	)
		return

	validateLoading.value = true
	deleteError.value = ''

	try {
		// First validate the passkey
		const response = await fetch(
			`/api/method/rua.api.delete_rua_document?docname=${props.employee.name}&passkey=${deleteForm.value.passkey}`,
		)
		const result = await response.json()

		if (!response.ok) {
			if (result._server_messages) {
				try {
					const serverMessages = JSON.parse(result._server_messages)
					const firstMessage = JSON.parse(serverMessages[0])
					throw new Error(firstMessage.message)
				} catch {
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
		await props.employeeResource.delete.submit()
		router.push('/employees')
	} catch (error) {
		deleteError.value = error.message
		deleteForm.value.passkey = '' // Clear the passkey input on error
	} finally {
		validateLoading.value = false
	}
}

function initiateDelete() {
	showEditDialog.value = false
	deleteForm.value = {
		confirmName: '',
		passkey: '',
	}
	deleteError.value = ''
	showDeleteDialog.value = true
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

// Computed properties for date handling
const currentMonth = computed(() => {
	return dayjs().format('MMMM')
})

const currentMonthStart = computed(() => {
	return dayjs().startOf('month').format('YYYY-MM-DD')
})

const currentMonthEnd = computed(() => {
	return dayjs().endOf('month').format('YYYY-MM-DD')
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
    return processedAttendance.value.reduce((sum, record) => 
        sum + (+record.overtime || 0), 0)
})

const monthlyAttendanceRecords = computed(() => {
	return processedAttendance.value
		.filter((record) => {
			return (
				isWithinRange(record.date, currentMonthStart.value, currentMonthEnd.value) &&
				(record.status !== 'present' || record.overtime > 0)
			)
		})
		.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))
})
</script>
