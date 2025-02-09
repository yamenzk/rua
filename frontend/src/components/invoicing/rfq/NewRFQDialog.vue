<template>
  <Dialog
    v-model="show"
    :options="dialogOptions"
  >
    <template #body-content>
      <div class="space-y-6">
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

        <!-- Party Selection -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Party</label>
          <CustomAutocomplete
            v-model="formData.party"
            :options="partyOptions"
            placeholder="Select a party"
          >
            <template #item-prefix="{ option }">
              <Avatar
                v-if="option.image"
                :image="option.image"
                size="sm"
                shape="circle"
                class="mr-2"
              />
            </template>
            <template #item="{ option }">
              <div class="flex flex-col">
                <span class="block truncate">{{ option.label }}</span>
                <span v-if="option.type" class="text-xs text-gray-500">
                  {{ option.type }}
                </span>
              </div>
            </template>
          </CustomAutocomplete>
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
import { Dialog, FormControl, Avatar } from 'frappe-ui'
import CustomAutocomplete from '@/components/common/CustomAutocomplete.vue'
import { getServerDate } from '@/utils/format'

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

const partyOptions = computed(() => {
  try {
    const parties = props.projectResource.doc?.parties ? 
      (typeof props.projectResource.doc.parties === 'string' ? 
        JSON.parse(props.projectResource.doc.parties) : 
        props.projectResource.doc.parties
      ) : []
    
    return parties
      .filter(party => party.type.toLowerCase().includes('supplier'))
      .map(party => ({
        value: party.name,
        label: party.name,
        type: party.type,
        image: party.image
      }))
  } catch (error) {
    console.error('Error parsing parties:', error)
    return []
  }
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