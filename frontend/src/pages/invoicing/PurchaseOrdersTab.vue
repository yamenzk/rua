# PurchaseOrdersTab.vue
<template>
  <div class="bg-white h-full">
    <!-- Header -->
    <div class="flex items-center justify-between p-6">
      <h2 class="text-lg font-medium text-gray-900">Purchase Orders</h2>
      <Button
        variant="solid"
        size="sm"
        @click="handleNewLPO"
      >
        <template #default>
          <div class="flex items-center gap-2">
            <FeatherIcon name="plus" class="w-4 h-4" />
            <span>New</span>
          </div>
        </template>
      </Button>
    </div>

    <!-- Purchase Orders Table -->
    <div v-if="lpoResource.loading" class="flex justify-center py-12">
      <LoadingIndicator />
    </div>
    
    <div v-else class="overflow-x-auto h-full">
      <!-- Table Header -->
      <div class="border-b min-w-[800px]">
        <div class="flex items-center px-6 py-2">
          <div class="flex-1 grid grid-cols-7 gap-4">
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 col-span-2">
              <FeatherIcon name="user" class="w-4 h-4" />
              Party
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="dollar-sign" class="w-4 h-4" />
              Grand Total
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="hash" class="w-4 h-4" />
              Reference
            </div>
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 col-span-2">
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
        <template v-for="type in ['Aluminum', 'Glass', 'Material']" :key="type">
          <template v-if="lposByType[type]?.length">
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
                  ({{ lposByType[type]?.length || 0 }})
                </span>
              </div>
            </div>

            <!-- LPOs by Status under this type -->
            <template v-if="!typeCollapsed[type]">
              <template v-for="status in ['Final', 'Submitted', 'Draft', 'Cancelled']" :key="status">
                <template v-if="getLPOsByTypeAndStatus(type, status)?.length">
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
                        ({{ getLPOsByTypeAndStatus(type, status)?.length || 0 }})
                      </span>
                    </div>
                  </div>

                  <!-- LPOs in this status -->
                  <template v-if="!statusCollapsed[`${type}-${status}`]">
                    <div 
                      v-for="lpo in getLPOsByTypeAndStatus(type, status)" 
                      :key="lpo.name"
                      class="hover:bg-gray-50 transition-colors cursor-pointer min-w-[800px]"
                      @click="navigateToLPO(lpo)"
                    >
                      <div class="flex items-center px-6 py-3 pl-16">
                        <div class="flex-1 grid grid-cols-7 gap-4">
                          <!-- Party -->
                          <div class="flex col-span-2">
                      <Avatar
													v-if="getPartyData(lpo.party)?.image"
													:image="getPartyData(lpo.party)?.image"
													size="3xl"
													shape="square"
                          class="mr-2 border border-gray-300"
												/>
                      <div class="flex flex-col">
                        <div class="flex items-center gap-2">
                          <div class="text-sm text-gray-900">{{lpo.party}}</div>
                        </div>
                        <div
                          class="text-sm text-gray-500 flex items-center"
                        >
                          {{ lpo.name }}
                        </div>
                        <div
                          class="text-sm text-gray-400 flex items-center"
                        >
                        {{ formatDate(lpo.date) }}
                        </div>
                      </div>
										</div>
                          <!-- Grand Total -->
                          <div class="text-sm text-gray-900 font-medium flex items-center">
                            {{ formatCurrency(lpo.grand_total) }}
                          </div>
                          <!-- Reference -->
                          <div class="flex items-center text-sm text-gray-900">
                            {{ lpo.supplier_reference_number }}
                          </div>
                          <!-- Status -->
                          <div class="flex items-center gap-2 col-span-2">
                            <Badge
                              :variant="getStatusVariant(lpo.status) === 'gray' ? 'solid' : 'subtle'"
                              :theme="getStatusVariant(lpo.status)"
                            >
                              {{ lpo.status }}
                            </Badge>
                            <Badge
                              v-if="lpo.status === 'Final'"
                              :variant="getPaymentStatusVariant(lpo.payment_status) === 'gray' ? 'solid' : 'subtle'"
                              :theme="getPaymentStatusVariant(lpo.payment_status)"
                            >
                              {{ lpo.payment_status }}
                            </Badge>
                            <Badge v-if="lpo.all_items_received && lpo.status === 'Final'" variant="solid" theme="green">
                              Received
                            </Badge>
                            <Badge v-if="!lpo.all_items_received && lpo.status === 'Final'" variant="outline" theme="orange">
                              Pending
                            </Badge>
                          </div>
                          <!-- Additional Info -->
                          <div class="flex items-center">
                            <div 
                              v-if="lpo.status === 'Final' && lpo.final_lpo" 
                              class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                              @click="openFinalLPO(lpo.final_lpo, $event)"
                            >
                              <FeatherIcon name="file-text" class="w-4 h-4" />
                              View Final LPO
                            </div>
                            <div 
                              v-if="lpo.status === 'Cancelled' && lpo.remarks" 
                              class="text-sm text-gray-600 italic"
                            >
                              {{ lpo.remarks }}
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
          v-if="!filteredLPOs.length" 
          class="flex flex-col items-center justify-center py-12 min-w-[800px]"
        >
          <FeatherIcon 
            name="shopping-cart" 
            class="w-12 h-12 text-gray-400 mb-4" 
          />
          <p class="text-base font-medium text-gray-900">No Purchase Orders Found</p>
          <p class="text-sm text-gray-600">There are no purchase orders created yet.</p>
        </div>
      </div>
    </div>

    <!-- New LPO Dialog -->
    <NewLPODialog
      v-model="showNewLPODialog"
      :projectResource="projectResource"
      @submit="handleLPOSubmit"
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
  LoadingIndicator
} from 'frappe-ui'
import { lpoResource } from '@/data/lpo'
import { formatCurrency } from '@/utils/format'
import NewLPODialog from '@/components/invoicing/lpo/NewLPODialog.vue'
import { partyResource } from '@/data/party'
import { formatDate } from '@/utils/format'

