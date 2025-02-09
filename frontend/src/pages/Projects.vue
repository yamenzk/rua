<template>
	<div class="space-y-6">
		<!-- Floating Filters Toolbar -->
		<div
			class="fixed bottom-4 right-4 z-10 mb-4 flex items-center justify-between gap-2 p-4 bg-gray-200/60 backdrop-blur-sm w-fit rounded-lg hidden md:flex"
		>
			<div class="flex items-center gap-2">
				<!-- Status Filter -->
				<div class="relative">
					<FormControl
						v-model="statusFilter"
						type="select"
						:options="statusOptions"
						size="sm"
						variant="outline"
					/>

					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
					>
						<FeatherIcon name="chevron-down" class="h-4 w-4" />
					</div>
				</div>

				<!-- Sort Direction Toggle -->
				<div class="relative">
					<FormControl
						type="select"
						:options="sortFieldOptions"
						size="sm"
						variant="outline"
						placeholder="Sort"
						:modelValue="sortField"
						@update:modelValue="handleSortFieldChange"
					/>
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
					>
						<FeatherIcon name="chevron-down" class="h-4 w-4" />
					</div>
				</div>
				<button
					@click="toggleSortDirection"
					class="rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center border border-gray-300"
					title="Toggle Sort Direction"
				>
					<FeatherIcon
						:name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
						class="h-5 w-5 text-gray-600"
					/>
				</button>

				<!-- Add Filter Button -->
				<button
					@click="showFilterDialog = true"
					class="rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center border border-gray-300"
					title="Add Filters"
				>
					<FeatherIcon name="filter" class="h-5 w-5 text-gray-600" />
				</button>
			</div>

			<!-- Active Filters -->
			<div v-if="activeFilters.length" class="flex items-center gap-2 overflow-x-auto">
				<div class="flex gap-2">
					<div
						v-for="(filter, index) in activeFilters"
						:key="index"
						class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs whitespace-nowrap"
					>
						<span>{{ getFieldLabel(filter.field) }}: {{ filter.value }}</span>
						<button
							class="text-gray-500 hover:text-gray-700"
							@click="removeFilter(index)"
							title="Remove Filter"
						>
							<FeatherIcon name="x" class="w-3 h-3" />
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Project Cards Grid -->
		<div class="px-4">
			<div v-if="list.list.loading" class="flex justify-center">
				<LoadingIndicator />
			</div>

			<div v-else-if="!list.data?.length" class="text-center py-8">
				<FeatherIcon name="briefcase" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
				<div class="text-gray-600">No projects found</div>
				<p class="text-sm text-gray-500 mt-1">
					{{
						searchQuery
							? 'Try adjusting your search or filters'
							: 'Create a new project to get started'
					}}
				</p>
			</div>

			<div v-else class="grid gap-6 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
				<div
					v-for="project in filteredProjects"
					:key="project.name"
					class="bg-white rounded-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group cursor-pointer"
					@click="router.push(`/project/${project.name}/overview`)"
				>
					<!-- Project Header -->
					<div class="relative h-48 overflow-hidden">
						<img
							v-if="project.image"
							:src="project.image"
							:alt="project.project_name"
							class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
							@error="$event.target.style.display = 'none'"
						/>
						<div
							v-else
							class="h-full w-full flex items-center justify-center bg-gray-100 transition-colors duration-300 group-hover:bg-gray-200"
						>
							<FeatherIcon name="briefcase" class="w-12 h-12 text-gray-400" />
						</div>

						<!-- Status Badge -->
						<div class="absolute top-3 right-3 z-10">
							<div
								class="px-2 py-1 rounded-full text-xs font-medium"
								:class="getStatusClass(project.status)"
							>
								{{ project.status }}
							</div>
						</div>
					</div>

					<!-- Project Details -->
					<div class="p-5 space-y-3">
						<div class="flex justify-between items-start">
							<div>
								<h3
									class="font-bold text-lg text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1"
								>
									{{ project.project_name }}
								</h3>
								<p class="text-sm text-gray-500 mt-1 line-clamp-2">
									{{ project.description || 'No description available' }}
								</p>
							</div>
						</div>

						<!-- Project Stats -->
						<div class="space-y-2 mt-4">
							<!-- Progress Bar -->
							<div>
								<div class="flex justify-between items-center text-xs mb-1">
									<span class="text-gray-600">Completion</span>
									<span class="font-medium"
										>{{ Math.round(project.completion || 0) }}%</span
									>
								</div>
								<div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
									<div
										class="h-full bg-gray-900 rounded-full transition-all duration-300"
										:style="{
											width: `${Math.round(project.completion || 0)}%`,
										}"
									></div>
								</div>
							</div>

							<!-- Location and Value -->
							<div
								class="flex items-center justify-between text-xs text-gray-600 mt-2"
							>
								<div class="flex items-center gap-2 truncate w-1/2">
									<FeatherIcon name="map-pin" class="w-4 h-4 text-gray-400" />
									<span class="truncate">{{ project.location || 'Nil' }}</span>
								</div>
								<div class="flex items-center">
									<span>{{ formatCurrency(project.contract_value) }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

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
						v-if="newFilter.field === 'status'"
						type="select"
						:options="statusOptions"
						label="Value"
						required
						v-model="newFilter.value"
					/>
					<FormControl
						v-else-if="newFilter.field === 'completion'"
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

		<!-- New Project Dialog -->
		<Dialog v-model="showNewProject" :options="dialogOptions">
			<template #body-content>
				<div class="space-y-4">
					<Input v-model="newProject.project_name" label="Project Name" required />
					<Input v-model="newProject.location" label="Location" required />
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, inject, h, onMounted, computed } from 'vue'
import { Input, Dialog, FeatherIcon, LoadingIndicator, FormControl } from 'frappe-ui'
import { useRouter } from 'vue-router'
import { projectResource } from '@/data/project'
import { formatCurrency } from '@/utils/format'

