# PaymentsTab.vue
<template>
  <div class="bg-white rounded-lg border">
    <!-- Inner Tabs -->
    <div class="border-b">
      <div class="px-6">
        <CustomTabButtons
  :buttons="paymentTabs"
  :modelValue="currentTab"
  @update:modelValue="currentTab = $event"
  :getTabCount="getTabCount"
  class="w-full"
/>
      </div>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between mt-6 mb-4 px-6">
      <h2 class="text-lg font-medium text-gray-900">{{ currentTabLabel }}</h2>
      <Button
        v-if="showAddButton"
        variant="solid"
        size="sm"
        @click="handleNewPayment"
      >
        <template #default>
          <div class="flex items-center gap-2">
            <FeatherIcon name="plus" class="w-4 h-4" />
            <span>New</span>
          </div>
        </template>
      </Button>
    </div>

    <!-- Payments Table -->
    <div v-if="paymentResource.loading" class="flex justify-center py-12">
      <LoadingIndicator />
    </div>
    
    <div v-else class="overflow-x-auto min-h-[60vh]">
      <!-- Table Header -->
      <div class="border-b min-w-[800px]">
        <div class="flex items-center px-6 py-2">
          <div class="flex-1 grid grid-cols-6 gap-4">
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 col-span-2">
              <FeatherIcon name="user" class="w-4 h-4" />
              Party
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="dollar-sign" class="w-4 h-4" />
              Amount
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="hash" class="w-4 h-4" />
              Ref
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="check-circle" class="w-4 h-4" />
              Status
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="message-square" class="w-4 h-4" />
              Remarks
            </div>
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="divide-y">
        <template v-for="status in ['Draft', 'Submitted', 'Cancelled']" :key="status">
          <template v-if="getPaymentsByStatus(status)?.length">
            <!-- Status Group Header -->
            <div 
              class="group bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer px-6 py-2 min-w-[800px]"
              @click="toggleStatusCollapse(status)"
            >
              <div class="flex items-center gap-2">
                <FeatherIcon 
                  :name="statusCollapsed[status] ? 'chevron-right' : 'chevron-down'" 
                  class="w-4 h-4 text-gray-500"
                />
                <Badge
                  :variant="getStatusVariant(status) === 'gray' ? 'solid' : 'subtle'"
                  :theme="getStatusVariant(status)"
                >
                  {{ status }}
                </Badge>
                <span class="text-sm text-gray-600">
                  ({{ getPaymentsByStatus(status)?.length || 0 }})
                </span>
              </div>
            </div>

            <!-- Payments in this status -->
            <template v-if="!statusCollapsed[status]">
              <div 
                v-for="payment in getPaymentsByStatus(status)" 
                :key="payment.name"
                class="hover:bg-gray-50 transition-colors cursor-pointer min-w-[800px]"
                @click="navigateToPayment(payment)"
              >
                <div class="flex items-center px-6 py-3">
                  <div class="flex-1 grid grid-cols-6 gap-4">
                    <!-- Party -->
                    <div class="flex col-span-2">
                      <Avatar
													v-if="getPartyData(payment.party)?.image"
													:image="getPartyData(payment.party)?.image"
													size="3xl"
													shape="square"
                          class="mr-2 border border-gray-300"
												/>
                      <div class="flex flex-col">
                        <div class="flex items-center gap-2">
                          <div class="text-sm text-gray-900">{{payment.party}}</div>
                        </div>
                        <div
                          class="text-sm text-gray-500 flex items-center"
                        >
                          {{ payment.name }}
                        </div>
                        <div
                          class="text-sm text-gray-400 flex items-center"
                        >
                          {{
                            new Date(payment.date).toLocaleDateString(
                              'en-AE',
                            )
                          }}
                        </div>
                      </div>
										</div>
                    <!-- Amount -->
                    <div class="text-sm text-gray-900 font-medium flex items-center">
                      {{ formatCurrency(payment.amount) }}
                    </div>
                    <!-- Ref Number -->
                    <div class="text-sm text-gray-600 flex items-center">
                      {{ payment.related_docname || '-' }}
                    </div>
                    <!-- Status -->
                    <div class="flex items-center">
                      <Badge
                        :variant="getStatusVariant(payment.status) === 'gray' ? 'solid' : 'subtle'"
                        :theme="getStatusVariant(payment.status)"
                      >
                        {{ payment.status }}
                      </Badge>
                    </div>
                    <!-- Remarks -->
                    <div class="text-sm text-gray-600 flex items-center">
                      {{ payment.remarks || '-' }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </template>

        <!-- Empty State -->
        <div 
          v-if="!filteredPayments.length" 
          class="flex flex-col items-center justify-center py-12 min-w-[800px]"
        >
          <FeatherIcon 
            name="credit-card" 
            class="w-12 h-12 text-gray-400 mb-4" 
          />
          <p class="text-base font-medium text-gray-900">No Payments Found</p>
          <p class="text-sm text-gray-600">There are no payments in this category yet.</p>
        </div>
      </div>
    </div>

    <!-- New Payment Dialog -->
    <NewPaymentDialog
      v-model="showNewPaymentDialog"
      :projectResource="projectResource"
      @submit="handlePaymentSubmit"
    />
    <NewReceiptDialog
    v-model="showNewReceiptDialog"
    :projectResource="projectResource"
    @submit="handlePaymentSubmit"
  />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Avatar,
  Badge,
  FeatherIcon,
  Button,
  LoadingIndicator,
  TabButtons
} from 'frappe-ui'
import { hasRole } from '@/data/roles'
import { paymentResource } from '@/data/payment'
import { formatDate, formatCurrency } from '@/utils/format'
import { partyResource } from '@/data/party'
import NewPaymentDialog from './NewPaymentDialog.vue'
import NewReceiptDialog from './NewReceiptDialog.vue'
import CustomTabButtons from '@/components/CustomTabButtons.vue'


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
const currentTab = ref('received')
const statusCollapsed = ref({})
const showNewPaymentDialog = ref(false)
const showNewReceiptDialog = ref(false)

