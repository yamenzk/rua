<template>
	<div class="space-y-6">
		<!-- Search and Filters Section -->
		<div class="flex items-center gap-2 overflow-x-auto p-2">
			<!-- Search -->
			<FormControl
				type="search"
				:ref_for="true"
				size="sm"
				variant="subtle"
				placeholder="Search employees..."
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

		<!-- Attendance Setup Button -->
		<Button
			variant="outline"
			size="sm"
			:label="attendanceButtonLabel"
			@click="showAttendanceDialog"
		>
			{{ attendanceButtonLabel }}
		</Button>

		<!-- Expiring Documents Button -->
		<Button
			variant="outline"
			class="ml-2"
			size="sm"
			@click="showExpiringDocumentsDialog = true"
		>
			Check Document Status
		</Button>

		<!-- Expiring Documents Dialog -->
		<Dialog
			v-model="showExpiringDocumentsDialog"
			:options="{
				title: 'Document Status',
				size: 'xl',
			}"
		>
			<template #body-content>
				<div class="space-y-6">
					<!-- Search Bar -->
					<FormControl
						type="search"
						size="sm"
						variant="subtle"
						placeholder="Search employees..."
						v-model="expiringDocumentsSearch"
						class="w-full"
					/>

					<!-- Tabs for Expiring and Expired Documents -->
					<div class="border-b flex">
						<button
							@click="activeDocumentTab = 'expiring'"
							class="px-4 py-2 border-b-2 transition-colors"
							:class="
								activeDocumentTab === 'expiring'
									? 'border-gray-900 text-gray-900'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							"
						>
							Documents Expiring Soon
						</button>
						<button
							@click="activeDocumentTab = 'expired'"
							class="px-4 py-2 border-b-2 transition-colors"
							:class="
								activeDocumentTab === 'expired'
									? 'border-red-500 text-red-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							"
						>
							Recently Expired Documents
						</button>
					</div>

					<!-- Expiring Documents Section -->
					<div v-if="activeDocumentTab === 'expiring'">
						<div
							v-if="groupedExpiringDocuments.length"
							class="space-y-4 max-h-[60vh] overflow-y-auto"
						>
							<div
								v-for="employeeGroup in groupedExpiringDocuments"
								:key="employeeGroup.employeeName"
								class="bg-gray-50 rounded-lg p-4 space-y-3"
							>
								<div class="flex items-center gap-3">
									<Avatar
										:image="employeeGroup.employeeImage"
										:label="getInitials(employeeGroup.employeeName)"
										shape="circle"
										size="md"
									/>
									<h3 class="font-semibold text-lg">
										{{ employeeGroup.employeeName }}
									</h3>
								</div>

								<div class="space-y-2">
									<div
										v-for="doc in employeeGroup.documents"
										:key="doc.name"
										class="flex items-center justify-between p-3 bg-white rounded-lg border"
										:class="getExpiryAlertClass(doc.daysUntilExpiry)"
									>
										<div class="flex items-center gap-3">
											<FeatherIcon
												:name="getFileIcon(doc.document)"
												class="w-6 h-6 text-gray-400"
											/>
											<div>
												<div class="font-medium">
													{{ doc.document_name }}
												</div>
												<div class="text-sm text-gray-500">
													Expires on {{ formatDate(doc.expiry_date) }}
												</div>
											</div>
										</div>
										<div
											class="font-semibold px-3 py-1 rounded-full text-sm"
											:class="getExpiryAlertClass(doc.daysUntilExpiry)"
										>
											{{ formatExpiryText(doc.daysUntilExpiry) }}
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Empty State for Expiring Documents -->
						<div v-else class="text-center py-12 text-gray-500">
							<FeatherIcon name="file" class="mx-auto h-12 w-12 text-gray-400" />
							<p class="mt-4">No documents are expiring soon</p>
						</div>
					</div>

					<!-- Expired Documents Section -->
					<div v-else-if="activeDocumentTab === 'expired'">
						<div
							v-if="groupedExpiredDocuments.length"
							class="space-y-4 max-h-[60vh] overflow-y-auto"
						>
							<div
								v-for="employeeGroup in groupedExpiredDocuments"
								:key="employeeGroup.employeeName"
								class="bg-red-50 rounded-lg p-4 space-y-3"
							>
								<div class="flex items-center gap-3">
									<Avatar
										:image="employeeGroup.employeeImage"
										:label="getInitials(employeeGroup.employeeName)"
										shape="circle"
										size="md"
									/>
									<h3 class="font-semibold text-lg text-red-800">
										{{ employeeGroup.employeeName }}
									</h3>
								</div>

								<div class="space-y-2">
									<div
										v-for="doc in employeeGroup.documents"
										:key="doc.name"
										class="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
									>
										<div class="flex items-center gap-3">
											<FeatherIcon
												:name="getFileIcon(doc.document)"
												class="w-6 h-6 text-red-400"
											/>
											<div>
												<div class="font-medium">
													{{ doc.document_name }}
												</div>
												<div class="text-sm text-gray-500">
													Expired on {{ formatDate(doc.expiry_date) }}
												</div>
											</div>
										</div>
										<div
											class="font-semibold px-3 py-1 rounded-full text-sm bg-red-100 text-red-700"
										>
											{{ formatDaysSinceExpiry(doc.daysUntilExpiry) }}
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Empty State for Expired Documents -->
						<div v-else class="text-center py-12 text-gray-500">
							<FeatherIcon name="file" class="mx-auto h-12 w-12 text-gray-400" />
							<p class="mt-4">No recently expired documents</p>
						</div>
					</div>
				</div>
			</template>
		</Dialog>

		<!-- Attendance Dialog -->
		<Dialog
			v-model="showDialog"
			:options="{
				title: 'Daily Attendance',
				size: 'xl',
				actions: computedActions,
			}"
		>
			<template #body-content>
				<div class="space-y-4">
					<!-- Search Bar -->
					<FormControl
						type="search"
						size="sm"
						variant="subtle"
						placeholder="Search employees..."
						v-model="searchQuery"
						class="w-full"
					/>

					<!-- Attendance List -->
					<div class="space-y-4 max-h-[60vh] overflow-y-auto">
						<div
							v-for="employee in filteredEmployees"
							:key="employee.name"
							class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
						>
							<Avatar
								:image="employee.image"
								:label="getInitials(employee.employee_name)"
								shape="circle"
								size="md"
							/>

							<div class="flex-grow">
								<span class="font-medium">{{ employee.employee_name }}</span>
							</div>

							<div
								class="flex items-center gap-4"
								:class="{ 'opacity-50': isReadOnly }"
							>
								<FormControl
									type="checkbox"
									size="sm"
									label="Present"
									v-model="attendance[employee.name].present"
									:disabled="isReadOnly"
									@change="handleAttendanceChange(employee.name, 'present')"
								/>

								<FormControl
									type="checkbox"
									size="sm"
									label="Late"
									v-model="attendance[employee.name].late"
									:disabled="isReadOnly"
									@change="handleAttendanceChange(employee.name, 'late')"
								/>

								<FormControl
									type="checkbox"
									size="sm"
									label="Absent"
									v-model="attendance[employee.name].absent"
									:disabled="isReadOnly"
									@change="handleAttendanceChange(employee.name, 'absent')"
								/>

								<FormControl
									type="number"
									size="sm"
									class="w-24"
									placeholder="OT Hours"
									v-model="attendance[employee.name].overtime"
									:disabled="isReadOnly"
								/>
							</div>
						</div>
					</div>

					<!-- Read-only message -->
					<div v-if="isReadOnly" class="text-sm text-gray-500 italic text-center">
						Attendance sheet is read-only after 8 PM
					</div>
				</div>
			</template>
		</Dialog>

		<!-- No Attendance @ 8 PM Dialog -->
		<Dialog
  v-model="noAttendanceDialog"
  :options="{
    title: 'Attendance Locked',
    message: 'You cannot record attendance after 8 PM.',
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
          noAttendanceDialog = false
        }
      }
    ]
  }"
