<template>
	<div class="space-y-6">
	  <!-- Floating Top Right Actions -->
	  <div class="fixed top-18 right-4 z-10 flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 p-1">
  <button 
    @click="showAttendanceDialog"
    class="
      inline-flex items-center gap-2 
      rounded-lg px-3 py-2
      text-sm font-medium 
      text-gray-700 hover:bg-gray-100
      transition duration-200 ease-in-out
      group
    "
  >
    <FeatherIcon 
      name="calendar" 
      class="h-4 w-4 text-gray-900 group-hover:text-gray-700 transition-colors" 
    />
    <span class="hidden sm:inline">{{ attendanceButtonLabel }}</span>
  </button>

  <div class="h-5 w-px bg-gray-300 mx-1"></div>

  <button 
    @click="showMonthlyAttendanceDialog = true"
    class="
      inline-flex items-center gap-2 
      rounded-lg px-3 py-2
      text-sm font-medium 
      text-gray-700 hover:bg-gray-100
      transition duration-200 ease-in-out
      group
    "
  >
    <FeatherIcon 
      name="list" 
      class="h-4 w-4 text-gray-900 group-hover:text-gray-700 transition-colors" 
    />
    <span class="hidden sm:inline">Attendance List</span>
  </button>

  <div class="h-5 w-px bg-gray-300 mx-1"></div>

  <button 
    @click="showExpiringDocumentsDialog = true"
    class="
      inline-flex items-center gap-2 
      rounded-lg px-3 py-2
      text-sm font-medium 
      text-gray-700 hover:bg-gray-100
      transition duration-200 ease-in-out
      group
    "
  >
    <FeatherIcon 
      name="file-text" 
      class="h-4 w-4 text-gray-900 group-hover:text-gray-700 transition-colors" 
    />
    <span class="hidden sm:inline">Document Status</span>
  </button>
