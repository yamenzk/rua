# ProjectInvoicing.vue
<template>
  <div v-if="!projectResource?.doc" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else class="space-y-8 px-6">
    <!-- Tabs in scrollable container -->
    <div class="relative">
      <div class="overflow-x-auto scrollbar-hide">
        <div class="flex space-x-2 py-2 min-w-max">
          <TabButtons
            :buttons="documentTabs"
            :modelValue="currentTab"
            @update:modelValue="handleTabChange"
            class="w-full"
          >
            <template #button="{ button, active }">
              <div class="flex items-center gap-2">
                <FeatherIcon 
                  :name="button.icon" 
                  class="w-4 h-4"
                />
                <span>{{ button.label }}</span>
                <Badge 
                  v-if="getTabCount(button.value)"
                  :variant="active ? 'solid' : 'subtle'"
                  theme="blue"
                  size="sm"
                >
                  {{ getTabCount(button.value) }}
                </Badge>
              </div>
            </template>
          </TabButtons>
        </div>
      </div>
    </div>

    <!-- Tab Content with Transition -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div>
        <component 
          :is="getCurrentTabComponent"
          :projectResource="projectResource"
          :key="currentTab"
        />
      </div>
    </Transition>
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
import QuotationsTab from './QuotationsTab.vue'
import PurchaseOrdersTab from './PurchaseOrdersTab.vue'
import RFQsTab from './RFQsTab.vue'
import InvoicesTab from './InvoicesTab.vue'
import PaymentsTab from './PaymentsTab.vue'
import ComingSoon from '../components/ComingSoon.vue'

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
    payments: PaymentsTab
  }

  const component = components[currentTab.value]
  if (component) {
    return component
  }

  // Return ComingSoon component with current tab props
  return defineComponent({
    setup() {
      return () => h(ComingSoon, {
        icon: getCurrentTabIcon.value,
        label: getCurrentTabLabel.value,
        projectResource: props.projectResource
      })
    }
  })
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
  if (tabValue === 'quotations') {
    return quotationResource.data?.filter(q => 
      q.project === props.projectResource.doc?.name
    )?.length || 0
  }
  return 0
}
</script>