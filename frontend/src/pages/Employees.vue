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
      <Button
        variant="subtle"
        size="sm"
        @click="toggleSortDirection"
        class="flex-shrink-0"
      >
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
          <button
            class="text-gray-500 hover:text-gray-700"
            @click="removeFilter(index)"
          >
            <FeatherIcon name="x" class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Employees Grid -->
    <div v-if="list.list.loading" class="flex justify-center">
      <LoadingIndicator />
    </div>

    <div v-else-if="!list.data?.length" class="text-center py-8">
      <div class="text-gray-600">No employees found</div>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
            @error="$event.target.style.display='none'"
          />
          <div v-else class="h-full w-full flex items-center justify-center bg-gray-100 rounded-t-lg">
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
            <div class="flex items-center gap-2">
              <FeatherIcon name="flag" class="w-4 h-4" />
              <span>{{ employee.nationality }}</span>
            </div>
            <div class="flex items-center gap-2">
              <FeatherIcon name="dollar-sign" class="w-4 h-4" />
              <span>{{ formatCurrency(employee.salary) }}</span>
            </div>
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
            }
          }
        ]
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
              <span v-if="!newEmployee.employee_name && formSubmitted" class="text-sm text-red-500">
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
              <span v-if="!newEmployee.date_of_birth && formSubmitted" class="text-sm text-red-500">
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
              <span v-if="!newEmployee.gender && formSubmitted" class="text-sm text-red-500">
                Gender is required
              </span>
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Nationality</label>
              <Autocomplete
                :options="countryOptions"
                v-model="newEmployee.nationality"
                placeholder="Select country"
                class="w-full"
              >
                <template #item-prefix="{ option }">
                  <img
                    :src="flags[option.value]"
                    class="h-4 w-4 rounded-full"
                  />
                </template>
              </Autocomplete>
              <span v-if="!newEmployee.nationality && formSubmitted" class="text-sm text-red-500">
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
              <span v-if="!newEmployee.position && formSubmitted" class="text-sm text-red-500">
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
              <span v-if="!newEmployee.salary && formSubmitted" class="text-sm text-red-500">
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
          appearance: 'primary'
        },
        size: 'sm',
        actions: [
          {
            label: 'Apply',
            variant: 'solid',
            onClick: () => {
              addFilter()
              showFilterDialog = false
            }
          }
        ]
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
import { Button, FormControl, Dialog, FeatherIcon, LoadingIndicator, debounce, Autocomplete } from 'frappe-ui'
import { createListResource } from 'frappe-ui'
import countries from '../data/countries.json'
import flags from '../data/flags.json'

// Router setup
const router = useRouter()

// Setup header action
const setHeaderAction = inject('setHeaderAction')
setHeaderAction(h(Button, {
  variant: 'solid',
  onClick: () => showNewEmployeeDialog.value = true,
}, () => 'Add Employee'))

// State
const searchQuery = ref('')
const sortField = ref('creation')
const sortDirection = ref('desc')
const activeFilters = ref([])
const showFilterDialog = ref(false)
const showNewEmployeeDialog = ref(false)
const formSubmitted = ref(false)

const newEmployee = ref({
  employee_name: '',
  date_of_birth: null,
  gender: '',
  nationality: '',
  position: '',
  salary: null
})

const newFilter = ref({
  field: '',
  operator: '=',
  value: ''
})

// Options
const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' }
]

const fieldOptions = [
  { label: 'Creation Date', value: 'creation', sortOnly: true },
  { label: 'Employee ID', value: 'name' },
  { label: 'Employee Name', value: 'employee_name' },
  { label: 'Position', value: 'position' },
  { label: 'Gender', value: 'gender' },
  { label: 'Nationality', value: 'nationality' },
  { label: 'Salary', value: 'salary' }
]

const filterFieldOptions = fieldOptions.filter(field => !field.sortOnly)
const sortFieldOptions = fieldOptions

const operatorOptions = [
  { label: 'Equals', value: '=' },
  { label: 'Not Equals', value: '!=' },
  { label: 'Greater Than', value: '>' },
  { label: 'Less Than', value: '<' },
  { label: 'Greater or Equal', value: '>=' },
  { label: 'Less or Equal', value: '<=' },
  { label: 'Like', value: 'like' }
]

// Transform countries data for Autocomplete
const countryOptions = countries.map(country => ({
  label: country.name,
  value: country.alpha2
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
  'Maintenance Technician'
].map(position => ({
  label: position,
  value: position
}))

// Create list resource
const list = createListResource({
  doctype: 'RUA Employee',
  fields: ['name', 'employee_name', 'date_of_birth', 'gender', 'nationality', 'position', 'salary', 'image'],
  filters: [],
  orderBy: 'creation desc',
  auto: true,
  transform(data) {
    return data
  },
  cache: ['RUA Employee']
})

// Handlers
const handleSearch = debounce((value) => {
  searchQuery.value = value
  if (value) {
    activeFilters.value = activeFilters.value.filter(f => f.field !== 'employee_name')
    activeFilters.value.push({
      field: 'employee_name',
      operator: 'like',
      value: value
    })
  } else {
    activeFilters.value = activeFilters.value.filter(f => f.field !== 'employee_name')
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
    value: newFilter.value.value
  })
  updateListFilters()
  newFilter.value = { field: '', operator: '=', value: '' }
}

function removeFilter(index) {
  activeFilters.value.splice(index, 1)
  updateListFilters()
}

function updateListFilters() {
  list.filters = activeFilters.value.map(filter => {
    let value = filter.value
    if (filter.operator === 'like') {
      value = `%${value}%`
    }
    return [filter.field, filter.operator, value]
  })
  list.reload()
}

function getFieldLabel(fieldValue) {
  return filterFieldOptions.find(option => option.value === fieldValue)?.label || fieldValue
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
</script>