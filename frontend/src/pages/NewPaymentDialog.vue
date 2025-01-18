# NewPaymentDialog.vue
<template>
  <Dialog
    v-model="show"
    :options="dialogOptions"
  >
    <template #body-content>
      <div class="space-y-6">
        <!-- Party Selection -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Party</label>
          <div class="relative">
            <Autocomplete
              v-model="formData.party"
              :options="partyOptions"
              placeholder="Select a party"
            >
              <template #prefix v-if="selectedParty">
                <Avatar
                  v-if="selectedParty.image"
                  :image="selectedParty.image"
                  size="xs"
                  shape="circle"
                  class="mr-2"
                />
                <div v-else class="w-4 h-4 mr-2 rounded-full bg-gray-200 flex items-center justify-center">
                  <FeatherIcon name="user" class="w-3 h-3 text-gray-500" />
                </div>
              </template>
              <template #item-prefix="{ option }">
                <Avatar
                  v-if="option.image"
                  :image="option.image"
                  size="xs"
                  shape="circle"
                  class="mr-2"
                />
                <div v-else class="w-4 h-4 mr-2 rounded-full bg-gray-200 flex items-center justify-center">
                  <FeatherIcon name="user" class="w-3 h-3 text-gray-500" />
                </div>
              </template>
            </Autocomplete>
          </div>
        </div>

        <!-- Amount Input -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Amount</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span class="text-gray-500 sm:text-sm">AED</span>
            </div>
            <input
              type="number"
              v-model.number="formData.amount"
              class="block w-full rounded-md border-gray-300 pl-12 pr-4 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              placeholder="0.00"
              step="0.01"
              @input="validateAmount"
            />
          </div>
          <p v-if="amountError" class="mt-1 text-sm text-red-600">
            {{ amountError }}
          </p>
        </div>

        <!-- Optional Fields -->
        <div class="space-y-4">
          <!-- Bank -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Bank (Optional)</label>
            <input
              type="text"
              v-model="formData.bank"
              class="mt-1 block w-full rounded-md border-gray-300 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              placeholder="Enter bank name"
            />
          </div>

          <!-- Reference Number -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Reference Number (Optional)</label>
            <input
              type="text"
              v-model="formData.reference_no"
              class="mt-1 block w-full rounded-md border-gray-300 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              placeholder="Enter reference number"
            />
          </div>

          <!-- Remarks -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
            <textarea
              v-model="formData.remarks"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              placeholder="Add any additional notes"
            ></textarea>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Dialog,
  Avatar,
  Autocomplete,
  FeatherIcon
} from 'frappe-ui'
import { partyResource } from '@/data/party'

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

// State
const amountError = ref('')
const formData = ref({
  date: new Date().toISOString().split('T')[0],
  party: '',
  amount: null,
  bank: '',
  reference_no: '',
  remarks: ''
})

// Computed Properties
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const partyOptions = computed(() => {
  const excludedTypes = [
    'Supplier: Aluminum', 
    'Supplier: Cladding', 
    'Supplier: Glass', 
    'Client', 
    'Consultant'
  ]

  return (partyResource.data || [])
    .filter(party => !excludedTypes.includes(party.type))
    .map(party => ({
      label: `${party.name}`,
      value: party.name,
      image: party.image
    }))
})

const selectedParty = computed(() => {
  if (!formData.value.party) return null
  return partyResource.data?.find(p => p.name === formData.value.party)
})

const dialogOptions = computed(() => ({
  title: 'New Petty Cash Payment',
  size: 'xl',
  actions: [
    {
      label: 'Create',
      variant: 'solid',
      loading: false,
      onClick: handleSubmit,
      disabled: !isFormValid.value
    }
  ]
}))

const isFormValid = computed(() => {
  return formData.value.party && 
         formData.value.amount > 0 &&
         !amountError.value
})

// Methods
function validateAmount() {
  amountError.value = ''
  
  if (formData.value.amount < 0) {
    amountError.value = 'Amount cannot be negative'
    return false
  }

  return true
}

function resetForm() {
  formData.value = {
    date: new Date().toISOString().split('T')[0],
    party: '',
    amount: null,
    bank: '',
    reference_no: '',
    remarks: ''
  }
  amountError.value = ''
}

function handleSubmit() {
  if (!isFormValid.value) return

  // Create a new object with the processed party value
  const processedFormData = {
    ...formData.value,
    party: formData.value.party?.value || formData.value.party // Take the value if it's an object, otherwise use as is
  }

  const submitData = {
    ...processedFormData,
    project: props.projectResource.doc.name,
    type: 'Pay: Petty Cash',
    naming_series: 'RC-PTY-.YY.',
    status: 'Draft'
  }

  emit('submit', submitData)
  resetForm()
}

// Watch for dialog close to reset form
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>