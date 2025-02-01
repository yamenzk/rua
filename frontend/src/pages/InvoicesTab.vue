# InvoicesTab.vue
<template>
  <div class="bg-white rounded-lg border">
    <!-- Header -->
    <div class="flex items-center justify-between mt-6 mb-4 px-6">
      <h2 class="text-lg font-medium text-gray-900">Invoices</h2>
      <Button
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
          <div class="flex-1 grid grid-cols-6 gap-4">
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 col-span-2">
              <FeatherIcon name="file-text" class="w-4 h-4" />
              Invoice Number
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
              <FeatherIcon name="credit-card" class="w-4 h-4" />
              Status
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
                        <div class="flex-1 grid grid-cols-6 gap-4">
                          <!-- Invoice Number -->
                          <div class="flex col-span-2">
                      <Avatar
													v-if="getPartyData(invoice.party)?.image"
													:image="getPartyData(invoice.party)?.image"
													size="3xl"
													shape="square"
                          class="mr-2 border border-gray-300"
												/>
                      <div class="flex flex-col">
                        <div class="flex items-center gap-2">
                          <div class="text-sm text-gray-900">{{invoice.party}}</div>
                        </div>
                        <div
                          class="text-sm text-gray-500 flex items-center"
                        >
                          {{ invoice.name }}
                        </div>
                        <div
                          class="text-sm text-gray-400 flex items-center"
                        >
                        {{ formatDate(invoice.date, DATE_FORMATS.SHORT) }}
                        </div>
                      </div>
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
                          <div class="flex items-center gap-2">
                            <Badge
                              :variant="getStatusVariant(invoice.status) === 'gray' ? 'solid' : 'subtle'"
                              :theme="getStatusVariant(invoice.status)"
                            >
                              {{ invoice.status }}
                            </Badge>
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
  <Dialog
      v-if="showNoClientDialog"
      v-model="showNoClientDialog"
      :options="noClientDialogOptions"
    ></Dialog>
  <Dialog
  v-model="showWarningDialog"
  :options="{
    title: 'Retention Settings Required',
    icon: {
      name: 'alert-triangle',
      appearance: 'warning'
    },
    size: 'sm'
  }"
>
  <template #body-content>
    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        Please configure retention settings in Project Settings before creating invoices.
      </p>
    </div>
  </template>
  <template #actions>
    <div class="flex justify-end">
      <Button
        variant="solid"
        @click="showWarningDialog = false"
      >
        Got it
      </Button>
    </div>
  </template>
</Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Badge,
  FeatherIcon,
  Button,
  Dialog,
  Avatar,
  LoadingIndicator
} from 'frappe-ui'
import { invoiceResource } from '@/data/invoice'
import { formatDate, formatCurrency, DATE_FORMATS } from '@/utils/format'
import NewInvoiceDialog from './NewInvoiceDialog.vue'
import { partyResource } from '@/data/party'

const router = useRouter()
const showWarningDialog = ref(false)
const showNoClientDialog = ref(false)

const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'doc' in value
    }
  }
})

function getPartyData(partyName) {
	return partyResource.data?.find((p) => p.name === partyName)
}

// State
const typeCollapsed = ref({
  'Tax Invoice': false,
  'Proforma': false
})

const canCreateInvoice = computed(() => {
  return props.projectResource.doc?.retention_status && 
         props.projectResource.doc.retention_status !== ''
})

const noClientDialogOptions = computed(() => ({
  title: 'Missing Client',
  message: 'A client must be added to the project before creating an invoice. Please add a client from the project overview page.',
  size: 'sm',
  icon: {
    name: 'alert-triangle',
    appearance: 'warning'
  },
  actions: [
    {
      label: 'Go to Overview',
      variant: 'solid',
      theme: 'warning',
      onClick: () => {
        router.push(`/project/${props.projectResource.doc.name}/overview`)
      }
    },
    {
      label: 'Close',
      variant: 'subtle',
      onClick: () => showNoClientDialog.value = false
    }
  ]
}))

const statusCollapsed = ref({
  'Tax Invoice-Final': false,
  'Tax Invoice-Submitted': false,
  'Tax Invoice-Draft': false,
  'Tax Invoice-Cancelled': true,
  'Proforma-Final': false,
  'Proforma-Submitted': false,
  'Proforma-Draft': false,
  'Proforma-Cancelled': true
})
const showNewInvoiceDialog = ref(false)


// Computed
const filteredInvoices = computed(() => {
  return invoiceResource.data?.filter(invoice => invoice.project === props.projectResource.doc?.name) || []
})

const invoicesByType = computed(() => {
  if (!filteredInvoices.value?.length) return {}
  
  // First group by type
  const grouped = filteredInvoices.value.reduce((acc, invoice) => {
    if (!acc[invoice.type]) {
      acc[invoice.type] = []
    }
    acc[invoice.type].push(invoice)
    return acc
  }, {})

  // Then sort each type group by date (newest first)
  Object.keys(grouped).forEach(type => {
    grouped[type].sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    })
  })

  return grouped
})

// Methods
function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'submitted':
      return 'blue'
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

function getProjectParties() {
  try {
    return props.projectResource.doc?.parties ? 
      (typeof props.projectResource.doc.parties === 'string' ? 
        JSON.parse(props.projectResource.doc.parties) : 
        props.projectResource.doc.parties
      ) : []
  } catch (error) {
    console.error('Error parsing parties:', error)
    return []
  }
}

function handleNewInvoice() {
  const parties = getProjectParties()
  const hasClient = parties.some(party => party.type.toLowerCase() === 'client')
  
  if (!hasClient) {
    showNoClientDialog.value = true
    return
  }

  if (!canCreateInvoice.value) {
    showWarningDialog.value = true
    return
  }
  
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