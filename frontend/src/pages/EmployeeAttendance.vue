<template>
  <div class="space-y-6 p-4">
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
              <div class="text-3xl font-semibold">{{ overallStats.attendanceRate }}%</div>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-gray-50 text-sm text-gray-600">
          <div class="flex justify-between items-center">
            <span>Overall Average</span>
            <Badge
              :theme="overallStats.attendanceRate > 90 ? 'green' : (overallStats.attendanceRate > 75 ? 'orange' : 'red')"
              variant="subtle"
            >
              {{ overallStats.attendanceRate > 90 ? 'Excellent' : (overallStats.attendanceRate > 75 ? 'Good' : 'Poor') }}
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
              :theme="overallStats.lateDays < 5 ? 'green' : (overallStats.lateDays < 10 ? 'orange' : 'red')"
              variant="subtle"
            >
              {{ overallStats.lateDays < 5 ? 'Good' : (overallStats.lateDays < 10 ? 'Warning' : 'High') }}
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
              :theme="overallStats.absentDays < 3 ? 'green' : (overallStats.absentDays < 7 ? 'orange' : 'red')"
              variant="subtle"
            >
              {{ overallStats.absentDays < 3 ? 'Good' : (overallStats.absentDays < 7 ? 'Warning' : 'High') }}
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
              <div class="text-3xl font-semibold">{{ Number(overallStats.totalOvertime).toString() }}</div>
              <div class="ml-2 text-sm text-gray-600">hours</div>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-gray-50 text-sm text-gray-600">
          <div class="flex justify-between items-center">
            <span>Total Hours</span>
            <Badge
              theme="blue"
              variant="subtle"
            >
              {{ overallStats.totalOvertime > 0 ? 'Extra Time' : 'No Overtime' }}
            </Badge>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Records Table -->
    <div class="bg-white rounded-lg border">
      <div class="flex items-center justify-between mt-6 mb-4 px-6">
        <h2 class="text-lg font-medium text-gray-900">Attendance Records</h2>
      </div>

      <div class="overflow-x-auto">
        <!-- Table Header -->
        <div class="border-b min-w-[800px]">
          <div class="flex items-center px-6 py-2">
            <div class="flex-1 grid grid-cols-5 gap-4">
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
              <div class="col-span-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FeatherIcon name="bar-chart-2" class="w-4 h-4" />
                Month Statistics
              </div>
            </div>
          </div>
        </div>

        <!-- Table Body -->
        <div class="divide-y">
          <template v-for="year in Object.keys(groupedAttendance).sort((a, b) => b - a)" :key="year">
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
              <template v-for="month in Object.keys(groupedAttendance[year]).sort((a, b) => b - a)" :key="`${year}-${month}`">
                <!-- Month Group Header -->
                <div 
                  class="group bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer px-6 py-2 pl-12 min-w-[800px]"
                  @click="toggleMonthCollapse(year, month)"
                >
                  <div class="flex items-center gap-2">
                    <FeatherIcon 
                      :name="monthCollapsed[`${year}-${month}`] ? 'chevron-right' : 'chevron-down'" 
                      class="w-4 h-4 text-gray-500"
                    />
                    <span class="font-medium">{{ getMonthName(month) }}</span>
                    <div class="flex gap-4 text-sm text-gray-600">
                      <span>Present: {{ monthStats[`${year}-${month}`].presentDays }}</span>
                      <span>Late: {{ monthStats[`${year}-${month}`].lateDays }}</span>
                      <span>Absent: {{ monthStats[`${year}-${month}`].absentDays }}</span>
                      <span>Overtime: {{ Number(monthStats[`${year}-${month}`].totalOvertime).toString() }}h</span>
                    </div>
                  </div>
                </div>

                <!-- Days within the month -->
                <template v-if="!monthCollapsed[`${year}-${month}`]">
                  <div 
                    v-for="record in groupedAttendance[year][month]" 
                    :key="record.date"
                    class="hover:bg-gray-50 transition-colors min-w-[800px] pl-16"
                  >
                    <div class="flex items-center px-6 py-3">
                      <div class="flex-1 grid grid-cols-5 gap-4">
                        <!-- Date -->
                        <div class="text-sm text-gray-900">
                          {{ formatDate(record.date) }}
                        </div>
                        <!-- Status -->
                        <div class="flex items-center">
                          <div class="flex items-center gap-2">
                            <span 
                              class="w-2.5 h-2.5 rounded-full"
                              :class="{
                                'bg-green-500': record.status === 'present',
                                'bg-yellow-400': record.status === 'late',
                                'bg-red-500': record.status === 'absent'
                              }"
                            ></span>
                            <span class="text-sm capitalize">{{ record.status }}</span>
                          </div>
                        </div>
                        <!-- Overtime -->
                        <div class="text-sm text-gray-900">
                          {{ record.overtime > 0 ? `${Number(record.overtime).toString()}h` : '-' }}
                        </div>
                        <!-- Month Progress (only show in first record of the month) -->
                        <div v-if="record === groupedAttendance[year][month][0]" class="col-span-2">
                          <div class="w-full bg-gray-200 rounded-full h-2">
                            <div
                              class="bg-green-500 h-2 rounded-full"
                              :style="{
                                width: `${monthStats[`${year}-${month}`].attendanceRate}%`
                              }"
                            ></div>
                          </div>
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
            <FeatherIcon 
              name="calendar" 
              class="w-12 h-12 text-gray-400 mb-4" 
            />
            <p class="text-base font-medium text-gray-900">No Attendance Records</p>
            <p class="text-sm text-gray-600">There are no attendance records for this employee yet.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { FeatherIcon, createListResource } from 'frappe-ui'