const router = useRouter()

const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'doc' in value
    }
  },
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

// State
const typeCollapsed = ref({
  Aluminum: false,
  Glass: false,
  Material: false
})
const statusCollapsed = ref({
  'Aluminum-Final': false,
  'Aluminum-Submitted': false,
  'Aluminum-Draft': false,
  'Aluminum-Cancelled': true,
  'Glass-Final': false,
  'Glass-Submitted': false,
  'Glass-Draft': false,
  'Glass-Cancelled': true,
  'Material-Final': false,
  'Material-Submitted': false,
  'Material-Draft': false,
  'Material-Cancelled': true
})
const showNewLPODialog = ref(false)


// Computed
const filteredLPOs = computed(() => {
  return lpoResource.data?.filter(lpo => lpo.project === props.projectResource.doc?.name) || []
})

const lposByType = computed(() => {
  if (!filteredLPOs.value?.length) return {}
  
  // First group by type
  const grouped = filteredLPOs.value.reduce((acc, lpo) => {
    const type = lpo.type || 'Material'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(lpo)
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
    case 'cancelled':
      return 'red'
    case 'final':
      return 'gray'
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

function getLPOsByTypeAndStatus(type, status) {
  return lposByType.value[type]?.filter(lpo => lpo.status === status) || []
}

function toggleTypeCollapse(type) {
  typeCollapsed.value[type] = !typeCollapsed.value[type]
}

function toggleStatusCollapse(type, status) {
  const key = `${type}-${status}`
  statusCollapsed.value[key] = !statusCollapsed.value[key]
}

function getPartyData(partyName) {
  return partyResource.data?.find(p => p.name === partyName)
}

function navigateToLPO(lpo) {
  router.push({
    name: 'LPODetails',
    params: {
      id: props.projectResource.doc.name,
      lpoId: lpo.name
    }
  })
}

function handleNewLPO() {
  showNewLPODialog.value = true
}

async function handleLPOSubmit(formData) {
  try {
    const response = await lpoResource.insert.submit({
      project: props.projectResource.doc.name,
      date: formData.date,
      party: formData.party,
      type: formData.type,
      supplier_reference_number: formData.supplier_reference_number,
      doctype: 'RUA LPO'
    })
    
    showNewLPODialog.value = false

    // Navigate to the new LPO
    if (response?.name) {
      router.push({
        name: 'LPODetails',
        params: {
          id: props.projectResource.doc.name,
          lpoId: response.name
        }
      })
    }
  } catch (error) {
    console.error('Failed to create LPO:', error)
  }
}

function openFinalLPO(url, event) {
  event.preventDefault()
  event.stopPropagation()
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>