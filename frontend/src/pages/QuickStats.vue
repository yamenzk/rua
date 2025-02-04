<template>
  <div class="grid gap-4 md:grid-cols-2">
    <!-- Active Projects -->
    <div class="rounded-lg bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Active Projects</p>
          <div class="flex items-baseline gap-2">
            <h3 class="text-2xl font-medium text-gray-900">{{ activeProjects.length }}</h3>
            <div 
              class="flex items-center gap-1 text-xs"
              :class="projectTrend.trend >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              <FeatherIcon 
                :name="projectTrend.trend >= 0 ? 'trending-up' : 'trending-down'" 
                class="h-3 w-3"
              />
              {{ Math.abs(projectTrend.trend) }}%
            </div>
          </div>
        </div>
        <div class="rounded-md bg-gray-50 p-2 text-gray-400">
          <FeatherIcon name="briefcase" class="h-5 w-5" />
        </div>
      </div>
    </div>

    <!-- Outstanding Amount -->
    <div 
      class="rounded-lg bg-white p-5 shadow-sm"
      :class="{ 'cursor-pointer hover:bg-gray-50': outstandingAmount > 0 }"
      @click="outstandingAmount > 0 && (showOutstandingInvoicesDialog = true)"
    >
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Outstanding Amount</p>
          <div class="space-y-1">
            <h3 class="text-2xl font-medium text-gray-900">{{ formatCurrency(outstandingAmount) }}</h3>
            <p class="text-xs text-gray-500">
              {{ unpaidInvoices.length 
                ? `${unpaidInvoices.length} unpaid invoices`
                : 'No unpaid invoices'
              }}
            </p>
          </div>
        </div>
        <div class="rounded-md bg-gray-50 p-2 text-gray-400">
          <FeatherIcon name="dollar-sign" class="h-5 w-5" />
        </div>
      </div>
    </div>

    <!-- This Month's Revenue -->
    <div class="rounded-lg bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-sm text-gray-500">This Month's Revenue</p>
          <div class="flex items-baseline gap-2">
            <h3 class="text-2xl font-medium text-gray-900">{{ formatCurrency(monthlyRevenue.current) }}</h3>
            <div 
              class="flex items-center gap-1 text-xs"
              :class="monthlyRevenue.trend >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              <FeatherIcon 
                :name="monthlyRevenue.trend >= 0 ? 'trending-up' : 'trending-down'" 
                class="h-3 w-3"
              />
              {{ Math.abs(monthlyRevenue.trend) }}%
            </div>
          </div>
        </div>
        <div class="rounded-md bg-gray-50 p-2 text-gray-400">
          <FeatherIcon name="trending-up" class="h-5 w-5" />
        </div>
      </div>
    </div>

    <!-- Pending Tasks -->
    <div class="rounded-lg bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Pending Tasks</p>
          <div class="space-y-2">
            <h3 class="text-2xl font-medium text-gray-900">{{ totalPendingTasks }}</h3>
            <div class="flex flex-wrap gap-2 text-xs">
              <span 
                v-if="pendingTasksBreakdown.high"
                class="text-red-600"
              >
                {{ pendingTasksBreakdown.high }} High
              </span>
              <span 
                v-if="pendingTasksBreakdown.medium"
                class="text-amber-600"
              >
                {{ pendingTasksBreakdown.medium }} Medium
              </span>
              <span 
                v-if="pendingTasksBreakdown.low"
                class="text-green-600"
              >
                {{ pendingTasksBreakdown.low }} Low
              </span>
            </div>
          </div>
        </div>
        <div class="rounded-md bg-gray-50 p-2 text-gray-400">
          <FeatherIcon name="check-square" class="h-5 w-5" />
        </div>
      </div>
    </div>
  </div>
  
  <!-- Outstanding Invoices Dialog -->
  <OutstandingInvoicesDialog 
    v-model="showOutstandingInvoicesDialog"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import { FeatherIcon, Badge, dayjs } from 'frappe-ui'