const props = defineProps({
  employee: {
    type: Object,
    default: null
  },
  employeeResource: {
    type: Object,
    required: true
  }
})

// State
const yearCollapsed = ref({})
const monthCollapsed = ref({})
const attendanceList = createListResource({
  doctype: 'RUA Attendance',
  fields: ['name', 'date', 'attendance_log'],
  orderBy: 'date desc',
  auto: true
})

// Process attendance records
const processedRecords = computed(() => {
  if (!attendanceList.data || !props.employee?.name) return []
  
  return attendanceList.data.map(record => {
    const attendanceLog = JSON.parse(record.attendance_log || '{}')
    const employeeLog = attendanceLog[props.employee.name] || {}
    
    return {
      date: record.date,
      status: employeeLog.absent ? 'absent' : (employeeLog.late ? 'late' : 'present'),
      overtime: employeeLog.overtime || 0
    }
  })
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

// Calculate statistics
const yearStats = computed(() => {
  const stats = {}
  
  Object.entries(groupedAttendance.value).forEach(([year, months]) => {
    let totalDays = 0
    let presentDays = 0
    
    Object.values(months).forEach(records => {
      records.forEach(record => {
        totalDays++
        if (record.status === 'present') presentDays++
      })
    })
    
    stats[year] = {
      attendanceRate: Math.round((presentDays / totalDays) * 100)
    }
  })
  
  return stats
})

const monthStats = computed(() => {
  const stats = {}
  
  Object.entries(groupedAttendance.value).forEach(([year, months]) => {
    Object.entries(months).forEach(([month, records]) => {
      const key = `${year}-${month}`
      const presentDays = records.filter(r => r.status === 'present').length
      const lateDays = records.filter(r => r.status === 'late').length
      const absentDays = records.filter(r => r.status === 'absent').length
      const totalOvertime = records.reduce((sum, r) => sum + (r.overtime || 0), 0)
      
      stats[key] = {
        presentDays,
        lateDays,
        absentDays,
        totalOvertime,
        attendanceRate: Math.round((presentDays / records.length) * 100)
      }
    })
  })
  
  return stats
})

const overallStats = computed(() => {
  const allRecords = processedRecords.value
  const presentDays = allRecords.filter(r => r.status === 'present').length
  const lateDays = allRecords.filter(r => r.status === 'late').length
  const absentDays = allRecords.filter(r => r.status === 'absent').length
  const totalOvertime = allRecords.reduce((sum, r) => sum + (r.overtime || 0), 0)
  
  return {
    attendanceRate: Math.round((presentDays / allRecords.length) * 100),
    lateDays,
    absentDays,
    totalOvertime
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

function getMonthName(month) {
  return new Date(2000, month - 1).toLocaleString('default', { month: 'long' })
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Initialize
onMounted(async () => {
  await attendanceList.reload()
})
</script>