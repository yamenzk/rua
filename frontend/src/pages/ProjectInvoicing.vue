<template>
  <div v-if="!projectResource?.doc" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else class="space-y-4">
    <!-- Sub Navigation Card -->
    <div class="bg-white rounded-lg">
      <div class="sticky top-0 z-10 bg-white">
        <div class="px-6 py-3">
          <div class="flex flex-col space-y-4">
            <!-- Title and Description -->
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-medium text-gray-900">Project Invoicing</h2>
                <p class="text-sm text-gray-500">Manage quotations, invoices, and purchases</p>
              </div>
            </div>

            <!-- Document Type Navigation -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
              <div 
                v-for="tab in documentTabs" 
                :key="tab.value"
                class="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer select-none transition-colors"
                :class="[
                  currentTab === tab.value 
                    ? 'bg-gray-900 text-white' 
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                ]"
                @click="handleTabChange(tab.value)"
              >
                <FeatherIcon 
                  :name="tab.icon" 
                  class="w-4 h-4 shrink-0"
                  :class="currentTab === tab.value ? 'text-primary-500' : 'text-gray-400'"
                />
                <span class="whitespace-nowrap">{{ tab.label }}</span>
                <Badge 
                  v-if="getTabCount(tab.value)"
                  :variant="currentTab === tab.value ? 'solid' : 'subtle'"
                  :theme="currentTab === tab.value ? 'primary' : 'gray'"
                  size="sm"
                >
                  {{ getTabCount(tab.value) }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Card -->
    <div class="bg-white rounded-lg mx-6">
          <component 
            :is="getCurrentTabComponent"
            :projectResource="projectResource"
            :key="currentTab"
          />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineComponent, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  FeatherIcon, 
  TabButtons, 
  LoadingIndicator,
  Badge
} from 'frappe-ui'
import { quotationResource } from '@/data/quotation'
import { invoiceResource } from '@/data/invoice'
import { rfqResource } from '@/data/rfq'
import { lpoResource } from '@/data/lpo'
import { purchaseReceiptResource } from '@/data/purchaseReceipt'
import { paymentResource } from '@/data/payment'
import QuotationsTab from './QuotationsTab.vue'
import PurchaseOrdersTab from './PurchaseOrdersTab.vue'
import RFQsTab from './RFQsTab.vue'
import InvoicesTab from './InvoicesTab.vue'
import PaymentsTab from './PaymentsTab.vue'
import PurchaseReceiptsTab from './PurchaseReceiptsTab.vue'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'doc' in value
    }
  },
  defaultTab: {
    type: String,
    default: 'quotations'
  }
})

// Tab Definitions
const documentTabs = [
  { 
    label: 'Quotations', 
    value: 'quotations',
    icon: 'file-text',
    route: 'ProjectInvoicingQuotations'
  },
  { 
    label: 'Invoices', 
    value: 'invoices',
    icon: 'file',
    route: 'ProjectInvoicingInvoices'
  },
  { 
    label: 'RFQs', 
    value: 'rfqs',
    icon: 'help-circle',
    route: 'ProjectInvoicingRFQs'
  },
  { 
    label: 'Purchase Orders', 
    value: 'purchaseOrders',
    icon: 'shopping-cart',
    route: 'ProjectInvoicingPurchaseOrders'
  },
  { 
    label: 'Purchase Receipts', 
    value: 'purchaseReceipts',
    icon: 'box',
    route: 'ProjectInvoicingPurchaseReceipts'
  },
  { 
    label: 'Payments', 
    value: 'payments',
    icon: 'credit-card',
    route: 'ProjectInvoicingPayments'
  },
]

// Initialize currentTab based on route
const initialTab = computed(() => {
  const currentRoute = route.name
  const matchingTab = documentTabs.find(tab => tab.route === currentRoute)
  return matchingTab ? matchingTab.value : props.defaultTab
})

// State
const currentTab = ref(initialTab.value)

// Watch for route changes
watch(() => route.name, (newRouteName) => {
  const tab = documentTabs.find(tab => tab.route === newRouteName)
  if (tab) {
    currentTab.value = tab.value
  }
})

// Watch for prop changes
watch(() => props.defaultTab, (newTab) => {
  currentTab.value = newTab
})

// Computed Properties
const getCurrentTabIcon = computed(() => {
  const tab = documentTabs.find(tab => tab.value === currentTab.value)
  return tab?.icon || 'file'
})

const getCurrentTabLabel = computed(() => {
  const tab = documentTabs.find(tab => tab.value === currentTab.value)
  return tab?.label || 'Tab'
})

const getCurrentTabComponent = computed(() => {
  const components = {
    quotations: QuotationsTab,
    purchaseOrders: PurchaseOrdersTab,
    rfqs: RFQsTab,
    invoices: InvoicesTab,
    payments: PaymentsTab,
    purchaseReceipts: PurchaseReceiptsTab
  }

  const component = components[currentTab.value]
  if (component) {
    return component
  }
})

// Methods
function handleTabChange(newTab) {
  const tab = documentTabs.find(tab => tab.value === newTab)
  if (tab) {
    router.push({
      name: tab.route,
      params: { id: route.params.id }
    })
  }
}

// Get count for badges
function getTabCount(tabValue) {
  const projectId = props.projectResource.doc?.name;
  
  switch (tabValue) {
    case 'quotations':
      return quotationResource.data?.filter(q => q.project === projectId)?.length || 0;
      
    case 'invoices':
      return invoiceResource.data?.filter(inv => inv.project === projectId)?.length || 0;
      
    case 'rfqs':
      return rfqResource.data?.filter(rfq => rfq.project === projectId)?.length || 0;
      
    case 'purchaseOrders':
      return lpoResource.data?.filter(po => po.project === projectId)?.length || 0;
      
    case 'purchaseReceipts':
      return purchaseReceiptResource.data?.filter(pr => pr.project === projectId)?.length || 0;
      
    case 'payments':
      return paymentResource.data?.filter(p => p.project === projectId)?.length || 0;
      
    default:
      return 0;
  }
}
</script>