# NewLPODialog.vue
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

        <!-- Vendor Selection -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Vendor</label>
          <div class="relative">
            <Combobox v-model="formData.vendor">
              <div class="relative">
                <ComboboxInput
                  :display-value="(party) => party?.name || ''"
                  class="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm leading-5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @change="query = $event.target.value"
                  placeholder="Select a vendor"
                />
                <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                  <FeatherIcon name="chevron-down" class="h-4 w-4 text-gray-400" />
                </ComboboxButton>
              </div>
              <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <div v-if="filteredVendors.length === 0" class="relative cursor-default select-none py-2 px-4 text-gray-700">
                  No vendors found.
                </div>
                <ComboboxOption
                  v-for="vendor in filteredVendors"
                  :key="vendor.name"
                  :value="vendor"
                  v-slot="{ selected, active }"
                >
                  <div :class="['relative cursor-pointer select-none py-2 px-4', active ? 'bg-blue-50' : '']">
                    <div class="flex items-center">
                      <Avatar
                        v-if="vendor.image"
                        :image="vendor.image"
                        size="sm"
                        shape="circle"
                        class="mr-2"
                      />
                      <span :class="['block truncate', selected ? 'font-semibold' : '']">
                        {{ vendor.name }}
                      </span>
                    </div>
                    <span v-if="vendor.type" class="text-xs text-gray-500">
                      {{ vendor.type }}
                    </span>
                  </div>
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          </div>
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
                  ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-600'
                  : 'bg-white text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50'
              ]"
              @click="formData.type = type"
            >
              {{ type }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Dialog, Button, DatePicker, Avatar, FeatherIcon } from 'frappe-ui'
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/vue'
import { formatDate } from '@/utils/format'

const props = defineProps({
  modelValue: Boolean,
  projectResource: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// State
const query = ref('')
const formData = ref({
  date: new Date().toISOString().split('T')[0],
  vendor: null,
  type: ''
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
      label: 'Cancel',
      variant: 'subtle',
      onClick: () => {
        show.value = false
      }
    },
    {
      label: 'Create',
      loading: false,
      onClick: handleSubmit,
      disabled: !isFormValid.value
    }
  ]
}))

const vendors = computed(() => {
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

const filteredVendors = computed(() => {
  return query.value === ''
    ? vendors.value
    : vendors.value.filter((vendor) =>
        vendor.name
          .toLowerCase()
          .includes(query.value.toLowerCase())
      )
})

const isFormValid = computed(() => {
  return formData.value.date && 
         formData.value.vendor && 
         formData.value.type
})

// Methods
function handleSubmit() {
  if (!isFormValid.value) return
  emit('submit', formData.value)
}
</script>