const router = useRouter()
const setHeaderAction = inject('setHeaderAction')

onMounted(() => {
	setHeaderAction(() =>
		h(
			'div',
			{
				class: 'flex items-center justify-between gap-4 flex-1 px-2',
			},
			[
				// Search Field
				h(
					'div',
					{
						class: 'relative flex-1 max-w-2xl',
					},
					[
						h(
							'div',
							{
								class: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
							},
							[
								h(FeatherIcon, {
									name: 'search',
									class: 'h-4 w-4 text-gray-400',
								}),
							],
						),
						h('input', {
							type: 'text',
							placeholder: 'Search projects...',
							value: searchQuery.value,
							onInput: (e) => (searchQuery.value = e.target.value),
							class: `
          block w-[180px] lg:w-full rounded-xl border-0 py-2 pl-10 pr-4 
          text-gray-900 ring-1 ring-inset ring-gray-200 
          placeholder:text-gray-400 
          focus:ring-2 focus:ring-inset focus:ring-gray-900
          transition-all duration-200
          bg-white/50 hover:bg-white
          sm:text-sm sm:leading-6
        `,
						}),
					],
				),

				// New Project Button
				h(
					'button',
					{
						class: `
        inline-flex items-center gap-2 
        rounded-xl px-4 py-2.5
        text-sm font-semibold text-white
        bg-gray-900 hover:bg-gray-800
        transition duration-200 ease-in-out
        shadow-sm hover:shadow
        focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
      `,
						onClick: () => (showNewProject.value = true),
					},
					[
						h(FeatherIcon, {
							name: 'plus',
							class: 'h-4 w-4',
						}),
						h(
							'span',
							{
								class: 'hidden sm:inline',
							},
							'New Project',
						),
					],
				),
			],
		),
	)
})

// State
const searchQuery = ref('')
const sortField = ref('project_name')
const sortDirection = ref('asc')
const statusFilter = ref('In Progress')
const activeFilters = ref([])
const showFilterDialog = ref(false)
const showNewProject = ref(false)
const newFilter = ref({
	field: '',
	operator: '=',
	value: '',
})
const newProject = ref({
	project_name: '',
	description: '',
})

