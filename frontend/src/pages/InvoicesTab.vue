# InvoicesTab.vue
<template>
  <div class="bg-white rounded-lg border">
    <!-- Header -->
    <div class="flex items-center justify-between mt-6 mb-4 px-6">
      <h2 class="text-lg font-medium text-gray-900">Invoices</h2>
      <Button
        v-if="isManager"
        variant="solid"
        size="sm"
        @click="handleNewInvoice"
      >
        <template #default>
          <div class="flex items-center gap-2">
            <FeatherIcon name="plus" class="w-4 h-4" />
            <span>New</span>
          </div>
        </template>
      </Button>
    </div>

    <!-- Invoices Table -->
    <div v-if="invoiceResource.loading" class="flex justify-center py-12">
      <LoadingIndicator />
    </div>
    
    <div v-else class="overflow-x-auto min-h-[60vh]">
      <!-- Table Header -->
      <div class="border-b min-w-[800px]">
        <div class="flex items-center px-6 py-2">
          <div class="flex-1 grid grid-cols-7 gap-4">
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="file-text" class="w-4 h-4" />
              Invoice Number
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="calendar" class="w-4 h-4" />
              Date
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="tag" class="w-4 h-4" />
              Type
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="dollar-sign" class="w-4 h-4" />
              Amount
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="check-circle" class="w-4 h-4" />
              Status
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="credit-card" class="w-4 h-4" />
              Payment Status
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="info" class="w-4 h-4" />
              Additional Info
            </div>
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="divide-y">
        <template v-for="type in ['Tax Invoice', 'Proforma']" :key="type">
          <template v-if="invoicesByType[type]?.length">
            <!-- Type Group Header -->
            <div 
              class="group bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer px-6 py-2 min-w-[800px]"
              @click="toggleTypeCollapse(type)"
            >
              <div class="flex items-center gap-2">
                <FeatherIcon 
                  :name="typeCollapsed[type] ? 'chevron-right' : 'chevron-down'" 
                  class="w-4 h-4 text-gray-500"
                />
                <Badge variant="ghost" theme="gray">
                  {{ type }}
                </Badge>
                <span class="text-sm text-gray-600">
                  ({{ invoicesByType[type]?.length || 0 }})
                </span>
              </div>
            </div>

            <!-- Invoices by Status under this type -->
            <template v-if="!typeCollapsed[type]">
              <template v-for="status in ['Final', 'Submitted', 'Draft', 'Cancelled']" :key="status">
                <template v-if="getInvoicesByTypeAndStatus(type, status)?.length">
                  <!-- Status Group Header -->
                  <div 
                    class="group bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer px-6 py-2 pl-12 min-w-[800px]"
                    @click="toggleStatusCollapse(type, status)"
                  >
                    <div class="flex items-center gap-2">
                      <FeatherIcon 
                        :name="statusCollapsed[`${type}-${status}`] ? 'chevron-right' : 'chevron-down'" 
                        class="w-4 h-4 text-gray-500"
                      />
                      <Badge
                        :variant="getStatusVariant(status) === 'gray' ? 'solid' : 'subtle'"
                        :theme="getStatusVariant(status)"
                      >
                        {{ status }}
                      </Badge>
                      <span class="text-sm text-gray-600">
                        ({{ getInvoicesByTypeAndStatus(type, status)?.length || 0 }})
                      </span>
                    </div>
                  </div>

                  <!-- Invoices in this status -->
                  <template v-if="!statusCollapsed[`${type}-${status}`]">
                    <div 
                      v-for="invoice in getInvoicesByTypeAndStatus(type, status)" 
                      :key="invoice.name"
                      class="hover:bg-gray-50 transition-colors cursor-pointer min-w-[800px]"
                      @click="navigateToInvoice(invoice)"
                    >
                      <div class="flex items-center px-6 py-3 pl-16">
                        <div class="flex-1 grid grid-cols-7 gap-4">
                          <!-- Invoice Number -->
                          <div class="flex items-center">
                            <span class="text-sm text-gray-900">{{ invoice.name }}</span>
                          </div>
                          <!-- Date -->
                          <div class="text-sm text-gray-600 flex items-center">
                            {{ new Date(invoice.date).toLocaleDateString('en-AE') }}
                          </div>
                          <!-- Type -->
                          <div class="text-sm text-gray-600 flex items-center">
                            {{ invoice.type }}
                          </div>
                          <!-- Amount -->
                          <div class="text-sm text-gray-900 font-medium flex items-center">
                            {{ formatCurrency(invoice.amount) }}
                          </div>
                          <!-- Status -->
                          <div class="flex items-center">
                            <Badge
                              :variant="getStatusVariant(invoice.status) === 'gray' ? 'solid' : 'subtle'"
                              :theme="getStatusVariant(invoice.status)"
                            >
                              {{ invoice.status }}
                            </Badge>
                          </div>
                          <!-- Payment Status (only for Tax Invoice) -->
                          <div class="flex items-center">
                            <Badge
                              v-if="invoice.type === 'Tax Invoice' && invoice.status === 'Final'"
                              :variant="getPaymentStatusVariant(invoice.payment_status) === 'gray' ? 'solid' : 'subtle'"
                              :theme="getPaymentStatusVariant(invoice.payment_status)"
                            >
                              {{ invoice.payment_status }}
                            </Badge>
                          </div>
                          <!-- Additional Info -->
                          <div class="flex items-center">
                            <div 
                              v-if="invoice.type === 'Tax Invoice' && invoice.status === 'Final' && invoice.invoice_file" 
                              class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                              @click="openFinalInvoice(invoice.invoice_file, $event)"
                            >
                              <FeatherIcon name="file-text" class="w-4 h-4" />
                              View Final Invoice
                            </div>
                            <div 
                              v-if="invoice.status === 'Cancelled' && invoice.remarks" 
                              class="text-sm text-gray-600 italic"
                            >
                              {{ invoice.remarks }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </template>
              </template>
            </template>
          </template>
        </template>

        <!-- Empty State -->
        <div 
          v-if="!filteredInvoices.length" 
          class="flex flex-col items-center justify-center py-12 min-w-[800px]"
        >
          <FeatherIcon 
            name="file-text" 
            class="w-12 h-12 text-gray-400 mb-4" 
          />
          <p class="text-base font-medium text-gray-900">No Invoices Found</p>
          <p class="text-sm text-gray-600">There are no invoices created yet.</p>
        </div>
      </div>
    </div>

    <!-- New Invoice Dialog -->
    <NewInvoiceDialog
      v-model="showNewInvoiceDialog"
      :projectResource="projectResource"
      @submit="handleInvoiceSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Badge,
  FeatherIcon,
  Button,
  LoadingIndicator
} from 'frappe-ui'
import { hasRole } from '@/data/roles'
import { invoiceResource } from '@/data/invoice'
import { formatDate, formatCurrency } from '@/utils/format'
import NewInvoiceDialog from './NewInvoiceDialog.vue'