></Dialog>

		<!-- Employees Grid -->
		<div v-if="list.list.loading" class="flex justify-center">
			<LoadingIndicator />
		</div>

		<div v-else-if="!list.data?.length" class="text-center py-8">
			<div class="text-gray-600">No employees found</div>
		</div>

		<div v-else class="grid gap-6 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
			<div
				v-for="employee in list.data"
				:key="employee.name"
				class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
				@click="router.push(`/employee/${employee.name}/overview`)"
			>
				<!-- Employee Card -->
				<div class="relative h-48">
					<img
						v-if="employee.image"
						:src="employee.image"
						:alt="employee.employee_name"
						class="h-full w-full object-cover rounded-t-lg"
						@error="$event.target.style.display = 'none'"
					/>
					<div
						v-else
						class="h-full w-full flex items-center justify-center bg-gray-100 rounded-t-lg"
					>
						<FeatherIcon name="user" class="w-12 h-12 text-gray-400" />
					</div>
				</div>

				<!-- Employee Details -->
				<div class="p-4 space-y-3">
					<h3 class="font-semibold text-lg">{{ employee.employee_name }}</h3>
					<div class="space-y-2 text-sm text-gray-600">
						<div class="flex items-center gap-2">
							<FeatherIcon name="hash" class="w-4 h-4" />
							<span>{{ employee.name }}</span>
						</div>
						<div class="flex items-center gap-2">
							<FeatherIcon name="briefcase" class="w-4 h-4" />
							<span>{{ employee.position }}</span>
						</div>
						<!-- <div class="flex items-center gap-2">
							<FeatherIcon name="flag" class="w-4 h-4" />
							<span>{{ employee.nationality }}</span>
						</div>
						<div class="flex items-center gap-2">
							<FeatherIcon name="dollar-sign" class="w-4 h-4" />
							<span>{{ formatCurrency(employee.salary) }}</span>
						</div> -->
					</div>
				</div>
			</div>
		</div>

		<!-- New Employee Dialog -->
		<Dialog
			v-model="showNewEmployeeDialog"
			:options="{
				title: 'Add New Employee',
				size: 'lg',
				actions: [
					{
						label: 'Create',
						variant: 'solid',
						loading: list.insert.loading,
						onClick: () => {
							return createEmployee()
						},
					},
				],
			}"
		>
			<template #body-content>
				<div class="space-y-4">
					<!-- Employee Details Form -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="space-y-1">
							<FormControl
								type="text"
								label="Employee Name"
								required
								v-model="newEmployee.employee_name"
							/>
							<span
								v-if="!newEmployee.employee_name && formSubmitted"
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
								v-model="newEmployee.date_of_birth"
							/>
							<span
								v-if="!newEmployee.date_of_birth && formSubmitted"
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
								v-model="newEmployee.gender"
							/>
							<span
								v-if="!newEmployee.gender && formSubmitted"
								class="text-sm text-red-500"
							>
								Gender is required
							</span>
						</div>

						<div class="space-y-1">
							<label class="block text-sm font-medium text-gray-700"
								>Nationality</label
							>
							<Autocomplete
								:options="countryOptions"
								v-model="newEmployee.nationality"
								placeholder="Select country"
								class="w-full"
							>
								<template #item-prefix="{ option }">
									<img :src="flags[option.value]" class="h-4 w-4 rounded-full" />
								</template>
							</Autocomplete>
							<span
								v-if="!newEmployee.nationality && formSubmitted"
								class="text-sm text-red-500"
							>
								Nationality is required
							</span>
						</div>

						<div class="space-y-1">
							<label class="block text-sm font-medium text-gray-700">Position</label>
							<Autocomplete
								:options="positionOptions"
								v-model="newEmployee.position"
								placeholder="Select position"
								class="w-full"
							/>
							<span
								v-if="!newEmployee.position && formSubmitted"
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
								v-model="newEmployee.salary"
							/>
							<span
								v-if="!newEmployee.salary && formSubmitted"
								class="text-sm text-red-500"
							>
								Salary is required
							</span>
						</div>
					</div>
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
						v-if="newFilter.field === 'gender'"
						type="select"
						:options="genderOptions"
						label="Value"
						required
						v-model="newFilter.value"
					/>
					<FormControl
						v-else-if="newFilter.field === 'salary'"
						type="number"
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
import { useRouter } from 'vue-router'
import {
	Button,
	FormControl,
	Dialog,
	Avatar,
	FeatherIcon,
	LoadingIndicator,
	debounce,
	Autocomplete,
} from 'frappe-ui'
import countries from '../data/countries.json'
import flags from '../data/flags.json'
import { employeeResource } from '../data/employee'
import { attendanceResource } from '../data/attendance'
import { partyResource } from '../data/party'
import { genderOptions, positionOptions } from '../data/employeeOptions'
import { documentResource } from '@/data/document'