</div>
  
	  <!-- Floating Filters Toolbar -->
	  <div class="fixed bottom-4 right-4 z-10 mb-4 flex items-center justify-between gap-2 p-4 bg-gray-200/60 backdrop-blur-sm w-fit rounded-lg hidden md:flex">
		<div class="flex items-center gap-2">
		  <!-- Type Filter -->
		  <div class="relative">
			<FormControl
						type="select"
						:options="positionOptions"
						size="sm"
						variant="outline"
						placeholder="Position"
						v-model="selectedPosition"
					/>
			<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
			  <FeatherIcon name="chevron-down" class="h-4 w-4" />
			</div>
		  </div>
  
		  <!-- Sort Direction Toggle -->
		  <FormControl
						type="select"
						:options="sortFieldOptions"
						size="sm"
						variant="outline"
						placeholder="Sort"
						:modelValue="sortField"
						@update:modelValue="handleSortFieldChange"
					/>
		  <button 
			@click="toggleSortDirection"
			class="
			  rounded-lg p-2 hover:bg-gray-100 
			  transition-colors duration-200
			  flex items-center justify-center
			  border border-gray-300
			"
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
			class="
			  rounded-lg p-2 hover:bg-gray-100 
			  transition-colors duration-200
			  flex items-center justify-center
			  border border-gray-300
			"
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

		<!-- Monthly Attendance Dialog -->
		<Dialog
			v-model="showMonthlyAttendanceDialog"
			:options="{
				title: 'Monthly Attendance List',
				size: '3xl',
			}"
		>
			<template #body-content>
				<div class="space-y-4">
					<!-- Month Selector -->
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-medium">
							{{ getMonthName(selectedMonth) }} {{ currentYear }}
						</h3>
						<div class="flex items-center gap-2">
							<Button variant="subtle" size="sm" @click="previousMonth">
								<FeatherIcon name="chevron-left" class="w-4 h-4" />
							</Button>
							<Button
								variant="subtle"
								size="sm"
								@click="nextMonth"
								:disabled="isCurrentMonth"
							>
								<FeatherIcon name="chevron-right" class="w-4 h-4" />
							</Button>
						</div>
					</div>

					<!-- Search Bar -->
					<FormControl
						type="search"
						size="sm"
						variant="subtle"
						placeholder="Search employees..."
						v-model="monthlyAttendanceSearch"
						class="w-full"
					/>

					<!-- Attendance Table -->
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Employee
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Present Days
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Late Days
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Absent Days
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Leave Days
    </th>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Total Overtime
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Attendance Rate
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								<tr
									v-for="employee in filteredMonthlyAttendance"
									:key="employee.id"
								>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center">
											<Avatar
												:image="employee.image"
												:label="getInitials(employee.name)"
												shape="circle"
												size="sm"
											/>
											<div class="ml-4">
												<div class="text-sm font-medium text-gray-900">
													{{ employee.name }}
												</div>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{{ employee.presentDays }}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{{ employee.lateDays }}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{{ employee.absentDays }}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {{ employee.leaveDays }}
    </td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{{ employee.totalOvertime }}h
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center">
											<span class="text-sm text-gray-900"
												>{{ employee.attendanceRate }}%</span
											>
											<div class="ml-2 w-16 bg-gray-200 rounded-full h-1.5">
												<div
													class="h-1.5 rounded-full"
													:class="
														getAttendanceRateColor(
															employee.attendanceRate,
														)
													"
													:style="{
														width: employee.attendanceRate + '%',
													}"
												></div>
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</template>
		</Dialog>

		<!-- Expiring Documents Dialog -->
		<Dialog
			v-model="showExpiringDocumentsDialog"
			:options="{
				title: 'Document Status',
				size: '3xl',
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
													Expired on {{ formatDate(doc.expiry_date) }}
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
				size: '3xl',
				actions: computedActions,
			}"
		>
			<template #body-content>
				<div class="space-y-4 overflow-auto max-h-[60vh]">
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

						<div class="flex items-center gap-4" :class="{ 'opacity-50': isReadOnly }">
							<!-- Add leave status for employees on leave -->
							<div
								v-if="isEmployeeOnLeave(employee.name)"
								class="text-sm text-blue-600 flex items-center"
							>
								<FeatherIcon name="calendar" class="w-4 h-4 mr-2" />
								On Leave
							</div>
							<template v-else>
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
							</template>
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
						},
					},
				],
			}"
		></Dialog>

		<!-- Employees Grid -->
		<div v-if="list.list.loading" class="flex justify-center">
      <LoadingIndicator />
    </div>

    <div v-else-if="!list.data?.length" class="text-center py-8 px-6">
      <div class="text-gray-600">No employees found</div>
    </div>

    <div v-else class="grid gap-6 px-6 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
  <div
    v-for="employee in filteredEmployeeGrid"
    :key="employee.name"
	class="
			  bg-white rounded-2xl transition-all duration-300 
			  transform hover:-translate-y-2 
			  overflow-hidden group
			  border border-gray-100 cursor-pointer
			"
        @click="router.push(`/employee/${employee.name}/overview`)"
      >
        <!-- Employee Card Header -->
        <div class="relative h-48 overflow-hidden">
          <img
            v-if="employee.image"
            :src="employee.image"
            :alt="employee.employee_name"
            class="
              w-full h-full object-cover 
              transition-transform duration-300 
              group-hover:scale-105
            "
            @error="$event.target.style.display = 'none'"
          />
          <div
            v-else
            class="
              h-full w-full flex items-center justify-center 
              bg-gray-100 transition-colors duration-300
              group-hover:bg-gray-200
            "
          >
            <FeatherIcon name="user" class="w-12 h-12 text-gray-400" />
          </div>
        </div>

        <!-- Employee Details -->
        <div class="p-5 space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-lg text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1">
                {{ employee.employee_name }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">{{ employee.position }}</p>
            </div>
            <div 
              class="
                w-10 h-10 rounded-full 
                bg-primary-100 text-primary-600
                flex items-center justify-center
                transition-colors group-hover:bg-primary-200
              "
            >
              <FeatherIcon name="chevron-right" class="h-5 w-5 hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          <div class="flex items-center justify-between mt-4">
            <div class="flex items-center space-x-2">
              <FeatherIcon name="hash" class="h-4 w-4 text-gray-400" />
              <span class="text-sm text-gray-600">
                {{ employee.name }}
              </span>
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
								variant="subtle"
								v-model="newEmployee.date_of_birth"
							/>
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
						</div>

						<div class="space-y-1">
							<FormControl
								type="number"
								label="Salary"
								v-model="newEmployee.salary"
							/>
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
import { ref, computed, inject, h, onMounted } from 'vue'
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
	dayjs
} from 'frappe-ui'
import countries from '@/data/countries.json'
import flags from '@/data/flags.json'
import { employeeResource } from '@/data/employee'
import { attendanceResource } from '@/data/attendance'
import { genderOptions, positionOptions } from '@/data/employeeOptions'
import { documentResource } from '@/data/document'
import { leaveResource } from '@/data/leave'
import { 
  getServerDate,
  formatDate,
  getMonthName,
  isWithinRange,
  getCurrentHour,
  getDaysDifference,
  DATE_FORMATS
} from '@/utils/format'

