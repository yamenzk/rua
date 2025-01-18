<template>
	<div class="space-y-6 p-4">
		<!-- View Toggle -->
		<div class="flex justify-end space-x-2">
			<button
				v-for="view in ['List', 'Calendar']"
				:key="view"
				@click="currentView = view"
				class="px-3 py-1.5 text-sm font-medium rounded-md"
				:class="
					currentView === view
						? 'bg-gray-200 text-gray-900'
						: 'text-gray-600 hover:bg-gray-100'
				"
			>
      <FeatherIcon v-if="view === 'List'" name="list" class="w-4 h-4 mr-1" />
      <FeatherIcon v-else name="calendar" class="w-4 h-4 mr-1" />
			</button>
		</div>

		<!-- Statistics Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<!-- Attendance Rate -->
			<div class="border rounded-lg bg-white">
				<div class="px-5 py-4">
					<div class="flex items-center justify-between">
						<div class="text-base text-gray-600">Attendance Rate</div>
						<FeatherIcon name="check-circle" class="w-5 h-5 text-green-500" />
					</div>
					<div class="mt-2">
						<div class="flex items-baseline">
							<div class="text-3xl font-semibold">
								{{ overallStats.attendanceRate }}%
							</div>
						</div>
					</div>
				</div>
				<div class="px-5 py-3 bg-gray-50 text-sm text-gray-600">
					<div class="flex justify-between items-center">
						<span>Overall Average</span>
						<Badge
							:theme="
								overallStats.attendanceRate > 90
									? 'green'
									: overallStats.attendanceRate > 75
										? 'orange'
										: 'red'
							"
							variant="subtle"
						>
							{{
								overallStats.attendanceRate > 90
									? 'Excellent'
									: overallStats.attendanceRate > 75
										? 'Good'
										: 'Poor'
							}}
						</Badge>
					</div>
				</div>
			</div>

			<!-- Late Days -->
			<div class="border rounded-lg bg-white">
				<div class="px-5 py-4">
					<div class="flex items-center justify-between">
						<div class="text-base text-gray-600">Late Days</div>
						<FeatherIcon name="clock" class="w-5 h-5 text-yellow-500" />
					</div>
					<div class="mt-2">
						<div class="flex items-baseline">
							<div class="text-3xl font-semibold">{{ overallStats.lateDays }}</div>
							<div class="ml-2 text-sm text-gray-600">days</div>
						</div>
					</div>
				</div>
				<div class="px-5 py-3 bg-gray-50 text-sm text-gray-600">
					<div class="flex justify-between items-center">
						<span>Total Count</span>
						<Badge
							:theme="
								overallStats.lateDays < 5
									? 'green'
									: overallStats.lateDays < 10
										? 'orange'
										: 'red'
							"
							variant="subtle"
						>
							{{
								overallStats.lateDays < 5
									? 'Good'
									: overallStats.lateDays < 10
										? 'Warning'
										: 'High'
							}}
						</Badge>
					</div>
				</div>
			</div>

			<!-- Absent Days -->
			<div class="border rounded-lg bg-white">
				<div class="px-5 py-4">
					<div class="flex items-center justify-between">
						<div class="text-base text-gray-600">Absent Days</div>
						<FeatherIcon name="x-circle" class="w-5 h-5 text-red-500" />
					</div>
					<div class="mt-2">
						<div class="flex items-baseline">
							<div class="text-3xl font-semibold">{{ overallStats.absentDays }}</div>
							<div class="ml-2 text-sm text-gray-600">days</div>
						</div>
					</div>
				</div>
				<div class="px-5 py-3 bg-gray-50 text-sm text-gray-600">
					<div class="flex justify-between items-center">
						<span>Total Count</span>
						<Badge
							:theme="
								overallStats.absentDays < 3
									? 'green'
									: overallStats.absentDays < 7
										? 'orange'
										: 'red'
							"
							variant="subtle"
						>
							{{
								overallStats.absentDays < 3
									? 'Good'
									: overallStats.absentDays < 7
										? 'Warning'
										: 'High'
							}}
						</Badge>
					</div>
				</div>
			</div>

			<!-- Total Overtime -->
			<div class="border rounded-lg bg-white">
				<div class="px-5 py-4">
					<div class="flex items-center justify-between">
						<div class="text-base text-gray-600">Total Overtime</div>
						<FeatherIcon name="clock" class="w-5 h-5 text-blue-500" />
					</div>
					<div class="mt-2">
						<div class="flex items-baseline">
							<div class="text-3xl font-semibold">
								{{ Number(overallStats.totalOvertime).toString() }}
							</div>
							<div class="ml-2 text-sm text-gray-600">hours</div>
						</div>
					</div>
				</div>
				<div class="px-5 py-3 bg-gray-50 text-sm text-gray-600">
					<div class="flex justify-between items-center">
						<span>Total Hours</span>
						<Badge theme="blue" variant="subtle">
							{{ overallStats.totalOvertime > 0 ? 'Extra Time' : 'No Overtime' }}
						</Badge>
					</div>
				</div>
			</div>
		</div>

		<!-- Calendar View -->
		<div
			v-if="currentView === 'Calendar'"
			class="bg-white rounded-lg border min-h-[600px] p-6"
		>
			<Calendar
				:config="{
					defaultMode: 'Month',
					isEditMode: false,
					disableModes: ['Week', 'Day'],
					allowCustomClickEvents: true,
					redundantCellHeight: 100,
					enableShortcuts: false,
          showIcon: false,

				}"
				:events="calendarEvents"
				@eventClick="handleEventClick"
			/>
		</div>

		<!-- List View -->
		<div v-else class="bg-white rounded-lg border">
			<div class="flex items-center justify-between mt-6 mb-4 px-6">
				<h2 class="text-lg font-medium text-gray-900">Attendance Records</h2>
			</div>

			<div class="overflow-x-auto">
				<!-- Table Header -->
				<div class="border-b min-w-[800px]">
					<div class="flex items-center px-6 py-2">
						<div class="flex-1 grid grid-cols-3 gap-4">
							<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
								<FeatherIcon name="calendar" class="w-4 h-4" />
								Date
							</div>
							<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
								<FeatherIcon name="check" class="w-4 h-4" />
								Status
							</div>
							<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
								<FeatherIcon name="clock" class="w-4 h-4" />
								Overtime
							</div>
						</div>
					</div>
				</div>

				<!-- Table Body -->
				<div class="divide-y">
					<template
						v-for="year in Object.keys(groupedAttendance).sort((a, b) => b - a)"
						:key="year"
					>
						<!-- Year Group Header -->
						<div
							class="group bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer px-6 py-2 min-w-[800px]"
							@click="toggleYearCollapse(year)"
						>
							<div class="flex items-center gap-2">
								<FeatherIcon
									:name="yearCollapsed[year] ? 'chevron-right' : 'chevron-down'"
									class="w-4 h-4 text-gray-500"
								/>
								<span class="font-medium">{{ year }}</span>
								<span class="text-sm text-gray-600">
									({{ yearStats[year].attendanceRate }}% attendance rate)
								</span>
							</div>
						</div>

						<!-- Months within the year -->
						<template v-if="!yearCollapsed[year]">
							<template
								v-for="month in Object.keys(groupedAttendance[year]).sort(
									(a, b) => b - a,
								)"
								:key="`${year}-${month}`"
							>
								<!-- Month Group Header with Progress Bar -->
								<div class="bg-gray-50 px-6 py-3 pl-12 min-w-[800px]">
									<div class="flex flex-col gap-2">
										<div
											class="flex items-center gap-2 cursor-pointer"
											@click="toggleMonthCollapse(year, month)"
										>
											<FeatherIcon
												:name="
													monthCollapsed[`${year}-${month}`]
														? 'chevron-right'
														: 'chevron-down'
												"
												class="w-4 h-4 text-gray-500"
											/>
											<span class="font-medium">{{
												getMonthName(month)
											}}</span>
											<div class="flex gap-4 text-sm text-gray-600">
												<span
													>Present:
													{{
														monthStats[`${year}-${month}`].presentDays
													}}</span
												>
												<span
													>Late:
													{{
														monthStats[`${year}-${month}`].lateDays
													}}</span
												>
												<span
													>Absent:
													{{
														monthStats[`${year}-${month}`].absentDays
													}}</span
												>
												<span
													>Overtime:
													{{
														Number(
															monthStats[`${year}-${month}`]
																.totalOvertime,
														).toString()
													}}h</span
												>
											</div>
										</div>
										<!-- Progress Bar -->
										<div class="w-full bg-gray-200 rounded-full h-2">
											<div
												class="bg-green-500 h-2 rounded-full"
												:style="{
													width: `${monthStats[`${year}-${month}`].attendanceRate}%`,
												}"
											></div>
										</div>
									</div>
								</div>

								<!-- Days within the month -->
								<template v-if="!monthCollapsed[`${year}-${month}`]">
									<div
										v-for="record in groupedAttendance[year][month].sort(
											(a, b) => new Date(b.date) - new Date(a.date),
										)"
										:key="record.date"
										class="hover:bg-gray-50 transition-colors min-w-[800px] pl-16"
									>
										<div class="flex items-center px-6 py-3">
											<div class="flex-1 grid grid-cols-3 gap-4">
												<!-- Date -->
												<div class="text-sm text-gray-900">
													{{ formatAttendanceDate(record.date) }}
												</div>
												<!-- Status -->
												<div class="flex items-center">
													<div class="flex items-center gap-2">
														<span
															class="w-2.5 h-2.5 rounded-full"
															:class="{
																'bg-green-500':
																	record.status === 'present',
																'bg-yellow-400':
																	record.status === 'late',
																'bg-red-500':
																	record.status === 'absent',
															}"
														></span>
														<span class="text-sm capitalize">{{
															record.status
														}}</span>
													</div>
												</div>
												<!-- Overtime -->
												<div class="text-sm text-gray-900">
													{{
														record.overtime > 0
															? `${Number(record.overtime).toString()}h`
															: '-'
													}}
												</div>
											</div>
										</div>
									</div>
								</template>
							</template>
						</template>
					</template>

					<!-- Empty State -->
					<div
						v-if="!attendanceList?.data?.length"
						class="flex flex-col items-center justify-center py-12 min-w-[800px]"
					>
						<FeatherIcon name="calendar" class="w-12 h-12 text-gray-400 mb-4" />
						<p class="text-base font-medium text-gray-900">No Attendance Records</p>
						<p class="text-sm text-gray-600">
							There are no attendance records for this employee yet.
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Event Details Modal -->
		<Dialog
  :open="showEventDetails"
  @close="showEventDetails = false"
  class="relative z-50"