const router = useRouter()

const setHeaderAction = inject('setHeaderAction')
setHeaderAction(
	h(
		Button,
		{
			variant: 'solid',
			onClick: () => (showNewEmployeeDialog.value = true),
		},
		() => 'Add Employee',
	),
)

const sortField = ref('creation')
const sortDirection = ref('desc')
const activeFilters = ref([])
const showFilterDialog = ref(false)
const showNewEmployeeDialog = ref(false)
const formSubmitted = ref(false)
const showDialog = ref(false)
const searchQuery = ref('')
const attendance = ref({})
const todayAttendance = ref(null)
const showExpiringDocumentsDialog = ref(false)
const expiringDocumentsSearch = ref('')
const activeDocumentTab = ref('expiring')
const noAttendanceDialog = ref(false)

function getDubaiDateTime() {
	const now = new Date()
	return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }))
}

const attendanceButtonLabel = computed(() => {
	const currentDate = formatDate(getDubaiDateTime())
	const todayRecord = findAttendanceRecord(currentDate)
	return todayRecord ? 'Edit Attendance' : 'Setup Attendance'
})

function formatDate(date) {
	// Handle different input types
	if (!(date instanceof Date)) {
		date = new Date(date)
	}

	// Check if date is valid
	if (isNaN(date.getTime())) {
		return 'N/A'
	}

	return date.toLocaleDateString('en-CA')
}

