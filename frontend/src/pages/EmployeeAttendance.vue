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
		<div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

			<!-- Leave Setup Button -->
			<div class="border rounded-lg bg-white flex items-center justify-center">
    <div 
      v-if="currentOngoingLeave"
      class="w-full h-full py-6 flex flex-col items-center justify-center bg-blue-50 text-center cursor-pointer"
      @click="showEarlyReturnDialog = true"
    >
      <FeatherIcon name="calendar" class="w-6 h-6 text-blue-500 mb-2" />
      <span class="text-sm text-blue-600 font-medium">Currently on Leave</span>
      <span class="text-xs text-gray-600 mt-1">
        Return Expected: {{ formatDate(currentOngoingLeave.return_date) }}
      </span>
    </div>
    <button 
      v-else
      @click="showLeaveSetupDialog = true"
      class="w-full h-full py-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
    >
      <FeatherIcon name="calendar" class="w-6 h-6 text-blue-500 mb-2" />
      <span class="text-sm text-gray-600">Setup Leave</span>
    </button>
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
													>Leave:
													{{
														monthStats[`${year}-${month}`].leaveDays
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
            (a, b) => dayjs(b.date).diff(dayjs(a.date))
        )"
        :key="record.date"
        class="hover:bg-gray-50 transition-colors min-w-[800px] pl-16"
    >
        <div class="flex items-center px-6 py-3">
            <div class="flex-1 grid grid-cols-3 gap-4">
                <!-- Date -->
                <div class="text-sm text-gray-900">
                    {{ formatDate(record.date, DATE_FORMATS.ATTENDANCE) }}
                </div>
                <!-- Status -->
                <div class="flex items-center">
                    <div class="flex items-center gap-2">
                        <span
                            class="w-2.5 h-2.5 rounded-full"
                            :class="{
                                'bg-green-500': record.status === 'present',
                                'bg-blue-500': record.status === 'leave',
                                'bg-yellow-400': record.status === 'late',
                                'bg-red-500': record.status === 'absent',
                            }"
                        ></span>
                        <span class="text-sm capitalize">{{ record.status }}</span>
                    </div>
                </div>
                <!-- Overtime -->
                <div class="text-sm text-gray-900">
                    {{ record.overtime > 0 ? `${formatNumber(record.overtime)}h` : '-' }}
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



 <!-- Leave Setup Dialog -->
 <Dialog
  :modelValue="showLeaveSetupDialog"
  @update:modelValue="showLeaveSetupDialog = $event"
  :options="{
    title: 'Setup Employee Leave',
    size: 'sm',
    icon: {
      name: 'calendar',
      appearance: 'primary'
    },
    actions: [
      {
        label: 'Save Leave',
        variant: 'solid',
        onClick: () => saveLeave()
      }
    ]
  }"
>
    <template #body-content>
      <div class="space-y-4">
        <!-- Last Leave Information -->
        <div 
          v-if="lastLeave"
          class="bg-gray-50 rounded-lg p-4 text-sm"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium text-gray-700">Last Leave</span>
            <span class="text-xs text-gray-500">
              {{ formatLeaveDuration(lastLeave.leave_date, lastLeave.return_date) }}
            </span>
          </div>
          <div class="text-gray-600">
            <div>From: {{ formatDate(lastLeave.leave_date) }}</div>
            <div>To: {{ formatDate(lastLeave.return_date) }}</div>
          </div>
        </div>

        <FormControl
          type="date"
          label="Leave Start Date"
          v-model="newLeave.leave_date"
          required
          :min="getMinLeaveDate()"
        />
        <FormControl
          type="date"
          label="Return Date"
          v-model="newLeave.return_date"
          required
          :min="newLeave.leave_date || getMinLeaveDate()"
        />
      </div>
    </template>
  </Dialog>

   <!-- Early Return Dialog -->
   <Dialog
  :modelValue="showEarlyReturnDialog"
  @update:modelValue="showEarlyReturnDialog = $event"
  :options="{
    title: 'Early Return Confirmation',
    size: 'sm',
    icon: {
      name: 'check-circle',
      appearance: 'primary'
    },
    actions: [
      {
        label: 'Confirm Early Return',
        variant: 'solid',
        onClick: () => confirmEarlyReturn()
      }
    ]
  }"