import { projectResource } from '@/data/project'
import { invoiceResource } from '@/data/invoice'
import { paymentResource } from '@/data/payment'
import { todoResource } from '@/data/todo'
import { isWithinRange } from '@/utils/format'
import OutstandingInvoicesDialog from './OutstandingInvoicesDialog.vue'

// Active Projects Calculation
const activeProjects = computed(() => {
  return projectResource.data?.filter(project => 
    !project.is_child && 
    project.status !== 'Cancelled' && 
    project.status !== 'Completed'
  ) || []
})

// Project Trend Calculation
const projectTrend = computed(() => {
  const thisMonth = dayjs().startOf('month')
  const lastMonth = dayjs().subtract(1, 'month').startOf('month')
  
  const thisMonthProjects = projectResource.data?.filter(project => 
    !project.is_child &&
    dayjs(project.creation).isAfter(thisMonth)
  ).length || 0

  const lastMonthProjects = projectResource.data?.filter(project => 
    !project.is_child &&
    dayjs(project.creation).isAfter(lastMonth) &&
    dayjs(project.creation).isBefore(thisMonth)
  ).length || 0
  
  const trend = lastMonthProjects === 0 
    ? 100 
    : ((thisMonthProjects - lastMonthProjects) / lastMonthProjects) * 100
  
  return {
    current: thisMonthProjects,
    previous: lastMonthProjects,
    trend: Math.round(trend)
  }
})

// Outstanding Amount Calculation
const unpaidInvoices = computed(() => {
  return invoiceResource.data?.filter(invoice => 
    invoice.status === 'Final' && 
    invoice.type === 'Tax Invoice' &&
    (invoice.payment_status === 'Unpaid' || invoice.payment_status === 'Partially Paid')
  ) || []
})

const outstandingAmount = computed(() => {
  return unpaidInvoices.value.reduce((total, invoice) => {
    if (invoice.payment_status === 'Unpaid') {
      return total + (invoice.amount || 0)
    } else if (invoice.payment_status === 'Partially Paid') {
      // Calculate remaining amount based on payments
      const paidAmount = paymentResource.data
        ?.filter(payment => 
          payment.status === 'Submitted' && 
          payment.type === 'Receive' &&
          payment.related_docname === invoice.name
        )
        .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
      
      return total + (invoice.amount - paidAmount)
    }
    return total
  }, 0)
})

// Monthly Revenue Calculation
const monthlyRevenue = computed(() => {
  const thisMonth = dayjs().startOf('month')
  const lastMonth = dayjs().subtract(1, 'month').startOf('month')
  
  // Current month revenue
  const currentRevenue = paymentResource.data
    ?.filter(payment => 
      payment.status === 'Submitted' && 
      payment.type === 'Receive' &&
      dayjs(payment.date).isAfter(thisMonth)
    )
    .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
  
  // Last month revenue
  const lastMonthRevenue = paymentResource.data
    ?.filter(payment => 
      payment.status === 'Submitted' && 
      payment.type === 'Receive' &&
      isWithinRange(payment.date, lastMonth, thisMonth)
    )
    .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
  
  const trend = lastMonthRevenue === 0 
    ? 100 
    : ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
  
  return {
    current: currentRevenue,
    previous: lastMonthRevenue,
    trend: Math.round(trend)
  }
})

// Pending Tasks Calculation
const pendingTasksBreakdown = computed(() => {
  const tasks = todoResource.data?.filter(task => 
    task.status === 'Open' ||
    task.status === 'Delayed'
  ) || []

  return {
    high: tasks.filter(task => task.priority === 'High').length,
    medium: tasks.filter(task => task.priority === 'Medium').length,
    low: tasks.filter(task => task.priority === 'Low').length
  }
})

const totalPendingTasks = computed(() => {
  return pendingTasksBreakdown.value.high + 
         pendingTasksBreakdown.value.medium + 
         pendingTasksBreakdown.value.low
})

// Dialog state
const showOutstandingInvoicesDialog = ref(false)
  
// Utility Functions
function formatCurrency(value) {
  if (!value) return 'AED 0'
  return `AED ${Math.floor(value).toLocaleString()}`
}
</script>