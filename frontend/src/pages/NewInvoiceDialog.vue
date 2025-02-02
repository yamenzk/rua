# NewInvoiceDialog.vue
<template>
  <Dialog
    v-model="show"
    :options="dialogOptions"
  >
    <template #body-content>
      <div class="space-y-6">
        <!-- Project Financial Status -->
        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 class="text-sm font-medium text-gray-900">Project Financial Status</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-gray-500">Contract Value</label>
              <div class="text-sm font-medium text-gray-900">
                {{ formatCurrency(projectResource.doc.contract_value) }}
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-500">Total Invoiced</label>
              <div class="text-sm font-medium text-gray-900">
                {{ formatCurrency(projectResource.doc.total_invoiced) }}
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-500">Total Received</label>
              <div class="text-sm font-medium text-gray-900">
                {{ formatCurrency(projectResource.doc.total_received) }}
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-500">Project Completion</label>
              <div class="text-sm font-medium text-gray-900">
                {{ Math.round(projectResource.doc.completion) }}%
              </div>
            </div>
          </div>

          <!-- Available Amount -->
          <div class="pt-2 border-t">
            <label class="text-xs text-gray-500">Available Amount</label>
            <div class="text-sm font-medium text-gray-900">
              {{ formatCurrency(availableAmount) }}
            </div>
          </div>
        </div>

        <!-- Date Selection -->
        <FormControl
          :type="'date'"
          :ref_for="true"
          size="sm"
          variant="subtle"
          :disabled="false"
          label="Date"
          v-model="formData.date"
          :default-value="formData.date"
        />


        <!-- Type Selection -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Type</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="type in ['Tax Invoice', 'Proforma']"
              :key="type"
              type="button"
              :class="[
                'relative rounded-lg px-4 py-3 text-sm font-medium focus:outline-none',
                formData.type === type
                  ? 'bg-gray-50 text-gray-900 ring-2 ring-gray-900'
                  : 'bg-white text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50'
              ]"
              @click="formData.type = type"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <!-- Amount Input Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-medium text-gray-700">Amount</label>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">Amount</span>
              <Switch
                v-model="usePercentage"
                class="relative inline-flex h-6 items-center rounded-full"
              >
                <span class="sr-only">Use Percentage</span>
              </Switch>
              <span class="text-sm text-gray-600">Percentage</span>
            </div>
          </div>

          <!-- Amount Input -->
          <div v-if="!usePercentage">
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span class="text-gray-500 sm:text-sm">AED</span>
              </div>
              <input
                type="number"
                v-model.number="inputAmount"
                class="block w-full rounded-md border-gray-300 pl-12 pr-4 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                placeholder="0.00"
                :max="availableAmount"
                step="0.01"
                @input="handleAmountInput"
              />
            </div>
            <p v-if="amountError" class="mt-1 text-sm text-red-600">
              {{ amountError }}
            </p>
            <p v-if="inputAmount && formData.is_vat_inclusive" class="mt-1 text-sm text-gray-600">
              Amount before VAT: {{ formatCurrency(formData.amount) }}
            </p>
          </div>

          <!-- Percentage Input -->
          <div v-else>
            <div class="relative">
              <input
                type="number"
                v-model.number="completionPercentage"
                class="block w-full rounded-md border-gray-300 pr-8 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                placeholder="0"
                :max="maxAllowedPercentage"
                step="0.01"
                @input="handlePercentageChange"
              />
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span class="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
            <p v-if="percentageError" class="mt-1 text-sm text-red-600">
              {{ percentageError }}
            </p>
            <p v-if="formData.amount" class="mt-1 text-sm text-gray-600">
              Calculated Amount: {{ formatCurrency(formData.amount * 1.05) }}
            </p>
          </div>

          <!-- VAT Inclusive Checkbox -->
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="formData.is_vat_inclusive"
              :disabled="usePercentage"
              :checked="usePercentage"
              size="sm"
              label="VAT Inclusive Amount"
            />
            <span v-if="usePercentage" class="text-xs text-gray-500">(Always VAT inclusive when using percentage)</span>
          </div>
        </div>

        <!-- Retention Settings -->
        <div class="space-y-4 pt-4 border-t">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-medium text-gray-700">Retention Settings</label>
            <Switch
              v-model="formData.retention_enabled"
              class="relative inline-flex h-6 items-center rounded-full"
            >
              <span class="sr-only">Enable Retention</span>
            </Switch>
          </div>

          <div v-if="formData.retention_enabled" class="relative">
            <input
              type="number"
              v-model.number="formData.retention_percentage"
              class="block w-full rounded-md border-gray-300 pr-8 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              placeholder="10"
              min="0"
              max="100"
              step="0.01"
            />
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-gray-500 sm:text-sm">%</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Dialog>

  <!-- Review Dialog -->
  <ReviewInvoiceDialog
    v-if="showReviewDialog"
    v-model="showReviewDialog"
    :invoice-data="formData"
    @submit="handleFinalSubmit"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Dialog, Switch, Checkbox, FormControl } from 'frappe-ui'
