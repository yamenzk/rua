# NewRFQDialog.vue
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
          <div class="relative">
            <Combobox v-model="formData.party">
              <div class="relative">
                <ComboboxInput
                  :display-value="(party) => party?.name || ''"
                  class="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm leading-5 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  @change="query = $event.target.value"
                  placeholder="Select a party"
                />
                <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                  <FeatherIcon name="chevron-down" class="h-4 w-4 text-gray-400" />
                </ComboboxButton>
              </div>
              <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <div v-if="filteredParties.length === 0" class="relative cursor-default select-none py-2 px-4 text-gray-700">
                  No parties found.
                </div>
                <ComboboxOption
                  v-for="party in filteredParties"
                  :key="party.name"
                  :value="party"
                  v-slot="{ selected, active }"
                >
                  <div :class="['relative cursor-pointer select-none py-2 px-4', active ? 'bg-gray-50' : '']">
                    <div class="flex items-center">
                      <Avatar
                        v-if="party.image"
                        :image="party.image"
                        size="sm"
                        shape="circle"
                        class="mr-2"
                      />
                      <span :class="['block truncate', selected ? 'font-semibold' : '']">
                        {{ party.name }}
                      </span>
                    </div>
                    <span v-if="party.type" class="text-xs text-gray-500">
                      {{ party.type }}
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
          <div class="grid grid-cols-4 gap-3">
            <button
              v-for="type in ['Material', 'Aluminum', 'Glass', 'Link']"
              :key="type"
              type="button"
              :class="[
                'relative rounded-lg px-4 py-3 text-sm font-medium focus:outline-none',
                formData.type === type
                  ? 'bg-gray-50 text-gray-900 ring-2 ring-gray-900'
                  : 'bg-white text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50'
              ]"
              @click="handleTypeSelect(type)"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <!-- Link URL Input (only shown when type is Link) -->
        <div v-if="formData.type === 'Link'" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">URL</label>
          <input
            type="url"
            v-model="formData.link"
            class="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="Enter the RFQ URL"
          />
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
  party: null,
  type: '',
  link: ''
})

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogOptions = computed(() => ({
  title: 'New Request for Quotation',
  size: 'md',
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

const filteredParties = computed(() => {
  return query.value === ''
    ? parties.value
    : parties.value.filter((party) =>
        party.name
          .toLowerCase()
          .includes(query.value.toLowerCase())
      )
})

const isFormValid = computed(() => {
  const hasBasicInfo = formData.value.date && 
                      formData.value.party && 
                      formData.value.type

  if (formData.value.type === 'Link') {
    return hasBasicInfo && isValidUrl(formData.value.link)
  }

  return hasBasicInfo
})

// Methods
function isValidUrl(string) {
  if (!string) return false
  
  // Trim whitespace
  const url = string.trim()
  
  // Empty strings are not valid
  if (url.length === 0) return false
  
  // If it's a valid URL with protocol, return true
  try {
    new URL(url)
    return true
  } catch (_) {
    // If URL creation fails, check other valid formats
  }

  // Check for common patterns without protocol
  // - www.example.com
  // - example.com/path
  // - internal.network/share
  // - //networkshare/path
  // - file paths
  const patterns = [
    /^www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/, // www.example.com
    /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/, // example.com
    /^\/\/[a-zA-Z0-9-./]+/, // //networkshare/path
    /^[a-zA-Z]:\\/, // Windows file paths
    /^\/[a-zA-Z0-9-./]+/, // Unix-like paths
  ]

  return patterns.some(pattern => pattern.test(url))
}

function handleTypeSelect(type) {
  formData.value.type = type
  if (type !== 'Link') {
    formData.value.link = ''
  }
}

function handleSubmit() {
  if (!isFormValid.value) return

  const submitData = {
    ...formData.value
  }

  // If type is Link, set the initial status to Submitted
  if (formData.value.type === 'Link') {
    submitData.status = 'Submitted'
  }

  emit('submit', submitData)
}
</script>