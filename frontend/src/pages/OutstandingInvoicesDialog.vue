<template>
    <Dialog 
      v-model="show" 
      :options="{
        title: 'Outstanding Invoices',
        size: '3xl'
      }"
    >
      <template #body-content>
        <div v-if="!unpaidInvoices.length" class="text-center py-8 text-gray-500">
          No outstanding invoices
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="invoice in unpaidInvoices" 
            :key="invoice.name"
            class="bg-white rounded-lg border p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="navigateToInvoice(invoice)"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="text-sm font-medium text-gray-900">
                  {{ invoice.party }} - {{ invoice.name }}
                </div>
                <div class="text-sm text-gray-500">
                  Project: {{ getProjectName(invoice.project) }}
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <div class="text-sm font-bold text-gray-900">
                  {{ formatCurrency(invoice.amount) }}
                </div>
                
                <Badge 
                  :theme="getPaymentStatusTheme(invoice.payment_status)" 
                  variant="subtle"
                >
                  {{ invoice.payment_status }}
                </Badge>
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
  import { useRouter } from 'vue-router'
  import { invoiceResource } from '@/data/invoice'
  import { projectResource } from '@/data/project'
  
  const router = useRouter()
  
  const props = defineProps({
    modelValue: Boolean
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  const unpaidInvoices = computed(() => {
    return invoiceResource.data?.filter(invoice => 
      invoice.status === 'Final' && 
      (invoice.payment_status === 'Unpaid' || invoice.payment_status === 'Partially Paid')
    ) || []
  })

  
  function getProjectName(projectId) {
    return projectResource.data?.find(p => p.name === projectId)?.project_name || projectId
  }
  
  function formatCurrency(value) {
    if (!value) return 'AED 0'
    return `AED ${Math.floor(value).toLocaleString()}`
  }
  
  function getPaymentStatusTheme(status) {
    switch (status) {
      case 'Unpaid':
        return 'red'
      case 'Partially Paid':
        return 'orange'
      default:
        return 'gray'
    }
  }
  
  function navigateToInvoice(invoice) {
    router.push(`/project/${invoice.project}/invoicing/invoice/${invoice.name}`)
    show.value = false
  }
  </script>