>
  <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
  <div class="fixed inset-0 flex items-center justify-center p-4">
    <DialogPanel class="w-full max-w-sm rounded bg-white p-4">
      <div class="space-y-4">
        <h3 class="text-lg font-medium">Attendance Details</h3>
        
        <div v-if="selectedEvent">
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Date:</span>
              <span class="font-medium">{{ formatAttendanceDate(selectedEvent.fromDate) }}</span>
            </div>
            
            <template v-if="selectedEvent.type === 'attendance'">
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span 
                  class="font-medium capitalize"
                  :class="{
                    'text-green-600': selectedEvent.status === 'present',
                    'text-yellow-600': selectedEvent.status === 'late',
                    'text-red-600': selectedEvent.status === 'absent'
                  }"
                >
                  {{ selectedEvent.status }}
                </span>
              </div>
            </template>
            
            <template v-else-if="selectedEvent.type === 'overtime'">
              <div class="flex justify-between">
                <span class="text-gray-600">Type:</span>
                <span class="font-medium text-purple-600">Overtime Hours</span>
              </div>
            </template>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            @click="showEventDetails = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </DialogPanel>
  </div>
</Dialog>

	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Calendar, FeatherIcon, Badge } from 'frappe-ui'
import { Dialog, DialogPanel } from '@headlessui/vue'
import { attendanceResource } from '@/data/attendance'
import { formatAttendanceDate, getMonthName } from '@/utils/format'

