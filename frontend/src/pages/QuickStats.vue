<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Active Projects -->
      <div class="bg-white rounded-lg border p-4 flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Active Projects</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-1">
              {{ activeProjects.length }}
            </h3>
          </div>
          <div class="p-2 rounded-lg bg-blue-50">
            <FeatherIcon name="briefcase" class="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <FeatherIcon 
            :name="projectTrend.trend >= 0 ? 'trending-up' : 'trending-down'" 
            class="w-4 h-4 mr-1"
            :class="projectTrend.trend >= 0 ? 'text-green-500' : 'text-red-500'"
          />
          <span 
            :class="projectTrend.trend >= 0 ? 'text-green-500' : 'text-red-500'"
          >
            {{ Math.abs(projectTrend.trend) }}%
          </span>
          <span class="text-gray-500 ml-1">vs last month</span>
        </div>
      </div>
  
      <!-- Outstanding Amount -->
      <div class="bg-white rounded-lg border p-4 flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Outstanding Amount</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-1">
              {{ formatCurrency(outstandingAmount) }}
            </h3>
          </div>
          <div class="p-2 rounded-lg bg-yellow-50">
            <FeatherIcon name="dollar-sign" class="w-5 h-5 text-yellow-500" />
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-500">
          From {{ unpaidInvoices.length }} unpaid invoices
        </div>
      </div>
  
      <!-- This Month's Revenue -->
      <div class="bg-white rounded-lg border p-4 flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">This Month's Revenue</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-1">
              {{ formatCurrency(monthlyRevenue.current) }}
            </h3>
          </div>
          <div class="p-2 rounded-lg bg-green-50">
            <FeatherIcon name="trending-up" class="w-5 h-5 text-green-500" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <FeatherIcon 
            :name="monthlyRevenue.trend >= 0 ? 'trending-up' : 'trending-down'" 
            class="w-4 h-4 mr-1"
            :class="monthlyRevenue.trend >= 0 ? 'text-green-500' : 'text-red-500'"
          />
          <span 
            :class="monthlyRevenue.trend >= 0 ? 'text-green-500' : 'text-red-500'"
          >
            {{ Math.abs(monthlyRevenue.trend) }}%
          </span>
          <span class="text-gray-500 ml-1">vs last month</span>
        </div>
      </div>
  
      <!-- Pending Tasks -->
<div class="bg-white rounded-lg border p-4">
  <div class="flex justify-between items-start">
    <div>
      <p class="text-gray-500 text-sm">Pending Tasks</p>
      <h3 class="text-2xl font-bold text-gray-900 mt-1">
        {{ totalPendingTasks }}
      </h3>
    </div>
    <div class="p-2 rounded-lg bg-red-50">
      <FeatherIcon name="check-square" class="w-5 h-5 text-red-500" />
    </div>
  </div>
  <div class="mt-2 flex flex-wrap gap-2">
    <Badge 
      v-if="pendingTasksBreakdown.high"
      variant="subtle" 
      theme="red"
    >
      {{ pendingTasksBreakdown.high }} High Priority
    </Badge>
    <Badge 
      v-if="pendingTasksBreakdown.medium"
      variant="subtle" 
      theme="orange"
    >
      {{ pendingTasksBreakdown.medium }} Medium
    </Badge>
    <Badge 
      v-if="pendingTasksBreakdown.low"
      variant="subtle" 
      theme="green"
    >
      {{ pendingTasksBreakdown.low }} Low
    </Badge>
  </div>
</div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { FeatherIcon, Badge } from 'frappe-ui'
  import { projectResource } from '@/data/project'
  import { invoiceResource } from '@/data/invoice'
  import { paymentResource } from '@/data/payment'
  import { lpoResource } from '@/data/lpo'
  import { todoResource } from '@/data/todo'
  
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
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    const thisMonthProjects = projectResource.data?.filter(project => 
      !project.is_child &&
      new Date(project.creation) >= thisMonth
    ).length || 0
  
    const lastMonthProjects = projectResource.data?.filter(project => 
      !project.is_child &&
      new Date(project.creation) >= lastMonth &&
      new Date(project.creation) < thisMonth
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
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    // Current month revenue
    const currentRevenue = paymentResource.data
      ?.filter(payment => 
        payment.status === 'Submitted' && 
        payment.type === 'Receive' &&
        new Date(payment.date) >= thisMonth
      )
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
  
    // Last month revenue
    const lastMonthRevenue = paymentResource.data
      ?.filter(payment => 
        payment.status === 'Submitted' && 
        payment.type === 'Receive' &&
        new Date(payment.date) >= lastMonth &&
        new Date(payment.date) < thisMonth
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
  
  // Pending Approvals Calculation
  const pendingApprovals = computed(() => {
    return {
      invoices: invoiceResource.data?.filter(invoice => invoice.status === 'Draft') || [],
      payments: paymentResource.data?.filter(payment => payment.status === 'Draft') || [],
      lpos: lpoResource.data?.filter(lpo => lpo.status === 'Draft') || []
    }
  })
  
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
  
  // Utility Functions
  function formatCurrency(value) {
    if (!value) return 'AED 0'
    return `AED ${Math.floor(value).toLocaleString()}`
  }
  </script>