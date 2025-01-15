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
			theme="blue"
			size="sm"
			label="Setup Attendance"
			@click="showAttendanceDialog"
		>
			Setup Attendance
		</Button>

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
import { createListResource } from 'frappe-ui'
import countries from '../data/countries.json'
import flags from '../data/flags.json'
const $socket = inject('$socket')


// Router setup
const router = useRouter()

// Setup header action
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

// State
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
const isReadOnly = computed(() => {
  const now = new Date()
  const dubaiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }))
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

// Options
const genderOptions = [
	{ label: 'Male', value: 'Male' },
	{ label: 'Female', value: 'Female' },
]

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

// Transform countries data for Autocomplete
const countryOptions = countries.map((country) => ({
	label: country.name,
	value: country.alpha2,
}))

// Position suggestions
const positionOptions = [
	'CEO',
	'Operations Manager',
	'Production Supervisor',
	'Glass Fabricator',
	'Aluminum Fabricator',
	'CNC Operator',
	'Quality Control Inspector',
	'Installation Team Leader',
	'Installer',
	'Driver',
	'Sales Manager',
	'Sales Representative',
	'Accountant',
	'HR Manager',
	'Warehouse Supervisor',
	'Warehouse Worker',
	'Maintenance Technician',
].map((position) => ({
	label: position,
	value: position,
}))

// Create list resource
const list = createListResource({
  doctype: 'RUA Employee',
  fields: [
    'name',
    'employee_name',
    'date_of_birth',
    'gender',
    'nationality',
    'position',
    'salary',
    'image',
  ],
  filters: [],
  orderBy: 'creation desc',
  auto: true,
  transform(data) {
    return data
  },
  cache: ['RUA Employee'],
  realtime: true, // Add realtime
}, { $socket }) // Pass vm context with socket

// Update the attendance list resource
const attendanceList = createListResource({
  doctype: 'RUA Attendance',
  fields: ['name', 'date', 'attendance_log'],
  filters: [['date', '=', getTodayDate()]],
  auto: true,
  realtime: true, // Add realtime
}, { $socket }) // Pass vm context with socket

// Handlers
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

		console.log('Submitting employee data:', employeeData)
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
		console.error('Error creating employee:', error)
	}
}

function formatCurrency(value) {
	if (!value) return '0'
	return Number(value).toLocaleString()
}

const filteredEmployees = computed(() => {
  if (!list.data) return []
  
  return list.data.filter(employee => 
    employee.employee_name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const computedActions = computed(() => {
  if (isReadOnly.value) return []
  
  return [{
    label: todayAttendance.value ? 'Update' : 'Save',
    variant: 'solid',
    onClick: () => saveAttendance()
  }]
})

// Methods
function getTodayDate() {
  // Create date in current time
  const now = new Date()

  // Convert to Dubai time (GMT+4)
  const dubaiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }))
  
  // Format as YYYY-MM-DD
  const year = dubaiTime.getFullYear()
  const month = String(dubaiTime.getMonth() + 1).padStart(2, '0')
  const day = String(dubaiTime.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

function initializeAttendance() {
  attendance.value = {}
  list.data?.forEach(employee => {
    attendance.value[employee.name] = {
      present: true,
      late: false,
      absent: false,
      overtime: 0
    }
  })
}

function handleAttendanceChange(employeeId, type) {
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

async function loadExistingAttendance() {
  if (!attendanceList.data?.length) return false
  
  todayAttendance.value = attendanceList.data[0]
  attendance.value = JSON.parse(todayAttendance.value.attendance_log)
  return true
}

async function showAttendanceDialog() {
  console.log(getTodayDate())
  if (isReadOnly.value) {
    const exists = await loadExistingAttendance()
    if (!exists) {
      // Show message that no attendance was created
      return
    }
  } else {
    // Initialize with all present if no existing record
    await loadExistingAttendance() || initializeAttendance()
  }
  
  showDialog.value = true
}

async function saveAttendance() {
  if (isReadOnly.value) return
  
  const attendanceData = JSON.stringify(attendance.value)
  
  try {
    if (todayAttendance.value) {
      // Update existing record
      await attendanceList.setValue.submit({
        name: todayAttendance.value.name,
        attendance_log: attendanceData
      })
    } else {
      // Create new record
      await attendanceList.insert.submit({
        date: getTodayDate(),
        attendance_log: attendanceData
      })
    }
    
    showDialog.value = false
    await attendanceList.reload()
  } catch (error) {
    console.error('Error saving attendance:', error)
  }
}


</script>