const isReadOnly = computed(() => {
	const dubaiTime = getDubaiDateTime()
	return dubaiTime.getHours() >= 20
})

const newEmployee = ref({
	employee_name: '',
	date_of_birth: null,
	gender: '',
	nationality: '',
	position: '',
	salary: null,
})

const newFilter = ref({
	field: '',
	operator: '=',
	value: '',
})

const fieldOptions = [
	{ label: 'Creation Date', value: 'creation', sortOnly: true },
	{ label: 'Employee ID', value: 'name' },
	{ label: 'Employee Name', value: 'employee_name' },
	{ label: 'Position', value: 'position' },
	{ label: 'Gender', value: 'gender' },
	{ label: 'Nationality', value: 'nationality' },
	{ label: 'Salary', value: 'salary' },
]

const filterFieldOptions = fieldOptions.filter((field) => !field.sortOnly)
const sortFieldOptions = fieldOptions

const operatorOptions = [
	{ label: 'Equals', value: '=' },
	{ label: 'Not Equals', value: '!=' },
	{ label: 'Greater Than', value: '>' },
	{ label: 'Less Than', value: '<' },
	{ label: 'Greater or Equal', value: '>=' },
	{ label: 'Less or Equal', value: '<=' },
	{ label: 'Like', value: 'like' },
]

const countryOptions = countries.map((country) => ({
	label: country.name,
	value: country.alpha2,
}))

const list = employeeResource

const attendanceList = attendanceResource

