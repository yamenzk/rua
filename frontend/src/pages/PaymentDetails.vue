# PaymentDetails.vue
<template>
  <!-- Loading State -->
  <div v-if="!paymentResource?.doc || paymentResource?.loading" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>

  <div v-else-if="paymentResource.error" class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <FeatherIcon name="alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p class="text-gray-600">Failed to load payment details</p>
    </div>
  </div>

  <div v-else>
    <!-- Document Header -->
    <div class="sticky top-0 z-10 bg-white border-b">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-4">
          <!-- Back Button -->
          <Button @click="router.push(`/project/${projectResource.doc.name}/invoicing/payments`)">
            <template #prefix>
              <FeatherIcon name="arrow-left" class="w-4 h-4" />
            </template>
            <span class="hidden md:inline">Back to Payments</span>
          </Button>

          <!-- Document Info -->
          <div class="flex flex-col">
            <h1 class="text-xl font-bold text-gray-900">
              {{ paymentResource.doc.name }}
            </h1>
            <p class="text-sm text-gray-600 hidden md:inline">
              Created on {{ formatDate(paymentResource.doc.creation) }} by {{ paymentResource.doc.owner }}
            </p>
          </div>
        </div>

        <!-- Status Badge -->
        <Badge
          :variant="paymentResource.doc.status === 'Final' ? 'solid' : 'subtle'"
          :theme="getStatusVariant(paymentResource.doc.status)"
          class="cursor-pointer"
          @click="showStatusDialog = true"
        >
          {{ paymentResource.doc.status }}
        </Badge>
      </div>
    </div>

    <!-- Draft Warning Banner -->
    <div v-if="paymentResource.doc.status === 'Draft'" class="bg-orange-50 px-6 py-4 mt-4">
      <div class="flex items-start rounded-lg">
        <div class="flex-shrink-0">
          <FeatherIcon name="alert-triangle" class="h-5 w-5 text-orange-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-orange-800">Draft Payment</h3>
          <div class="mt-2 text-sm text-orange-700">
            This payment is still in draft status. Please submit it to process the payment.
          </div>
          <div class="mt-4">
            <Button
              variant="solid"
              theme="orange"
              size="sm"
              @click="showStatusDialog = true"
            >
              Submit Payment
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-8 px-6 py-4">
      <!-- Summary Card -->
      <div class="bg-white rounded-lg border shadow-sm">
        <!-- Party Information -->
        <div class="p-6 border-b">
          <div class="flex items-start space-x-4">
            <!-- Party Image -->
            <div class="flex-shrink-0 align-center align-middle self-center">
              <Avatar
                v-if="partyData?.image"
                :image="partyData.image"
                size="lg"
                shape="circle"
              />
              <div v-else class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <FeatherIcon name="user" class="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <!-- Details Grid -->
            <div class="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-600">Party</label>
                <p class="mt-1 text-sm text-gray-900">{{ paymentResource.doc.party }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Type</label>
                <p class="mt-1 text-sm text-gray-900">{{ paymentResource.doc.type }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Bank</label>
                <p class="mt-1 text-sm text-gray-900">{{ paymentResource.doc.bank || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Date</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(paymentResource.doc.date) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Amount Information -->
        <div class="px-6 py-8 border-b">
          <label class="text-sm font-medium text-gray-600">Amount</label>
          <div class="mt-2">
            <span class="text-3xl font-semibold text-gray-900">
              {{ formatCurrency(paymentResource.doc.amount) }}
            </span>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
          <!-- Related Document -->
          <div class="p-6">
            <label class="text-sm font-medium text-gray-600">Related Document</label>
            <div class="mt-2">
              <Button 
                v-if="paymentResource.doc.related_doctype && paymentResource.doc.related_docname"
                variant="link"
                @click="navigateToRelatedDoc"
                class="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <span class="flex items-center"><FeatherIcon :name="relatedDocIcon" class="w-4 h-4" />{{ relatedDocLabel }}</span>
              </Button>
              <span v-else class="text-sm text-gray-500">No related document</span>
            </div>
          </div>

          <!-- Reference Number -->
          <div class="p-6">
            <label class="text-sm font-medium text-gray-600">Reference Number</label>
            <div class="mt-2">
              <span class="text-sm text-gray-900">
                {{ paymentResource.doc.reference_no || '-' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Remarks -->
        <div v-if="paymentResource.doc.remarks && paymentResource.doc.status !== 'Cancelled'" class="p-6 border-b">
          <label class="text-sm font-medium text-gray-600">Remarks</label>
          <div class="mt-2 text-sm text-gray-900">
            {{ paymentResource.doc.remarks }}
          </div>
        </div>

        <!-- Cancellation Notice -->
        <div
          v-if="paymentResource.doc.status === 'Cancelled'"
          class="p-6 bg-red-50"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <FeatherIcon name="alert-circle" class="w-5 h-5 text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Cancellation Remarks</h3>
              <div class="mt-2 text-sm text-red-700">
                {{ paymentResource.doc.remarks }}
              </div>
            </div>
          </div>
        </div>

        <!-- Last Modified -->
        <div v-if="paymentResource.doc.modified_by" class="px-6 py-3 bg-gray-50 text-sm text-gray-600">
          Last modified: {{ formatDate(paymentResource.doc.modified) }} by {{ paymentResource.doc.modified_by }}
        </div>
      </div>
    </div>
  </div>

  <!-- Status Dialog -->
  <Dialog
    v-model="showStatusDialog"
    :options="statusDialogOptions"
  >
    <template #body-content>
      <div class="space-y-4">
        <label class="block text-sm font-medium text-gray-700">
          {{ getDialogTitle }}
        </label>

        <!-- Payment Confirmation -->
        <div v-if="paymentResource.doc.status === 'Draft'" class="space-y-4">
          <div class="text-sm text-gray-600">
            To submit this payment, please confirm the payment amount below:
          </div>
          <div class="relative">
            <input
              v-model="confirmationAmount"
              type="number"
              step="0.01"
              class="block w-full rounded-md shadow-sm sm:text-sm"
              :class="{
                'border-gray-300 focus:border-gray-900 focus:ring-gray-900': !confirmationAmount,
                'border-red-300 focus:border-red-500 focus:ring-red-500': confirmationAmount && !isSubmitEnabled,
                'border-green-300 focus:border-green-500 focus:ring-green-500': isSubmitEnabled
              }"
              :placeholder="paymentResource.doc.amount"
            />
            <div 
              v-if="confirmationAmount && !isSubmitEnabled"
              class="mt-1 text-sm text-red-600"
            >
              Amount does not match payment amount
            </div>
          </div>
        </div>

        <!-- Cancellation Reason -->
        <div v-if="canBeCancelled">
          <Textarea
            v-model="cancellationReason"
            label="Cancellation Reason"
            placeholder="Please provide a reason for cancellation"
            variant="outline"
            size="sm"
            class="w-full"
          />
        </div>

        <!-- Error Message -->
        <div v-if="statusError" class="text-sm text-red-500 mt-1">
          {{ statusError }}
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createPaymentResource } from '@/data/payment'
import { 
  Button,
  Badge,
  Dialog,
  Textarea,
  FeatherIcon,
  LoadingIndicator
} from 'frappe-ui'
import { partyResource } from '@/data/party'
import { formatDate, formatCurrency } from '@/utils/format'

const props = defineProps({
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'doc' in value
    }
  }
})

const isSubmitEnabled = computed(() => {
  const currentDoc = paymentResource.value?.doc
  if (currentDoc?.status !== 'Draft') return true
  return confirmationAmount.value && parseFloat(confirmationAmount.value) === currentDoc.amount
})

const route = useRoute()
const router = useRouter()

// State Management
const paymentResource = ref(null)
const showStatusDialog = ref(false)
const newStatus = ref('')
const statusError = ref('')
const confirmationAmount = ref('')
const cancellationReason = ref('')
const isUpdatingStatus = ref(false)

// Computed Properties
const partyData = computed(() => {
  return partyResource.data?.find(p => p.name === paymentResource.value?.doc?.party)
})

const canBeCancelled = computed(() => 
  paymentResource.value?.doc?.status === 'Submitted'
)

const getDialogTitle = computed(() => {
  const status = paymentResource.value?.doc?.status
  if (status === 'Draft') return 'Submit Payment'
  if (status === 'Submitted') return 'Cancel Payment'
  return 'Payment Status'
})

const statusDialogOptions = computed(() => ({
  title: getDialogTitle.value,
  size: 'sm',
  actions: [
    {
      label: paymentResource.value?.doc?.status === 'Draft' ? 'Submit Payment' : 'Cancel Payment',
      loading: isUpdatingStatus.value,
      variant: 'solid',
      onClick: updateStatus,
      disabled: paymentResource.value?.doc?.status === 'Cancelled' || 
               (paymentResource.value?.doc?.status === 'Draft' && !isSubmitEnabled.value)
    }
  ]
}))

const relatedDocIcon = computed(() => {
  const doctype = paymentResource.value?.doc?.related_doctype
  switch (doctype) {
    case 'RUA LPO':
      return 'shopping-cart'
    case 'RUA Invoice':
      return 'file-text'
    default:
      return 'link'
  }
})

const relatedDocLabel = computed(() => {
  const doc = paymentResource.value?.doc
  if (!doc?.related_doctype || !doc?.related_docname) return ''

  switch (doc.related_doctype) {
    case 'RUA LPO':
      return `${doc.related_docname}`
    case 'RUA Invoice':
      return `${doc.related_docname}`
    default:
      return `${doc.related_docname}`
  }
})

// Methods
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


function resetStatusDialog() {
  showStatusDialog.value = false
  newStatus.value = ''
  statusError.value = ''
  confirmationAmount.value = ''
  cancellationReason.value = ''
}

async function updateStatus() {
  statusError.value = ''
  const currentDoc = paymentResource.value.doc

  if (currentDoc.status === 'Draft') {
    // Handle submission
    if (!confirmationAmount.value) {
      statusError.value = 'Please enter the payment amount'
      return
    }

    if (parseFloat(confirmationAmount.value) !== currentDoc.amount) {
      statusError.value = 'The confirmation amount does not match the payment amount'
      return
    }

    newStatus.value = 'Submitted'
  } else if (currentDoc.status === 'Submitted') {
    // Handle cancellation
    if (!cancellationReason.value.trim()) {
      statusError.value = 'Please provide a cancellation reason'
      return
    }

    newStatus.value = 'Cancelled'
  } else {
    return // No other transitions allowed
  }

  try {
    isUpdatingStatus.value = true
    const updateData = {
      name: currentDoc.name,
      status: newStatus.value,
    }

    if (newStatus.value === 'Cancelled') {
      updateData.remarks = cancellationReason.value
    }

    await paymentResource.value.setValue.submit(updateData)
    await paymentResource.value.reload()
    resetStatusDialog()
  } catch (error) {
    statusError.value = 'Failed to update status'
    console.error('Error updating payment status:', error)
  } finally {
    isUpdatingStatus.value = false
  }
}

function navigateToRelatedDoc() {
  const doc = paymentResource.value?.doc
  if (!doc?.related_doctype || !doc?.related_docname) return

  const routeMap = {
    'RUA LPO': {
      name: 'LPODetails',
      params: {
        id: props.projectResource.doc.name,
        lpoId: doc.related_docname
      }
    },
    'RUA Invoice': {
      name: 'InvoiceDetails',
      params: {
        id: props.projectResource.doc.name,
        invoiceId: doc.related_docname
      }
    }
  }

  const route = routeMap[doc.related_doctype]
  if (route) {
    router.push(route)
  }
}


onMounted(() => {
  initializePaymentResource()
})

function initializePaymentResource() {
  if (route.params.paymentId) {
    paymentResource.value = createPaymentResource(route.params.paymentId)
  }
}

// Watch for route changes
watch(() => route.params.paymentId, (newId) => {
  if (newId) {
    paymentResource.value = createPaymentResource(newId)
  }
})

</script>