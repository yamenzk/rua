# RFQsTab.vue
<template>
  <div class="bg-white rounded-lg border">
    <!-- Header -->
    <div class="flex items-center justify-between mt-6 mb-4 px-6">
      <h2 class="text-lg font-medium text-gray-900">Request for Quotations</h2>
      <Button
        v-if="isManager"
        variant="solid"
        size="sm"
        @click="handleNewRFQ"
      >
        <template #default>
          <div class="flex items-center gap-2">
            <FeatherIcon name="plus" class="w-4 h-4" />
            <span>New</span>
          </div>
        </template>
      </Button>
    </div>

    <!-- RFQs Table -->
    <div v-if="rfqResource.loading" class="flex justify-center py-12">
      <LoadingIndicator />
    </div>
    
    <div v-else class="overflow-x-auto min-h-[60vh]">
      <!-- Table Header -->
      <div class="border-b min-w-[800px]">
        <div class="flex items-center px-6 py-2">
          <div class="flex-1 grid grid-cols-5 gap-4">
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FeatherIcon name="user" class="w-4 h-4" />
              Party
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
              <FeatherIcon name="check-circle" class="w-4 h-4" />
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
        <template v-for="type in ['Aluminum', 'Glass', 'Material', 'Link']" :key="type">
          <template v-if="rfqsByType[type]?.length">
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
                  ({{ rfqsByType[type]?.length || 0 }})
                </span>
              </div>
            </div>

            <!-- RFQs by Status under this type -->
            <template v-if="!typeCollapsed[type]">
              <template v-for="status in ['Quotation Received', 'Submitted', 'Draft', 'Cancelled']" :key="status">
                <template v-if="getRFQsByTypeAndStatus(type, status)?.length">
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
                        ({{ getRFQsByTypeAndStatus(type, status)?.length || 0 }})
                      </span>
                    </div>
                  </div>

                  <!-- RFQs in this status -->
                  <template v-if="!statusCollapsed[`${type}-${status}`]">
                    <div 
                      v-for="rfq in getRFQsByTypeAndStatus(type, status)" 
                      :key="rfq.name"
                      class="hover:bg-gray-50 transition-colors cursor-pointer min-w-[800px]"
                      @click="navigateToRFQ(rfq)"
                    >
                      <div class="flex items-center px-6 py-3 pl-16">
                        <div class="flex-1 grid grid-cols-5 gap-4">
                          <!-- Party -->
                          <div class="flex items-center gap-2">
                            <Avatar
                              v-if="getPartyData(rfq.party)?.image"
                              :image="getPartyData(rfq.party)?.image"
                              size="sm"
                              shape="circle"
                            />
                            <span class="text-sm text-gray-900">{{ rfq.party }}</span>
                          </div>
                          <!-- Date -->
                          <div class="text-sm text-gray-600 flex items-center">
                            {{ new Date(rfq.date).toLocaleDateString('en-AE') }}
                          </div>
                          <!-- Type -->
                          <div class="text-sm text-gray-600 flex items-center">
                            {{ rfq.type }}
                          </div>
                          <!-- Status -->
                          <div class="flex items-center">
                            <Badge
                              :variant="getStatusVariant(rfq.status) === 'gray' ? 'solid' : 'subtle'"
                              :theme="getStatusVariant(rfq.status)"
                            >
                              {{ rfq.status }}
                            </Badge>
                          </div>
                          <!-- Additional Info -->
                          <div class="flex items-center">
                            <div 
                              v-if="rfq.status === 'Quotation Received' && rfq.quotation_file" 
                              class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                              @click="openQuotationFile(rfq.quotation_file, $event)"
                            >
                              <FeatherIcon name="file-text" class="w-4 h-4" />
                              View Quotation
                            </div>
                            <div 
                              v-if="rfq.status === 'Cancelled' && rfq.remarks" 
                              class="text-sm text-gray-600 italic"
                            >
                              {{ rfq.remarks }}
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
          v-if="!filteredRFQs.length" 
          class="flex flex-col items-center justify-center py-12 min-w-[800px]"
        >
          <FeatherIcon 
            name="help-circle" 
            class="w-12 h-12 text-gray-400 mb-4" 
          />
          <p class="text-base font-medium text-gray-900">No RFQs Found</p>
          <p class="text-sm text-gray-600">There are no RFQs created yet.</p>
        </div>
      </div>
    </div>

    <!-- New RFQ Dialog -->
    <NewRFQDialog
      v-model="showNewRFQDialog"
      :projectResource="projectResource"
      @submit="handleRFQSubmit"
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
import { hasRole } from '@/data/roles'
import { rfqResource } from '@/data/rfq'
import { formatDate } from '@/utils/format'
import NewRFQDialog from './NewRFQDialog.vue'
import { partyResource } from '@/data/party'

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
  Aluminum: false,
  Glass: false,
  Material: false,
  Link: false
})

const statusCollapsed = ref({})
const showNewRFQDialog = ref(false)

// Role-based access control
const isManager = hasRole('RUA Project Manager')

// Computed
const filteredRFQs = computed(() => {
  return rfqResource.data?.filter(rfq => rfq.project === props.projectResource.doc?.name) || []
})

const rfqsByType = computed(() => {
  if (!filteredRFQs.value?.length) return {}
  
  return filteredRFQs.value.reduce((acc, rfq) => {
    const type = rfq.type || 'Material'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(rfq)
    return acc
  }, {})
})

// Methods
function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'submitted':
      return 'blue'
    case 'quotation received':
      return 'green'
    case 'cancelled':
      return 'red'
    default:
      return 'gray'
  }
}

function getRFQsByTypeAndStatus(type, status) {
  return rfqsByType.value[type]?.filter(rfq => rfq.status === status) || []
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

function navigateToRFQ(rfq) {
  router.push({
    name: 'RFQDetails',
    params: {
      id: props.projectResource.doc.name,
      rfqId: rfq.name
    }
  })
}

function handleNewRFQ() {
  showNewRFQDialog.value = true
}

async function handleRFQSubmit(formData) {
  try {
    const response = await rfqResource.insert.submit({
      project: props.projectResource.doc.name,
      date: formData.date,
      party: formData.party.name,
      type: formData.type,
      link: formData.link,
      doctype: 'RUA RFQ'
    })
    
    showNewRFQDialog.value = false

    // Navigate to the new RFQ
    if (response?.name) {
      router.push({
        name: 'RFQDetails',
        params: {
          id: props.projectResource.doc.name,
          rfqId: response.name
        }
      })
    }
  } catch (error) {
    console.error('Failed to create RFQ:', error)
  }
}

function openQuotationFile(url, event) {
  event.preventDefault()
  event.stopPropagation()
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>