const router = useRouter()

const setHeaderAction = inject('setHeaderAction')
onMounted(() => {
  setHeaderAction(() => h('div', { 
    class: 'flex items-center justify-between gap-4 flex-1 px-2' 
  }, [
    // Search Field
    h('div', { 
      class: 'relative flex-1 max-w-2xl'
    }, [
      h('div', {
        class: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'
      }, [
        h(FeatherIcon, {
          name: 'search',
          class: 'h-4 w-4 text-gray-400'
        })
      ]),
      h('input', {
        type: 'text',
        placeholder: 'Search employees...',
        value: searchQuery.value,
        onInput: (e) => searchQuery.value = e.target.value,
        class: `
          block w-[180px] lg:w-full rounded-xl border-0 py-2 pl-10 pr-4 
          text-gray-900 ring-1 ring-inset ring-gray-200 
          placeholder:text-gray-400 
          focus:ring-2 focus:ring-inset focus:ring-gray-900
          transition-all duration-200
          bg-white/50 hover:bg-white
          sm:text-sm sm:leading-6
        `
      })
    ]),

    // New Employee Button
    h('button', {
      class: `
        inline-flex items-center gap-2 
        rounded-xl px-4 py-2.5
        text-sm font-semibold text-white
        bg-gray-900 hover:bg-gray-800
        transition duration-200 ease-in-out
        shadow-sm hover:shadow
        focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
      `,
      onClick: () => showNewEmployeeDialog.value = true
    }, [
      h(FeatherIcon, {
        name: 'plus',
        class: 'h-4 w-4'
      }),
      h('span', {
        class: 'hidden sm:inline'
      }, 'Add Employee')
    ])
  ]))
})
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
const selectedPosition = ref('')


const showMonthlyAttendanceDialog = ref(false)
const monthlyAttendanceSearch = ref('')
const selectedMonth = ref(dayjs().month() + 1) 
const currentYear = ref(dayjs().year())

const attendanceButtonLabel = computed(() => {
  const currentDate = getServerDate()
  const todayRecord = findAttendanceRecord(currentDate)
  return todayRecord ? 'Edit Attendance' : 'Setup Attendance'
})

const filteredEmployeeGrid = computed(() => {
  let employees = list.data || []

  // Position Filter
  if (selectedPosition.value) {
    employees = employees.filter(employee => employee.position === selectedPosition.value)
  }

  // Search Filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    employees = employees.filter(employee => 
      employee.employee_name.toLowerCase().includes(query) ||
      employee.name.toLowerCase().includes(query) ||
      employee.position.toLowerCase().includes(query)
    )
  }

  // Optional: Add sorting if needed
  return employees
})

const isCurrentMonth = computed(() => {
  const now = dayjs()
  return selectedMonth.value === now.month() && currentYear.value === now.year()
})

