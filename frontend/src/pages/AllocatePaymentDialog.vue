<template>
    <Dialog 
      v-model="show" 
      :options="{
        title: 'Allocate Payment to Invoice',
        size: 'xl',
        actions: [
          {
            label: 'Allocate',
            variant: 'solid',
            disabled: !selectedPayment,
            loading: isAllocating,
            onClick: allocatePayment
          }
        ]
      }"
    >
      <template #body-content>
        <div v-if="unallocatedPayments.length === 0" class="text-center py-8 text-gray-500">
          No unallocated payments available for this project
        </div>
        
        <div v-else class="space-y-4">
          <div class="text-sm text-gray-600 mb-4">
            Select a payment to allocate to this invoice. Only payments with no existing allocation are shown.
          </div>
          
          <div class="grid grid-cols-1 gap-4">
            <div 
              v-for="payment in unallocatedPayments" 
              :key="payment.name"
              class="border rounded-lg p-4 cursor-pointer transition-all duration-200"
              :class="selectedPayment === payment ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'"
              @click="selectPayment(payment)"
            >
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ payment.name }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ formatDate(payment.date) }}
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <div class="text-sm font-semibold text-gray-900">
                    {{ formatCurrency(payment.amount) }}
                  </div>
                  
                  <Badge 
                    :variant="getPaymentStatusVariant(payment.type) === 'gray' ? 'solid' : 'subtle'"
                    :theme="getPaymentStatusVariant(payment.type)"
                  >
                    {{ payment.type }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Dialog>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { Dialog, Badge } from 'frappe-ui'
  import { paymentResource } from '@/data/payment'
  import { formatDate, formatCurrency } from '@/utils/format'
  
  const props = defineProps({
    modelValue: Boolean,
    invoiceResource: {
      type: Object,
      required: true
    },
    projectResource: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['update:modelValue', 'paymentAllocated'])
  
  const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  const selectedPayment = ref(null)
  const isAllocating = ref(false)
  
  const unallocatedPayments = computed(() => {
  const invoiceParty = props.invoiceResource.doc?.party
  
  return paymentResource.data?.filter(payment => 
    // Payments for this project
    payment.project === props.projectResource.doc.name &&
    // Match invoice party
    payment.party === invoiceParty &&
    // Only submitted payments
    payment.status === 'Submitted' &&
    // No related document
    (!payment.related_doctype || payment.related_doctype === '') &&
    // Only receive type payments
    payment.type === 'Receive'
  ) || []
})
  
  function selectPayment(payment) {
    selectedPayment.value = payment
  }
  
  function getPaymentStatusVariant(type) {
    switch (type) {
      case 'Receive':
        return 'green'
      case 'Pay':
        return 'red'
      default:
        return 'gray'
    }
  }
  
  async function allocatePayment() {
    if (!selectedPayment.value) return
  
    try {
      isAllocating.value = true
      
      // Update the payment to link it to the invoice
      await paymentResource.setValue.submit({
        name: selectedPayment.value.name,
        related_doctype: 'RUA Invoice',
        related_docname: props.invoiceResource.doc.name
      })
  
      // Reload the payment resource to reflect changes
      await paymentResource.reload()
  
      // Emit event to notify parent component
      emit('paymentAllocated')
  
      // Close the dialog
      show.value = false
    } catch (error) {
      console.error('Failed to allocate payment:', error)
    } finally {
      isAllocating.value = false
    }
  }
  </script>