const props = defineProps({
	employee: {
		type: Object,
		required: true,
	},
})

// View state
const currentView = ref('List')
const yearCollapsed = ref({})
const monthCollapsed = ref({})
const showEventDetails = ref(false)
const selectedEvent = ref(null)
const attendanceList = attendanceResource

// Process attendance records
const processedRecords = computed(() => {
	if (!attendanceResource.data?.length || !props.employee?.name) return []

	return attendanceResource.data.map((record) => {
		try {
			const attendanceLog = JSON.parse(record.attendance_log || '{}')
			const employeeLog = attendanceLog[props.employee.name] || {}

			return {
				date: record.date,
				status: employeeLog.absent ? 'absent' : employeeLog.late ? 'late' : 'present',
				overtime: employeeLog.overtime || 0,
			}
		} catch (error) {
			console.error('Error processing attendance record:', error)
			return {
				date: record.date,
				status: 'present',
				overtime: 0,
			}
		}
	})
})

// Transform attendance records to calendar events
const calendarEvents = computed(() => {
  return processedRecords.value.flatMap(record => {
    const colorMap = {
      present: 'green',
      late: 'amber',
      absent: 'red'
    }

    // Create base attendance event
    const attendanceEvent = {
      id: `attendance-${record.date}`,
      title: ' ',
      fromDate: `${record.date} 00:00:00`,
      toDate: `${record.date} 23:59:59`,
      color: colorMap[record.status],
      isFullDay: true,
      type: 'attendance',
      status: record.status,
    }

    // Create overtime event if there is overtime
    const events = [attendanceEvent]
    if (record.overtime > 0) {
      events.push({
        id: `overtime-${record.date}`,
        title: `+${record.overtime}h OT`,
        fromDate: `${record.date} 00:00:00`,
        toDate: `${record.date} 23:59:59`,
        isFullDay: true,
        color: 'purple',
        isFullDay: true,
        type: 'overtime'
      })
    }

    return events
  }).flat()
})