const monthlyAttendance = computed(() => {
  if (!list.data || !attendanceList.data || !leaveResource.data) return []

  const monthStart = dayjs().year(currentYear.value).month(selectedMonth.value - 1).startOf('month')
  const monthEnd = monthStart.endOf('month')

  // Get all attendance records for the selected month
  const monthRecords = attendanceList.data.filter(record => 
    isWithinRange(record.date, monthStart.format('YYYY-MM-DD'), monthEnd.format('YYYY-MM-DD'))
  )

  // Get leave records for the selected month
  const monthLeaves = leaveResource.data.filter(leave => {
    const leaveStart = leave.leave_date
    const leaveEnd = leave.return_date
    
    return (
      isWithinRange(leaveStart, monthStart.format('YYYY-MM-DD'), monthEnd.format('YYYY-MM-DD')) ||
      isWithinRange(leaveEnd, monthStart.format('YYYY-MM-DD'), monthEnd.format('YYYY-MM-DD')) ||
      (dayjs(leaveStart).isBefore(monthStart) && dayjs(leaveEnd).isAfter(monthEnd))
    )
  })

  // Calculate statistics for each employee
  return list.data.map(employee => {
    let presentDays = 0
    let lateDays = 0
    let absentDays = 0
    let totalOvertime = 0
    let leaveDays = 0

    monthRecords.forEach(record => {
      try {
        const attendanceLog = JSON.parse(record.attendance_log || '{}')
        const employeeLog = attendanceLog[employee.name] || {}

        if (employeeLog.absent) absentDays++
        else if (employeeLog.late) lateDays++
        else if (employeeLog.present) presentDays++

        totalOvertime += Number(employeeLog.overtime || 0)
      } catch (error) {
        console.error('Error processing attendance record:', error)
      }
    })

    // Calculate leave days
    monthLeaves.forEach(leave => {
      if (leave.employee === employee.name) {
        const leaveStart = dayjs(leave.leave_date)
        const leaveEnd = dayjs(leave.return_date)
        
        // Adjust start and end to month boundaries
        const start = leaveStart.isBefore(monthStart) ? monthStart : leaveStart
        const end = leaveEnd.isAfter(monthEnd) ? monthEnd : leaveEnd
        
        // Calculate days of leave within the month
        const days = end.diff(start, 'day') + 1
        leaveDays += days
      }
    })

    const totalDays = presentDays + lateDays + absentDays + leaveDays
    const attendanceRate = totalDays 
      ? Math.round(((presentDays + lateDays) / totalDays) * 100) 
      : 0

    return {
      id: employee.name,
      name: employee.employee_name,
      image: employee.image,
      presentDays,
      lateDays,
      absentDays,
      leaveDays,
      totalOvertime,
      attendanceRate
    }
  })
})

const filteredMonthlyAttendance = computed(() => {
	if (!monthlyAttendance.value) return []

	return monthlyAttendance.value.filter((employee) =>
		employee.name.toLowerCase().includes(monthlyAttendanceSearch.value.toLowerCase()),
	)
})


function previousMonth() {
  if (selectedMonth.value === 1) {
    selectedMonth.value = 12
    currentYear.value--
  } else {
    selectedMonth.value--
  }
}

function nextMonth() {
  if (selectedMonth.value === 12) {
    selectedMonth.value = 1
    currentYear.value++
  } else {
    selectedMonth.value++
  }
}

function getAttendanceRateColor(rate) {
	if (rate >= 90) return 'bg-green-500'
	if (rate >= 75) return 'bg-yellow-500'
	return 'bg-red-500'
}

const isReadOnly = computed(() => {
  return getCurrentHour() >= 22
})

const newEmployee = ref({
	employee_name: '',
	date_of_birth: null,
	gender: 'Male',
	nationality: '',
	position: '',
	salary: null,
})

const newFilter = ref({
	field: '',
	operator: '=',
	value: '',
})

function isEmployeeOnLeave(employeeId) {
  if (!leaveResource.data) return false
  return leaveResource.data.some(leave => 
    leave.employee === employeeId && 
    isWithinRange(getServerDate(), leave.leave_date, leave.return_date)
  )
}

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
		newEmployee.value.employee_name
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
	return `${absDays} days ago`
}

function getDaysUntilExpiry(date) {
  if (!date) return Infinity
  return getDaysDifference(date)
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
	if (!list.data || !leaveResource.data) return []

	// Find employees currently on leave
	const currentLeaves = leaveResource.data.filter((leave) => 
  isWithinRange(getServerDate(), leave.leave_date, leave.return_date)
)

	const leaveEmployeeIds = new Set(currentLeaves.map((leave) => leave.employee))

	return list.data.filter(
		(employee) =>
			employee.employee_name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
			!leaveEmployeeIds.has(employee.name),
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
	return attendanceList.data?.find((record) => record.date === formatDate(date, DATE_FORMATS.ISO))
}

async function initializeAttendanceData() {
  if (!list.data?.length || !leaveResource.data) {
    return false
  }

  const today = getServerDate()
  
  attendance.value = {}
  list.data.forEach((employee) => {
    // Check if employee is on leave today
    const isOnLeave = leaveResource.data.some(leave => 
  leave.employee === employee.name && 
  isWithinRange(today, leave.leave_date, leave.return_date)
)

    attendance.value[employee.name] = isOnLeave 
      ? {
          present: false,
          late: false,
          absent: false,
          overtime: 0,
          status: 'leave'
        }
      : {
          present: true,
          late: false,
          absent: false,
          overtime: 0
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

		const currentDate = getServerDate()

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

	const currentDate = getServerDate()
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
