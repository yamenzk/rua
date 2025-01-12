<template>
  <div class="space-y-8 px-6" v-if="projectResource">
    <!-- Loading State -->
    <div v-if="isLoading" class="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <div class="text-gray-700">
          <p class="font-medium">Loading documents...</p>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Tabs in scrollable container -->
      <div class="relative">
        <div class="overflow-x-auto scrollbar-hide">
          <div class="flex space-x-2 py-2 min-w-max">
            <TabButtons
              :buttons="[
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
              ]"
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
                </div>
              </template>
            </TabButtons>
          </div>
        </div>
      </div>

      <!-- Dynamic Content Based on Tab -->
      <QuotationsTab 
        v-if="currentTab === 'quotations'"
        :projectResource="projectResource"
      />
      
      <!-- Placeholder components for other tabs -->
      <div v-else-if="currentTab === 'proformas'" class="bg-white rounded-lg border p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <FeatherIcon name="clipboard" class="w-12 h-12 text-gray-400 mb-4" />
          <p class="text-base font-medium text-gray-900">Proformas Coming Soon</p>
          <p class="text-sm text-gray-600">This feature is under development.</p>
        </div>
      </div>

      <div v-else-if="currentTab === 'invoices'" class="bg-white rounded-lg border p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <FeatherIcon name="file" class="w-12 h-12 text-gray-400 mb-4" />
          <p class="text-base font-medium text-gray-900">Invoices Coming Soon</p>
          <p class="text-sm text-gray-600">This feature is under development.</p>
        </div>
      </div>

      <div v-else-if="currentTab === 'rfqs'" class="bg-white rounded-lg border p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <FeatherIcon name="help-circle" class="w-12 h-12 text-gray-400 mb-4" />
          <p class="text-base font-medium text-gray-900">RFQs Coming Soon</p>
          <p class="text-sm text-gray-600">This feature is under development.</p>
        </div>
      </div>

      <div v-else-if="currentTab === 'purchaseOrders'" class="bg-white rounded-lg border p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <FeatherIcon name="shopping-cart" class="w-12 h-12 text-gray-400 mb-4" />
          <p class="text-base font-medium text-gray-900">Purchase Orders Coming Soon</p>
          <p class="text-sm text-gray-600">This feature is under development.</p>
        </div>
      </div>

      <div v-else-if="currentTab === 'payments'" class="bg-white rounded-lg border p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <FeatherIcon name="credit-card" class="w-12 h-12 text-gray-400 mb-4" />
          <p class="text-base font-medium text-gray-900">Payments Coming Soon</p>
          <p class="text-sm text-gray-600">This feature is under development.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  FeatherIcon,
  TabButtons
} from 'frappe-ui'
import QuotationsTab from './QuotationsTab.vue'

const props = defineProps({
  projectResource: {
    type: Object,
    required: true
  }
})

// State
const isLoading = ref(true)
const currentTab = ref('quotations')

// Initialize component
setTimeout(() => {
  isLoading.value = false
}, 500) // Simulate initial loading
</script>