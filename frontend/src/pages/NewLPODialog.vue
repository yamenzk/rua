<template>
  <Dialog
    v-model="show"
    :options="dialogOptions"
  >
    <template #body-content>
      <div class="space-y-6">
        <!-- Date Selection -->
        <DatePicker
          v-model="formData.date"
          label="Date"
          :default-value="formData.date"
          :format="formatDate"
        />

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
                <div>
                  <span class="block">{{ option.label }}</span>
                  <span class="text-xs text-gray-500">{{ option.type }}</span>
                </div>
              </div>
            </template>
          </CustomAutocomplete>
        </div>

        <!-- Type Selection -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Type</label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="type in ['Material', 'Aluminum', 'Glass']"
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

        <!-- Supplier Reference Number -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Supplier Reference Number</label>
          <input
            v-model="formData.supplier_reference_number"
            type="text"
            class="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm leading-5 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="Enter supplier reference number"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Dialog, DatePicker, Avatar } from 'frappe-ui'
import CustomAutocomplete from './CustomAutocomplete.vue'
import { formatDate, getServerDate } from '@/utils/format'

const props = defineProps({
  modelValue: Boolean,
  projectResource: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// State
const formData = ref({
  date: getServerDate(),
  party: '',
  type: '',
  supplier_reference_number: ''
})

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogOptions = computed(() => ({
  title: 'New Purchase Order',
  size: 'md',
  actions: [
    {
      label: 'Create',
      loading: false,
      variant: 'solid',
      onClick: handleSubmit,
      disabled: !isFormValid.value
    }
  ]
}))

const parties = computed(() => {
  try {
    const parties = props.projectResource.doc?.parties ? 
      (typeof props.projectResource.doc.parties === 'string' ? 
        JSON.parse(props.projectResource.doc.parties) : 
        props.projectResource.doc.parties
      ) : []
    
    return parties.filter(party => 
      party.type.toLowerCase().includes('supplier')
    )
  } catch (error) {
    console.error('Error parsing parties:', error)
    return []
  }
})

const partyOptions = computed(() => {
  return parties.value.map(party => ({
    label: party.name,
    value: party.name,
    image: party.image,
    type: party.type
  }))
})

const isFormValid = computed(() => {
  return formData.value.date && 
         formData.value.party && 
         formData.value.type
})

// Methods
function handleSubmit() {
  if (!isFormValid.value) return
  emit('submit', formData.value)
}
</script>