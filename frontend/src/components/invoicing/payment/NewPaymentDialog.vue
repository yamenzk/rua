# NewPaymentDialog.vue
<template>
  <div>
    <Dialog
      v-model="show"
      :options="dialogOptions"
    >
      <template #body-content>
        <div class="space-y-6">
          <!-- Party Selection -->
          <div class="space-y-2">
  <label class="block text-sm font-medium text-gray-700">Party</label>
  <CustomAutocomplete
    v-model="formData.party"
    :options="partyOptions"
    placeholder="Select a party"
  >
    <template #item="{ option }">
      <div class="flex items-center">
        <Avatar
          v-if="option.image"
          :image="option.image"
          size="sm"
          shape="circle"
          class="mr-2"
        />
        <div v-else class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
          <FeatherIcon name="user" class="w-4 h-4 text-gray-500" />
        </div>
        <span>{{ option.label }}</span>
      </div>
    </template>
  </CustomAutocomplete>
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

          <!-- Date Input -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              v-model="formData.date"
              class="block w-full rounded-md border-gray-300 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
            />
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

    <!-- Party Selection Dialog -->
    <Teleport to="body">
      <div v-if="showPartyDialog" class="fixed inset-0 z-[9999]">
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <div 
            class="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
            @click.stop
          >
            <!-- Dialog Header -->
            <div class="px-6 py-4 border-b">
              <h3 class="text-lg font-medium">Select Party</h3>
            </div>

            <!-- Dialog Content -->
            <div class="p-6 space-y-4">
              <!-- Search Input -->
              <div class="relative">
                <FeatherIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  v-model="partySearch"
                  class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                  placeholder="Search parties..."
                />
              </div>

              <!-- Parties List -->
              <div class="space-y-2 max-h-[60vh] overflow-y-auto">
                <button
                  v-for="party in filteredParties"
                  :key="party.value"
                  class="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                  @click="selectParty(party)"
                >
                  <Avatar
                    v-if="party.image"
                    :image="party.image"
                    size="sm"
                    shape="circle"
                  />
                  <div v-else class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <FeatherIcon name="user" class="w-4 h-4 text-gray-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 truncate">{{ party.label }}</div>
                  </div>
                </button>
              </div>

              <!-- Empty State -->
              <div v-if="!filteredParties.length" class="text-center py-8">
                <div class="text-gray-400 mb-2">
                  <FeatherIcon name="users" class="w-6 h-6 mx-auto" />
                </div>
                <p class="text-sm text-gray-600">No parties found</p>
              </div>
            </div>

            <!-- Dialog Footer -->
            <div class="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <Button 
                variant="subtle" 
                @click="showPartyDialog = false"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Dialog,
  Avatar,
  FeatherIcon,
  Button
} from 'frappe-ui'
import { partyResource } from '@/data/party'
import CustomAutocomplete from '@/components/common/CustomAutocomplete.vue'
import { getServerDate } from '@/utils/format'

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
const showPartyDialog = ref(false)
const partySearch = ref('')
const amountError = ref('')
const formData = ref({
  date: getServerDate(),
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
      label: party.name,
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

function openPartySelect() {
  partySearch.value = ''
  showPartyDialog.value = true
}

function selectParty(party) {
  formData.value.party = party.value
  showPartyDialog.value = false
}

function resetForm() {
  formData.value = {
    date: getServerDate(),
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

  const submitData = {
    ...formData.value,
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