const handleSearch = debounce((value) => {
	searchQuery.value = value
	if (value) {
		activeFilters.value = activeFilters.value.filter((f) => f.field !== 'employee_name')
		activeFilters.value.push({
			field: 'employee_name',
			operator: 'like',
			value: value,
		})
	} else {
		activeFilters.value = activeFilters.value.filter((f) => f.field !== 'employee_name')
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

function validateForm() {
	formSubmitted.value = true
	return (
		newEmployee.value.employee_name &&
		newEmployee.value.date_of_birth &&
		newEmployee.value.gender &&
		newEmployee.value.nationality &&
		newEmployee.value.position &&
		newEmployee.value.salary
	)
}

const groupedExpiringDocuments = computed(() => {
	try {
		if (!documentResource.data || !list.data) return []

		// Group documents by employee, filter for expiring documents
		const expiringDocs = documentResource.data.filter((doc) => {
			const daysUntilExpiry = getDaysUntilExpiry(doc.expiry_date)
			return daysUntilExpiry <= 40 && daysUntilExpiry > 0
		})

		// Create a grouped structure
		const grouped = expiringDocs
			.map((doc) => {
				// Find corresponding employee
				const employee = list.data.find((emp) => emp.name === doc.for_docname)

				return {
					...doc,
					daysUntilExpiry: getDaysUntilExpiry(doc.expiry_date),
					employeeName: employee?.employee_name || 'Unknown',
					employeeImage: employee?.image || null,
				}
			})
			// Filter by search query
			.filter(
				(doc) =>
					doc.employeeName
						.toLowerCase()
						.includes(expiringDocumentsSearch.value.toLowerCase()) ||
					doc.document_name
						.toLowerCase()
						.includes(expiringDocumentsSearch.value.toLowerCase()),
			)
			// Group by employee
			.reduce((acc, doc) => {
				const existingGroup = acc.find((group) => group.employeeName === doc.employeeName)
				if (existingGroup) {
					existingGroup.documents.push(doc)
				} else {
					acc.push({
						employeeName: doc.employeeName,
						employeeImage: doc.employeeImage,
						documents: [doc],
					})
				}
				return acc
			}, [])
			// Sort by earliest expiring document
			.sort(
				(a, b) =>
					Math.min(...a.documents.map((d) => d.daysUntilExpiry)) -
					Math.min(...b.documents.map((d) => d.daysUntilExpiry)),
			)

		return grouped
	} catch (error) {
		console.error('Error processing expiring documents:', error)
		return []
	}
})
const groupedExpiredDocuments = computed(() => {
	try {
		if (!documentResource.data || !list.data) return []

		// Group documents by employee, filter for expired documents
		const expiredDocs = documentResource.data.filter((doc) => {
			const daysUntilExpiry = getDaysUntilExpiry(doc.expiry_date)
			return daysUntilExpiry < 0 && daysUntilExpiry > -30
		})

		// Create a grouped structure similar to groupedExpiringDocuments
		const grouped = expiredDocs
			.map((doc) => {
				// Find corresponding employee
				const employee = list.data.find((emp) => emp.name === doc.for_docname)

				return {
					...doc,
					daysUntilExpiry: getDaysUntilExpiry(doc.expiry_date),
					employeeName: employee?.employee_name || 'Unknown',
					employeeImage: employee?.image || null,
				}
			})
			// Filter by search query
			.filter(
				(doc) =>
					doc.employeeName
						.toLowerCase()
						.includes(expiringDocumentsSearch.value.toLowerCase()) ||
					doc.document_name
						.toLowerCase()
						.includes(expiringDocumentsSearch.value.toLowerCase()),
			)
			// Group by employee
			.reduce((acc, doc) => {
				const existingGroup = acc.find((group) => group.employeeName === doc.employeeName)
				if (existingGroup) {
					existingGroup.documents.push(doc)
				} else {
					acc.push({
						employeeName: doc.employeeName,
						employeeImage: doc.employeeImage,
						documents: [doc],
					})
				}
				return acc
			}, [])
			// Sort by most recently expired
			.sort(
				(a, b) =>
					Math.min(...a.documents.map((d) => d.daysUntilExpiry)) -
					Math.min(...b.documents.map((d) => d.daysUntilExpiry)),
			)

		return grouped
	} catch (error) {
		console.error('Error processing expired documents:', error)
		return []
	}
})

// Add this new formatting function
function formatDaysSinceExpiry(days) {
	const absDays = Math.abs(Math.floor(days))
	if (absDays === 1) return 'Expired yesterday'
	return `Expired ${absDays} days ago`
}

function getDaysUntilExpiry(date) {
	if (!date) return Infinity
	const today = new Date().setHours(0, 0, 0, 0)
	const expiryDate = new Date(date).setHours(0, 0, 0, 0)
	return Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
}

function formatExpiryText(days) {
	if (days <= 0) return 'Expired'
	if (days === 1) return 'Expires Tomorrow'
	return `Expires in ${days} days`
}

function getExpiryAlertClass(days) {
	if (days <= 7) return 'bg-red-50 text-red-700 border-red-200'
	if (days <= 15) return 'bg-orange-50 text-orange-700 border-orange-200'
	if (days <= 30) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
	return 'bg-blue-50 text-blue-700 border-blue-200'
}

function getFileIcon(url) {
	if (!url) return 'file'
	const extension = url.split('.').pop().toLowerCase()

	const iconMap = {
		pdf: 'file-text',
		doc: 'file-text',
		docx: 'file-text',
		txt: 'file-text',
		xls: 'grid',
		xlsx: 'grid',
		ppt: 'monitor',
		pptx: 'monitor',
		jpg: 'image',
		jpeg: 'image',
		png: 'image',
		gif: 'image',
	}

	return iconMap[extension] || 'file'
}

async function createEmployee() {
	if (!validateForm()) return

	try {
		const employeeData = {
			employee_name: newEmployee.value.employee_name,
			gender: newEmployee.value.gender,
			date_of_birth: newEmployee.value.date_of_birth,
			nationality: newEmployee.value.nationality.label,
			position: newEmployee.value.position.label,
			salary: Number(newEmployee.value.salary),
		}

		//console.log('Submitting employee data:', employeeData)
		await list.insert.submit(employeeData)

		showNewEmployeeDialog.value = false
		newEmployee.value = {
			employee_name: '',
			date_of_birth: null,
			gender: '',
			nationality: '',
			position: '',
			salary: null,
		}
		formSubmitted.value = false

		await list.reload()
	} catch (error) {
		//console.error('Error creating employee:', error)
	}
}

const filteredEmployees = computed(() => {
	if (!list.data) return []

	return list.data.filter((employee) =>
		employee.employee_name.toLowerCase().includes(searchQuery.value.toLowerCase()),
	)
})

const computedActions = computed(() => {
	if (isReadOnly.value) {
		return [
			{
				label: 'Close',
				variant: 'subtle',
				onClick: () => (showDialog.value = false),
			},
		]
	}

	return [
		{
			label: todayAttendance.value ? 'Update' : 'Save',
			variant: 'solid',
			onClick: () => saveAttendance(),
		},
	]
})

function getInitials(name) {
	return name
		.split(' ')
		.map((word) => word[0])
		.join('')
		.toUpperCase()
}

function handleAttendanceChange(employeeId, type) {
	if (!attendance.value[employeeId]) {
		//console.error(`No attendance record found for employee ${employeeId}`)
		return
	}

	// Don't allow changes in read-only mode
	if (isReadOnly.value) {
		//console.warn('Attendance is in read-only mode after 8 PM')
		return
	}

	const emp = attendance.value[employeeId]

	// Mutual exclusivity logic
	if (type === 'present' && emp.present) {
		emp.late = false
		emp.absent = false
	} else if (type === 'late' && emp.late) {
		emp.present = false
		emp.absent = false
	} else if (type === 'absent' && emp.absent) {
		emp.present = false
		emp.late = false
	}
}

function findAttendanceRecord(date) {
	return attendanceList.data?.find((record) => record.date === date)
}

async function initializeAttendanceData() {
	if (!list.data?.length) {
		//console.warn('Employee list is not loaded yet')
		return false
	}

	attendance.value = {}
	list.data.forEach((employee) => {
		attendance.value[employee.name] = {
			present: true,
			late: false,
			absent: false,
			overtime: 0,
		}
	})
	return true
}

async function loadExistingAttendance(date) {
	try {
		const record = findAttendanceRecord(date)
		if (!record) {
			return false
		}

		todayAttendance.value = record
		const attendanceLog = JSON.parse(record.attendance_log || '{}')

		// Initialize attendance with existing data
		attendance.value = {}
		list.data?.forEach((employee) => {
			attendance.value[employee.name] = attendanceLog[employee.name] || {
				present: true,
				late: false,
				absent: false,
				overtime: 0,
			}
		})

		return true
	} catch (error) {
		//console.error('Error loading attendance:', error)
		return false
	}
}

async function showAttendanceDialog() {
  try {
    // Ensure employee list is loaded
    if (!list.data?.length) {
      return
    }

    const dubaiTime = getDubaiDateTime()
    const currentDate = formatDate(dubaiTime)

    if (isReadOnly.value) {
      // After 8 PM, only allow viewing of existing records
      const exists = await loadExistingAttendance(currentDate)
      if (!exists) {
        noAttendanceDialog.value = true
        return
      }
    } else {
      // Before 8 PM, allow creating/editing today's attendance
      const exists = await loadExistingAttendance(currentDate)
      if (!exists) {
        const initialized = await initializeAttendanceData()
        if (!initialized) {
          return
        }
      }
    }

    showDialog.value = true
  } catch (error) {
    console.error('Error showing attendance dialog:', error)
  }
}

async function saveAttendance() {
	if (isReadOnly.value) {
		//console.warn('Cannot save attendance after 8 PM')
		return
	}

	const currentDate = formatDate(getDubaiDateTime())
	const attendanceData = JSON.stringify(attendance.value)

	try {
		if (todayAttendance.value) {
			// Update existing record
			await attendanceList.setValue.submit({
				name: todayAttendance.value.name,
				attendance_log: attendanceData,
			})
		} else {
			// Create new record
			await attendanceList.insert.submit({
				date: currentDate,
				attendance_log: attendanceData,
			})
		}

		showDialog.value = false
		await attendanceList.reload()
	} catch (error) {
		//console.error('Error saving attendance:', error)
	}
}
</script>