>
    <template #body-content>
      <div class="space-y-4">
        <div class="bg-blue-50 rounded-lg p-4 text-sm">
          <div class="flex items-center gap-3 mb-2">
            <FeatherIcon name="info" class="w-5 h-5 text-blue-500" />
            <span class="font-medium text-blue-800">Early Return Confirmation</span>
          </div>
          <p class="text-blue-700">
            The employee is currently on leave until {{ formatDate(currentOngoingLeave.return_date) }}.
          </p>
        </div>

        <FormControl
          type="text"
          label="Confirm Today's Date"
          v-model="earlyReturnConfirmation"
          :placeholder="todayFormatted"
          required
        />
        <div class="text-xs text-gray-500">
          Please type today's date: {{ todayFormatted }}
        </div>
      </div>
    </template>
  </Dialog>

	</div>
</template>

<script setup>
const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
})

import { ref, computed, onMounted } from 'vue'
import { leaveResource } from '@/data/leave'
import { Calendar, FeatherIcon, Badge, Dialog, FormControl, dayjs } from 'frappe-ui'
import { attendanceResource } from '@/data/attendance'

import { 
  getServerDate, 
  isBeforeToday, 
  isAfterToday, 
  formatDate, 
  formatDateDuration,
  formatNumber,
  isWithinRange,
  addDays, 
  DATE_FORMATS,
  getMonthName 
} from '@/utils/format'

// View state
const currentView = ref('List')
const yearCollapsed = ref({})
const monthCollapsed = ref({})
const showEventDetails = ref(false)
const showEarlyReturnDialog = ref(false)
const earlyReturnConfirmation = ref('')
const selectedEvent = ref(null)
const showLeaveSetupDialog = ref(false)
const newLeave = ref({
  leave_date: '',
  return_date: '',
})
const attendanceList = attendanceResource

const currentOngoingLeave = computed(() => {
  const today = getServerDate() // Using our utility
  return leaveResource.data?.find(leave => 
    leave.employee === props.employee.name &&
    !isBeforeToday(leave.leave_date) && // Using date comparison utility
    !isAfterToday(leave.return_date)    // Using date comparison utility
  )
})


const todayFormatted = computed(() => {
  return getServerDate() // Direct replacement using our utility
})

function getMinLeaveDate() {
  // If there's a last leave, suggest the day after the last leave
  if (lastLeave.value) {
    return addDays(lastLeave.value.return_date, 1) // Using our date manipulation utility
  }
  
  // Otherwise, use today's date
  return getServerDate()
}

const lastLeave = computed(() => {
  if (!leaveResource.data?.length) return null

  // Filter leaves for this employee and sort by return date in descending order
  const employeeLeaves = leaveResource.data
    .filter(leave => leave.employee === props.employee.name)
    .sort((a, b) => {
      // Using dayjs for consistent date comparison
      return dayjs(b.return_date).diff(dayjs(a.return_date))
    })

  // Return the most recent leave (excluding current ongoing leave)
  return employeeLeaves[0]
})

// Process attendance records
const processedRecords = computed(() => {
  const records = []

  // Existing attendance record processing
  attendanceResource.data?.forEach((record) => {
    try {
      const attendanceLog = JSON.parse(record.attendance_log || '{}')
      const employeeLog = attendanceLog[props.employee.name] || {}

      records.push({
        date: record.date,
        status: employeeLog.absent ? 'absent' : 
                employeeLog.late ? 'late' : 
                isOnLeave(record.date) ? 'leave' : 
                'present',
        overtime: employeeLog.overtime || 0,
      })
    } catch (error) {
      console.error('Error processing attendance record:', error)
    }
  })

  return records
})