const router = useRouter()

const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'doc' in value
    }
  }
})

// State
const typeCollapsed = ref({
  'Tax Invoice': false,
  'Proforma': false
})

const statusCollapsed = ref({})
const showNewInvoiceDialog = ref(false)

// Role-based access control
const isManager = hasRole('RUA Project Manager')

// Computed
const filteredInvoices = computed(() => {
  return invoiceResource.data?.filter(invoice => invoice.project === props.projectResource.doc?.name) || []
})

const invoicesByType = computed(() => {
  if (!filteredInvoices.value?.length) return {}
  
  return filteredInvoices.value.reduce((acc, invoice) => {
    if (!acc[invoice.type]) {
      acc[invoice.type] = []
    }
    acc[invoice.type].push(invoice)
    return acc
  }, {})
})

// Methods
function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'submitted':
      return 'green'
    case 'final':
      return 'gray'
    case 'cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

function getPaymentStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'green'
    case 'partially paid':
      return 'yellow'
    case 'unpaid':
      return 'red'
    default:
      return 'gray'
  }
}

function getInvoicesByTypeAndStatus(type, status) {
  return invoicesByType.value[type]?.filter(invoice => invoice.status === status) || []
}

function toggleTypeCollapse(type) {
  typeCollapsed.value[type] = !typeCollapsed.value[type]
}

function toggleStatusCollapse(type, status) {
  const key = `${type}-${status}`
  statusCollapsed.value[key] = !statusCollapsed.value[key]
}

function navigateToInvoice(invoice) {
  router.push({
    name: 'InvoiceDetails',
    params: {
      id: props.projectResource.doc.name,
      invoiceId: invoice.name
    }
  })
}

function handleNewInvoice() {
  showNewInvoiceDialog.value = true
}

async function handleInvoiceSubmit(formData) {
  try {
    const response = await invoiceResource.insert.submit({
      party: formData.party,
      date: formData.date,
      type: formData.type,
      amount: formData.amount,
      project: props.projectResource.doc.name,
      status: 'Draft',
      doctype: 'RUA Invoice',
      naming_series: formData.naming_series
    })
    
    showNewInvoiceDialog.value = false

    // Navigate to the new Invoice
    if (response?.name) {
      router.push({
        name: 'InvoiceDetails',
        params: {
          id: props.projectResource.doc.name,
          invoiceId: response.name
        }
      })
    }
  } catch (error) {
    console.error('Failed to create invoice:', error)
  }
}
function openFinalInvoice(url, event) {
  event.preventDefault()
  event.stopPropagation()
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>