import { formatCurrency, getServerDate } from '@/utils/format'
import ReviewInvoiceDialog from './ReviewInvoiceDialog.vue'

const props = defineProps({
  modelValue: Boolean,
  projectResource: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 'doc' in value
    }
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

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

function getClientParty() {
  const parties = getProjectParties()
  return parties.find(party => party.type.toLowerCase() === 'client')
}

// State
const usePercentage = ref(false)
const completionPercentage = ref(null)
const amountError = ref('')
const percentageError = ref('')
const showReviewDialog = ref(false)
const inputAmount = ref(null)

const formData = ref({
  date: getServerDate(),
  type: '',
  amount: null,
  is_vat_inclusive: false,
  retention_enabled: false,
  retention_percentage: 10,
  party: getClientParty()?.name
})

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogOptions = computed(() => ({
  title: 'New Invoice',
  size: 'md',
  actions: [
    {
      label: 'Review',
      variant: 'solid',
      loading: false,
      onClick: handleReview,
      disabled: !isFormValid.value
    }
  ]
}))

const availableAmount = computed(() => {
  return props.projectResource.doc.contract_value - props.projectResource.doc.total_invoiced
})

const currentCompletion = computed(() => {
  return props.projectResource.doc.completion || 0
})

const maxAllowedPercentage = computed(() => {
  return 100 - currentCompletion.value
})

const isFormValid = computed(() => {
  return formData.value.date && 
         formData.value.type && 
         formData.value.amount > 0 &&
         !amountError.value &&
         !percentageError.value
})

// Methods
function handleAmountInput() {
  amountError.value = ''
  
  if (inputAmount.value < 0) {
    amountError.value = 'Amount cannot be negative'
    formData.value.amount = null
    return false
  }

  // Convert input to VAT exclusive amount if needed
  if (formData.value.is_vat_inclusive && inputAmount.value) {
    formData.value.amount = inputAmount.value / 1.05
  } else {
    formData.value.amount = inputAmount.value
  }

  // Validate against available amount (always compare VAT exclusive amounts)
  if (formData.value.amount > availableAmount.value) {
    amountError.value = `Amount cannot exceed ${formatCurrency(availableAmount.value)}`
    formData.value.amount = availableAmount.value
    inputAmount.value = formData.value.is_vat_inclusive ? 
      formData.value.amount * 1.05 : formData.value.amount
    return false
  }

  return true
}

function handlePercentageChange() {
  percentageError.value = ''
  
  if (completionPercentage.value < 0) {
    percentageError.value = 'Percentage cannot be negative'
    return
  }

  if (completionPercentage.value > maxAllowedPercentage.value) {
    percentageError.value = `Percentage cannot exceed ${maxAllowedPercentage.value}%`
    completionPercentage.value = maxAllowedPercentage.value
    return
  }

  // Calculate amount based on percentage
  if (completionPercentage.value) {
    // Contract value is VAT inclusive, so we need to extract VAT first
    const contractValueExclVAT = props.projectResource.doc.contract_value / 1.05
    formData.value.amount = (contractValueExclVAT * completionPercentage.value) / 100
  } else {
    formData.value.amount = null
  }
}

function resetForm() {
  formData.value = {
    date: getServerDate(),
    type: '',
    amount: null,
    is_vat_inclusive: false,
    retention_enabled: false,
    retention_percentage: 10,
    party: getClientParty()?.name
  }
  completionPercentage.value = null
  usePercentage.value = false
  amountError.value = ''
  percentageError.value = ''
  inputAmount.value = null
}

function handleReview() {
  if (!isFormValid.value) return
  show.value = false
  showReviewDialog.value = true
}

function handleFinalSubmit(finalData) {
  emit('submit', finalData)
  resetForm()
  showReviewDialog.value = false
}

// Watch for changes
watch(usePercentage, (newValue) => {
  formData.value.amount = null
  completionPercentage.value = null
  inputAmount.value = null
  amountError.value = ''
  percentageError.value = ''
  
  // If switching to percentage, ensure VAT inclusive is enabled
  if (newValue) {
    formData.value.is_vat_inclusive = true
  }
})

// Watch for VAT inclusive changes
watch(() => formData.value.is_vat_inclusive, (newValue) => {
  if (inputAmount.value) {
    if (newValue) {
      // User switched to VAT inclusive
      formData.value.amount = inputAmount.value / 1.05
    } else {
      // User switched to VAT exclusive
      formData.value.amount = inputAmount.value
    }
  }
})
</script>