const dialogOptions = {
	title: 'New Project',
	size: 'sm',
	actions: [
		{
			label: 'Create',
			variant: 'solid',
			onClick: createProject,
		},
	],
}

// Field Options
const fieldOptions = [
	{ label: 'Creation Date', value: 'creation', sortOnly: true },
	{ label: 'Project Name', value: 'project_name' },
	{ label: 'Status', value: 'status' },
	{ label: 'Location', value: 'location' },
	{ label: 'Completion', value: 'completion' },
	{ label: 'Contract Value', value: 'contract_value' },
]

// Derived options for filters and sorting
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

const statusOptions = [
  { label: 'All', value: '' },
	{ label: 'Tender', value: 'Tender' },
	{ label: 'In Progress', value: 'In Progress' },
	{ label: 'Completed', value: 'Completed' },
	{ label: 'Job in Hand', value: 'Job in Hand' },
	{ label: 'Cancelled', value: 'Cancelled' },
]

const list = projectResource

function updateListFilters() {
	const baseFilters = [['is_child', '!=', 1]] // Always exclude child projects

	// Convert activeFilters to server-side filters
	const userFilters = activeFilters.value.map((filter) => {
		let value = filter.value

		// Handle different fields and operators
		switch (filter.field) {
			case 'completion':
				// Map comparison operators for numeric fields
				const comparisonMap = {
					'=': '==',
					'!=': '!=',
					'>': '>',
					'<': '<',
					'>=': '>=',
					'<=': '<=',
				}
				return [filter.field, comparisonMap[filter.operator], Number(value)]

			case 'contract_value':
				return [filter.field, filter.operator, Number(value)]

			case 'project_name':
				// For text fields using 'like', add wildcard
				return [filter.field, filter.operator, `%${value}%`]

			default:
				return [filter.field, filter.operator, value]
		}
	})

	// Combine base filters with user filters
	list.filters = [...baseFilters, ...userFilters]
	list.reload()
}

const filteredProjects = computed(() => {
  let projects = list.data || []

  // Search Filter
  if (searchQuery.value) {
    projects = projects.filter(project => 
      project.project_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Status Filter
  if (statusFilter.value) {
    projects = projects.filter((project) => project.status === statusFilter.value)
  }

  // Apply all active filters
  return projects.filter((project) =>
    activeFilters.value.every((filter) => {
      const projectValue = project[filter.field]

      switch (filter.operator) {
        case '=':
          return projectValue == filter.value
        case '!=':
          return projectValue != filter.value
        case '>':
          return projectValue > filter.value
        case '<':
          return projectValue < filter.value
        case '>=':
          return projectValue >= filter.value
        case '<=':
          return projectValue <= filter.value
        case 'like':
          return projectValue
            .toString()
            .toLowerCase()
            .includes(filter.value.toLowerCase())
        default:
          return true
      }
    }),
  )
})
function getStatusClass(status) {
	const themes = {
		Tender: 'bg-gray-100 text-gray-700',
		'In Progress': 'bg-blue-100 text-blue-700',
		Completed: 'bg-green-100 text-green-700',
		'Job in Hand': 'bg-orange-100 text-orange-700',
		Cancelled: 'bg-red-100 text-red-700',
	}
	return themes[status] || 'bg-gray-100 text-gray-700'
}

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

function getFieldLabel(fieldValue) {
	return filterFieldOptions.find((option) => option.value === fieldValue)?.label || fieldValue
}

import { generateProjectDescription } from '../utils/projectDescriptionGenerator'
async function createProject() {
	try {
		const description = await generateProjectDescription(
			newProject.value.project_name,
			newProject.value.location,
		)
		await list.insert.submit({
			project_name: newProject.value.project_name,
			location: newProject.value.location,
			description: description,
		})

		showNewProject.value = false
		newProject.value = {
			project_name: '',
			location: '',
		}
	} catch (error) {
		console.error('Error creating project:', error)
		throw error
	}
}

onMounted(async () => {
	// Initialize with only excluding child projects
	list.filters = [['is_child', '!=', 1]]
	await list.reload()
})
</script>
<style scoped>
.line-clamp-1 {
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
