<template>
  <div v-if="!projectResource?.doc" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else>
    <!-- Sub Navigation Card -->
    <div class="bg-white">
    <div class="sticky top-0 z-10 bg-white border-b">
      <div class="px-6 py-4">
        <div class="flex flex-col space-y-4">
          <!-- Title and Description -->
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Project Invoicing</h2>
              <p class="text-sm text-gray-500 mt-1">Manage quotations, invoices, and purchases</p>
            </div>
          </div>

          <!-- Document Type Navigation -->
          <div class="pb-2">
            <div class="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 p-2">
              <button 
                v-for="tab in documentTabs" 
                :key="tab.value"
                class="
                  relative 
                  flex 
                  items-center 
                  gap-3 
                  px-4 
                  py-2 
                  rounded-lg 
                  cursor-pointer 
                  select-none 
                  transition-all 
                  duration-300 
                  ease-in-out
                  text-sm 
                  font-medium
                  focus:outline-none
                  group
                "
                :class="[
                  currentTab === tab.value 
                    ? 'bg-gray-900 text-white tab-selected' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                ]"
                @click="handleTabChange(tab.value)"
              >
                <FeatherIcon 
                  :name="tab.icon" 
                  class="w-4 h-4 shrink-0 transition-colors duration-200"
                  :class="[
                    currentTab === tab.value 
                      ? 'text-white' 
                      : 'text-gray-400 group-hover:text-gray-700'
                  ]"
                />
                <span class="whitespace-nowrap">{{ tab.label }}</span>
                
                <!-- Count Indicator -->
                <span 
                  v-if="getTabCount(tab.value)"
                  class="
                    ml-2 
                    inline-flex 
                    items-center 
                    justify-center
                    min-w-[20px]
                    h-5 
                    px-1.5 
                    rounded-full 
                    text-xs 
                    font-semibold
                    transition-all
                    duration-200
                  "
                  :class="[
                    currentTab === tab.value
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-900'
                  ]"
                >
                  {{ getTabCount(tab.value) }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

    <!-- Content Card -->
    <div>
          <component 
            :is="getCurrentTabComponent"
            :projectResource="projectResource"
            :key="currentTab"
          />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  FeatherIcon, 
  LoadingIndicator,
} from 'frappe-ui'
import { quotationResource } from '@/data/quotation'
import { invoiceResource } from '@/data/invoice'
import { rfqResource } from '@/data/rfq'
import { lpoResource } from '@/data/lpo'
import { purchaseReceiptResource } from '@/data/purchaseReceipt'
import { paymentResource } from '@/data/payment'
import QuotationsTab from '@/pages/invoicing/QuotationsTab.vue'
import PurchaseOrdersTab from '@/pages/invoicing/PurchaseOrdersTab.vue'
import RFQsTab from '@/pages/invoicing/RFQsTab.vue'
import InvoicesTab from '@/pages/invoicing/InvoicesTab.vue'
import PaymentsTab from '@/pages/invoicing/PaymentsTab.vue'
import PurchaseReceiptsTab from '@/pages/invoicing/PurchaseReceiptsTab.vue'

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
  },
  isCollapsed: {
    type: Boolean,
    default: false
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
<style scoped>
/* Extremely subtle scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thumb-gray-200::-webkit-scrollbar-thumb {
  background-color: rgba(229, 231, 235, 0.3);
  border-radius: 9999px;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb:hover {
  background-color: rgba(209, 213, 219, 0.5);
}
</style>