// Tab Definitions
const paymentTabs = [
  { label: 'Received', value: 'received', icon: 'arrow-down-circle' },
  { label: 'Paid', value: 'paid', icon: 'arrow-up-circle' },
  { label: 'Expenses', value: 'additional', icon: 'plus-circle' }
]

// Computed Properties
const currentTabLabel = computed(() => {
  const labels = {
    received: 'Received Payments',
    paid: 'Paid Payments',
    additional: 'Additional Expenses'
  }
  return labels[currentTab.value] || ''
})

const showAddButton = computed(() => {
  return currentTab.value === 'additional' || currentTab.value === 'received'
})

const filteredPayments = computed(() => {
  if (!paymentResource.data) return []
  
  return paymentResource.data.filter(payment => {
    if (payment.project !== props.projectResource.doc?.name) return false
    
    switch (currentTab.value) {
      case 'received':
        return payment.type === 'Receive'
      case 'paid':
        return payment.type === 'Pay'
      case 'additional':
        return payment.type === 'Pay: Petty Cash'
      default:
        return false
    }
  })
})

// Methods
function getTabCount(tabValue) {
  if (!paymentResource.data) return 0
  
  return paymentResource.data.filter(payment => {
    // Only count payments with 'Submitted' status
    if (payment.status !== 'Submitted') return false
    
    // Check project
    if (payment.project !== props.projectResource.doc?.name) return false
    
    // Filter by payment type
    switch (tabValue) {
      case 'received':
        return payment.type === 'Receive'
      case 'paid':
        return payment.type === 'Pay'
      case 'additional':
        return payment.type === 'Pay: Petty Cash'
      default:
        return false
    }
  }).length
}

function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'submitted':
      return 'green'
    case 'cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

function getPaymentsByStatus(status) {
  return filteredPayments.value.filter(payment => payment.status === status)
}

function toggleStatusCollapse(status) {
  statusCollapsed.value[status] = !statusCollapsed.value[status]
}

function getPartyData(partyName) {
  return partyResource.data?.find(p => p.name === partyName)
}

function navigateToPayment(payment) {
  router.push({
    name: 'PaymentDetails',
    params: {
      id: props.projectResource.doc.name,
      paymentId: payment.name
    }
  })
}

function handleNewPayment() {
  if (currentTab.value === 'received') {
    showNewReceiptDialog.value = true
  } else {
    showNewPaymentDialog.value = true
  }
}
async function handlePaymentSubmit(formData) {
  try {
    const response = await paymentResource.insert.submit({
      ...formData,
      doctype: 'RUA Payment'
    })
    
    showNewPaymentDialog.value = false

    // Navigate to the new Payment
    if (response?.name) {
      router.push({
        name: 'PaymentDetails',
        params: {
          id: props.projectResource.doc.name,
          paymentId: response.name
        }
      })
    }
  } catch (error) {
    console.error('Failed to create payment:', error)
  }
}
</script>