// Transform attendance records to calendar events
const calendarEvents = computed(() => {
  const events = processedRecords.value.flatMap(record => {
    const colorMap = {
      present: 'green',
      late: 'amber',
      absent: 'red',
      leave: 'blue'
    }

    // Existing attendance event creation
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

    const events = [attendanceEvent]

    // Overtime event
    if (record.overtime > 0) {
      events.push({
        id: `overtime-${record.date}`,
        title: `+${record.overtime}h OT`,
        fromDate: `${record.date} 00:00:00`,
        toDate: `${record.date} 23:59:59`,
        isFullDay: true,
        color: 'purple',
        type: 'overtime'
      })
    }

    return events
  }).flat()

  // Add leave events with individual daily events
  leaveResource.data?.forEach(leave => {
  if (leave.employee === props.employee.name) {
    let startDate = leave.leave_date
    const endDate = leave.return_date

    // Create an event for each day of the leave period
    while (dayjs(startDate).isSameOrBefore(endDate)) {
      events.push({
        id: `leave-${leave.name}-${startDate}`,
        title: 'On Leave',
        fromDate: `${startDate} 00:00:00`,
        toDate: `${startDate} 23:59:59`,
        color: 'blue',
        isFullDay: true,
        type: 'leave'
      })

      // Move to the next day using addDays utility
      startDate = addDays(startDate, 1)
    }
  }
})

  return events
})

async function confirmEarlyReturn() {
  // Validate input matches today's date
  if (earlyReturnConfirmation.value.trim() !== todayFormatted.value) {
    // Optional: Add a toast or error message
    return
  }

  try {
    // Update the leave record to end today
    await leaveResource.setValue.submit({
      name: currentOngoingLeave.value.name,
      return_date: todayFormatted.value
    })

    // Reload leave resources
    await leaveResource.reload()

    // Reset dialog state
    showEarlyReturnDialog.value = false
    earlyReturnConfirmation.value = ''

    // Optional: Add a success toast/notification
  } catch (error) {
    console.error('Error updating leave return date:', error)
    // Optional: Add an error toast/notification
  }
}

function isOnLeave(date) {
  return leaveResource.data?.some(leave => 
    leave.employee === props.employee.name && 
    isWithinRange(date, leave.leave_date, leave.return_date)
  )
}

// Method to save leave
async function saveLeave() {
  try {
    await leaveResource.insert.submit({
      employee: props.employee.name,
      leave_date: newLeave.value.leave_date,
      return_date: newLeave.value.return_date
    })
    
    // Reset dialog and reload leaves
    showLeaveSetupDialog.value = false
    newLeave.value = { leave_date: '', return_date: '' }
    await leaveResource.reload()
  } catch (error) {
    console.error('Error saving leave:', error)
  }
}

// Group records by year and month
const groupedAttendance = computed(() => {
  return processedRecords.value.reduce((acc, record) => {
    const date = dayjs(record.date)
    const year = date.year()
    const month = date.month() + 1

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
			const leaveDays = records.filter((r) => r.status === 'leave').length
			const totalOvertime = records.reduce((sum, r) => sum + (r.overtime || 0), 0)

			stats[key] = {
				presentDays,
				lateDays,
				absentDays,
				leaveDays,
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


function formatLeaveDuration(startDate, endDate) {
  return formatDateDuration(startDate, endDate)
}

// Initialize
onMounted(async () => {
  // Existing attendance resource loading
  if (!attendanceResource.data?.length) {
    try {
      await attendanceResource.reload()
    } catch (error) {
      console.error('Failed to load attendance data:', error)
    }
  }

  // Load leaves
  if (!leaveResource.data?.length) {
    try {
      await leaveResource.get.fetch({
        filters: [['employee', '=', props.employee.name]]
      })
    } catch (error) {
      console.error('Failed to load leave data:', error)
    }
  }
})
</script>
