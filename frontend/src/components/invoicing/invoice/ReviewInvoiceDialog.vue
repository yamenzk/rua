# ReviewInvoiceDialog.vue
<template>
  <Dialog
    v-model="show"
    :options="dialogOptions"
  >
    <template #body-content>
      <div class="space-y-6">
        <div class="bg-gray-50 rounded-lg p-4 space-y-4">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-gray-500">Date</label>
              <div class="text-sm font-medium text-gray-900">
                {{ formatDate(invoiceData.date, DATE_FORMATS.UAE) }}
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-500">Type</label>
              <div class="text-sm font-medium text-gray-900">
                {{ invoiceData.type }}
              </div>
            </div>
          </div>

          <!-- Amount Breakdown -->
          <div class="pt-4 border-t space-y-3">
            <h4 class="text-sm font-medium text-gray-900">Amount Breakdown</h4>
            
            <!-- Original Amount -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Amount{{ invoiceData.is_vat_inclusive ? ' (VAT Inclusive)' : '' }}</span>
              <span class="text-sm font-medium text-gray-900">
                {{ formatCurrency(originalAmount) }}
              </span>
            </div>

            <template v-if="invoiceData.is_vat_inclusive">
              <div class="flex justify-between items-center text-blue-600">
                <span class="text-sm">Less: VAT (5%)</span>
                <span class="text-sm font-medium">
                  -{{ formatCurrency(originalAmount - netAmount) }}
                </span>
              </div>
              
              <div class="flex justify-between items-center font-medium">
                <span class="text-sm text-gray-600">Amount Before VAT</span>
                <span class="text-sm text-gray-900">
                  {{ formatCurrency(netAmount) }}
                </span>
              </div>
            </template>

            <!-- Retention (if enabled) -->
            <template v-if="invoiceData.retention_enabled">
              <div class="flex justify-between items-center text-red-600">
                <span class="text-sm">Less: Retention ({{ invoiceData.retention_percentage }}%)</span>
                <span class="text-sm font-medium">
                  -{{ formatCurrency(retentionAmount) }}
                </span>
              </div>
              
              <div class="flex justify-between items-center font-medium">
                <span class="text-sm text-gray-600">Amount After Retention</span>
                <span class="text-sm text-gray-900">
                  {{ formatCurrency(amountAfterRetention) }}
                </span>
              </div>
            </template>

            <!-- VAT -->
            <div class="flex justify-between items-center text-blue-600">
              <span class="text-sm">Add: VAT (5%)</span>
              <span class="text-sm font-medium">
                +{{ formatCurrency(vatAmount) }}
              </span>
            </div>

            <!-- Grand Total -->
            <div class="pt-2 border-t flex justify-between items-center">
              <span class="text-sm font-medium text-gray-900">Grand Total</span>
              <span class="text-base font-medium text-gray-900">
                {{ formatCurrency(grandTotal) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Dialog } from 'frappe-ui'
import { formatDate, formatCurrency, DATE_FORMATS } from '@/utils/format'

const props = defineProps({
  modelValue: Boolean,
  invoiceData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Computed values for amount breakdown
const netAmount = computed(() => {
  return props.invoiceData.amount // This is already VAT exclusive from NewInvoiceDialog
})

const retentionAmount = computed(() => {
  if (!props.invoiceData.retention_enabled) return 0
  return (netAmount.value * props.invoiceData.retention_percentage) / 100
})

const amountAfterRetention = computed(() => {
  return netAmount.value - retentionAmount.value
})

const vatAmount = computed(() => {
  return amountAfterRetention.value * 0.05
})

const grandTotal = computed(() => {
  return amountAfterRetention.value + vatAmount.value
})

const originalAmount = computed(() => {
  // For display purposes only, show the amount as the user entered it
  if (props.invoiceData.is_vat_inclusive) {
    return props.invoiceData.amount * 1.05 // Convert back to VAT inclusive for display
  }
  return props.invoiceData.amount // Show VAT exclusive amount as entered
})

const dialogOptions = computed(() => ({
  title: 'Review Invoice',
  size: 'md',
  actions: [
    {
      label: 'Create Invoice',
      variant: 'solid',
      onClick: handleSubmit
    }
  ]
}))

function handleSubmit() {
  const submitData = {
    ...props.invoiceData,
    amount_after_retention: amountAfterRetention.value,
    vat_after_retention: vatAmount.value,
    grand_total: grandTotal.value,
    naming_series: props.invoiceData.type === 'Proforma' ? 'RC-PRO-.YY.' : 'RC-INV-.YY.'
  }
  emit('submit', submitData)
  show.value = false
}
</script>