// Group records by year and month
const groupedAttendance = computed(() => {
	return processedRecords.value.reduce((acc, record) => {
		const date = new Date(record.date)
		const year = date.getFullYear()
		const month = date.getMonth() + 1

		if (!acc[year]) acc[year] = {}
		if (!acc[year][month]) acc[year][month] = []

		acc[year][month].push(record)
		return acc
	}, {})
})

const yearStats = computed(() => {
	const stats = {}

	Object.entries(groupedAttendance.value).forEach(([year, months]) => {
		let totalDays = 0
		let presentDays = 0

		Object.values(months).forEach((records) => {
			records.forEach((record) => {
				totalDays++
				if (record.status === 'present') presentDays++
			})
		})

		stats[year] = {
			attendanceRate: Math.round((presentDays / totalDays) * 100),
		}
	})

	return stats
})

const monthStats = computed(() => {
	const stats = {}

	Object.entries(groupedAttendance.value).forEach(([year, months]) => {
		Object.entries(months).forEach(([month, records]) => {
			const key = `${year}-${month}`
			const presentDays = records.filter((r) => r.status === 'present').length
			const lateDays = records.filter((r) => r.status === 'late').length
			const absentDays = records.filter((r) => r.status === 'absent').length
			const totalOvertime = records.reduce((sum, r) => sum + (r.overtime || 0), 0)

			stats[key] = {
				presentDays,
				lateDays,
				absentDays,
				totalOvertime,
				attendanceRate: Math.round((presentDays / records.length) * 100),
			}
		})
	})

	return stats
})

const overallStats = computed(() => {
	const allRecords = processedRecords.value
	const presentDays = allRecords.filter((r) => r.status === 'present').length
	const lateDays = allRecords.filter((r) => r.status === 'late').length
	const absentDays = allRecords.filter((r) => r.status === 'absent').length
	const totalOvertime = allRecords.reduce((sum, r) => sum + (r.overtime || 0), 0)

	return {
		attendanceRate: Math.round((presentDays / allRecords.length) * 100),
		lateDays,
		absentDays,
		totalOvertime,
	}
})

// Methods
function toggleYearCollapse(year) {
	yearCollapsed.value[year] = !yearCollapsed.value[year]
}

function toggleMonthCollapse(year, month) {
	const key = `${year}-${month}`
	monthCollapsed.value[key] = !monthCollapsed.value[key]
}

function handleEventClick(event) {
	selectedEvent.value = event
	showEventDetails.value = true
}

// Initialize
onMounted(async () => {
	if (!attendanceResource.data?.length) {
		try {
			await attendanceResource.reload()
		} catch (error) {
			console.error('Failed to load attendance data:', error)
		}
	}
})
</script>
