# ProjectDocuments.vue
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
            v-model="currentTab"
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
        <!-- Dynamic Content Based on Tab -->
        <QuotationsTab 
          v-if="currentTab === 'quotations'"
          :projectResource="projectResource"
          :key="'quotations'"
        />
        
        <!-- Placeholder components for other tabs -->
        <template v-else>
          <div class="bg-white rounded-lg border p-6">
            <div class="flex flex-col items-center justify-center py-12">
              <FeatherIcon 
                :name="getCurrentTabIcon" 
                class="w-12 h-12 text-gray-400 mb-4" 
              />
              <p class="text-base font-medium text-gray-900">{{ getCurrentTabLabel }} Coming Soon</p>
              <p class="text-sm text-gray-600">This feature is under development.</p>
            </div>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  FeatherIcon, 
  TabButtons, 
  LoadingIndicator,
  Badge
} from 'frappe-ui'
import { quotationResource } from '@/data/quotation'
import QuotationsTab from './QuotationsTab.vue'

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
const currentTab = ref('quotations')

// Tab Definitions
const documentTabs = [
  { 
    label: 'Quotations', 
    value: 'quotations',
    icon: 'file-text'
  },
  { 
    label: 'Proformas', 
    value: 'proformas',
    icon: 'clipboard'
  },
  { 
    label: 'Invoices', 
    value: 'invoices',
    icon: 'file'
  },
  { 
    label: 'RFQs', 
    value: 'rfqs',
    icon: 'help-circle'
  },
  { 
    label: 'Purchase Orders', 
    value: 'purchaseOrders',
    icon: 'shopping-cart'
  },
  { 
    label: 'Payments', 
    value: 'payments',
    icon: 'credit-card'
  },
]

// Computed Properties
const getCurrentTabIcon = computed(() => {
  const tab = documentTabs.find(tab => tab.value === currentTab.value)
  return tab?.icon || 'file'
})

const getCurrentTabLabel = computed(() => {
  const tab = documentTabs.find(tab => tab.value === currentTab.value)
  return tab?.label || 'Tab'
})

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