# QuotationDialog.vue
<template>
  <Dialog v-model="showDialog" :options="dialogOptions">
    <template #body-content>
      <div class="space-y-6">
        <!-- Step Indicator -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-around">
            <div 
              v-for="(step, index) in ['Party & Date', 'Specifications', 'Scope', 'Notes', 'Review']" 
              :key="step"
              class="flex items-center space-x-2"
              :class="currentStep === index ? 'text-gray-900' : 'text-gray-500'"
            >
              <span 
                class="relative flex h-7 w-7 items-center justify-center rounded-full border-2"
                :class="currentStep === index ? 'text-white bg-gray-900 bg-gray-200' : 'border-gray-300 bg-white'"
              >
                {{ index + 1 }}
              </span>
              <span class="font-medium text-sm">{{ step }}</span>
            </div>
          </div>
        </div>

        <!-- Step 1: Party & Date Selection -->
        <div v-if="currentStep === 0" class="space-y-6">
          <div class="space-y-4">
            <h3 class="text-sm font-medium text-gray-700">Select Party</h3>
            <div class="grid grid-cols-1 gap-4">
              <div v-for="party in availableParties" :key="party.name" 
                class="border border-2 rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition-colors"
                :class="{'border-gray-900 bg-gray-100': formData.selectedParty?.name === party.name}"
                @click="selectParty(party)"
              >
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div v-if="party.image" class="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        :src="party.image" 
                        :alt="party.name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div v-else class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <FeatherIcon name="user" class="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium">{{ party.name }}</h3>
                    <p class="text-xs text-gray-500">{{ party.type }}</p>
                    <div class="flex items-center mt-1 space-x-2">
                      <span v-if="party.email" class="text-xs text-gray-500 flex items-center">
                        <FeatherIcon name="mail" class="w-3 h-3 mr-1" />
                        {{ party.email }}
                      </span>
                      <span v-if="party.phone" class="text-xs text-gray-500 flex items-center">
                        <FeatherIcon name="phone" class="w-3 h-3 mr-1" />
                        {{ party.phone }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="!availableParties.length" class="text-center text-gray-500 py-4">
              No parties available to create quotation for.
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-sm font-medium text-gray-700">Select Date</h3>
            <FormControl
              type="date"
              :ref_for="true"
              size="sm"
              variant="subtle"
              :disabled="false"
              label="Quotation Date"
              v-model="formData.date"
              :default-value="formData.date"
            />
          </div>
        </div>

        <!-- Step 2: Specifications -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Aluminum</label>
            <TextInput
              v-model="formData.specifications.aluminum"
              placeholder="Enter aluminum specifications"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Glass</label>
            <TextInput
              v-model="formData.specifications.glass"
              placeholder="Enter glass specifications"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Finishes</label>
            <TextInput
              v-model="formData.specifications.finishes"
              placeholder="Enter finish specifications"
            />
          </div>
        </div>

        <!-- Step 3: Scope Selection -->
        <div v-if="currentStep === 2" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="scope in scopes"
              :key="scope.id"
              class="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
            >
              <Checkbox
                size="sm"
                v-model="formData.scopes[scope.id]"
                :label="scope.label"
              />
            </div>
          </div>
        </div>

        <!-- Step 4: Notes & Exclusions -->
        <div v-if="currentStep === 3" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Notes</label>
            <TextEditor
              editor-class="h-32 overflow-y-auto border rounded-lg p-2"
              :content="formData.notes"
              placeholder="Add any additional notes..."
              @change="(val) => formData.notes = val"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Exclusions</label>
            <TextEditor
              editor-class="h-32 overflow-y-auto border rounded-lg p-2"
              :content="formData.exclusions"
              placeholder="Add exclusions..."
              @change="(val) => formData.exclusions = val"
            />
          </div>
        </div>

        <!-- Step 5: Review -->
        <div v-if="currentStep === 4" class="space-y-4">
          <TextEditor
            editor-class="h-[500px] overflow-y-auto border rounded-lg p-2"
            :content="generatedContent"
            @change="(val) => formData.quotation_details = val"
          />
        </div>
      </div>
    </template>

    <template #actions>
      <div class="flex justify-between w-full">
        <Button
          v-if="currentStep > 0"
          variant="subtle"
          @click="currentStep--"
        >
          Back
        </Button>
        <div class="flex gap-2">
          <Button
            variant="subtle"
            @click="cancel"
          >
            Cancel
          </Button>
          <Button
            v-if="currentStep < 4"
            variant="solid"
            :disabled="currentStep === 0 && !formData.selectedParty"
            @click="currentStep++"
          >
            Next
          </Button>
          <Button
            v-else
            variant="solid"
            theme="green"
            :loading="loading"
            @click="submit"
          >
            Create Quotation
          </Button>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Dialog,
  Button,
  FormControl,
  TextInput,
  Checkbox,
  TextEditor,
  FeatherIcon,
} from 'frappe-ui'
import { getServerDate } from '@/utils/format'

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean,
  projectDoc: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// Dialog visibility
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Step tracking
const currentStep = ref(0)

// Form data
const formData = ref({
  selectedParty: null,
  date: getServerDate(),
  specifications: {
    aluminum: 'GULF EXTRUSION ATTESTED SYSTEM',
    glass: 'GUARDIAN GLASS DOUBLE TEMPERED GLASS (8mm CLEAR TEMPERED GLASS + 16mm SILICONE AIR SPACER + 8mm REFLECTIVE TEMPERED GLASS)',
    finishes: 'SDF POWDER COATED'
  },
  scopes: {
    doors_windows: true,
    curtain_walls: true,
    skylight: false,
    steel: false,
    fire_rated: false,
    balcony_handrail: false,
    stair_handrail: false,
    pergola: false
  },
  notes: '',
  exclusions: `
    <ul>
      <li>ALUMINUM CLADDING</li>
      <li>DOOR CLOSER</li>
      <li>STEEL & STAINLESS STEEL WORK</li>
      <li>CAT LADDER</li>
      <li>CANOPY</li>
      <li>FIRE RATED CURTAIN WALLS</li>
      <li>DOOR & WINDOWS</li>
      <li>CRANE</li>
      <li>SCAFFOLDING</li>
      <li>CRADLE</li>
      <li>ELECTRICITY</li>
      <li>WATER</li>
      <li>ANY ITEM NOT MENTIONED OR INCLUDED IN THE ATTACHED DOCUMENTS</li>
    </ul>
  `,
  quotation_details: ''
})

// Available scopes
const scopes = ref([
  { id: 'doors_windows', label: 'ALUMINUM DOORS & WINDOWS' },
  { id: 'curtain_walls', label: 'CURTAIN WALLS' },
  { id: 'skylight', label: 'ALUMINUM SKYLIGHT' },
  { id: 'steel', label: 'STEEL' },
  { id: 'fire_rated', label: 'ANY FIRE RATED WORKS' },
  { id: 'balcony_handrail', label: 'ALUMINUM HANDRAIL FOR BALCONY AREA' },
  { id: 'stair_handrail', label: 'ALUMINUM HANDRAIL FOR STAIR' },
  { id: 'pergola', label: 'ALUMINUM PERGOLA' }
])

// Dialog options
const dialogOptions = computed(() => ({
  title: 'New Quotation',
  size: '3xl'
}))

// Computed properties
const availableParties = computed(() => {
  if (!props.projectDoc?.parties) return []
  const parties = typeof props.projectDoc.parties === 'string'
    ? JSON.parse(props.projectDoc.parties)
    : props.projectDoc.parties
  return parties.filter(party =>
    party.type.toLowerCase() === 'client'
  )
})

const generatedContent = computed(() => {
  if (!formData.value.selectedParty) return ''

  const specs = Object.entries(formData.value.specifications)
    .map(([key, value]) => `<li><strong>${key.toUpperCase()}: </strong>${value.toUpperCase()}</li>`)
    .join('')

  const selectedScopes = scopes.value
    .map(scope => `<p>${formData.value.scopes[scope.id] ? '☑' : '☐'} ${scope.label}</p>`)
    .join('')

  return `
    <p>TO: <strong>${formData.value.selectedParty.name}</strong>,</p>
    <p>SUBJECT: <strong>${props.projectDoc.name}</strong></p>
    <p></p>

    <p>Dear <strong>${formData.value.selectedParty.name}</strong>,<p>
    <p>Thank you for reaching out to us and requesting a quotation for your project...</p>
    <p></p>

    <hr><p></p>
    <p><strong>SPECIFICATIONS:</strong></p>
    <ul>${specs}</ul>

    <hr><p></p>
    <p><strong>EXCLUSIONS</strong></p>
    ${formData.value.exclusions}

    ${formData.value.notes ? `<hr><p></p><p><strong>NOTES</strong></p>${formData.value.notes}` : ''}

    <hr><p></p>
    <p><strong>STANDARD QUALIFICATIONS</strong></p>
    <p>OUR OFFER IS PER ITEMS HAVING BEEN PRICED IN ACCORDANCE WITH YOUR RECEIVED BOQ AND DRAWING (RE-MEASURABLE AT SITE). ANY ITEMS WHICH DO NOT APPEAR IN BOQ HAVE BEEN OMITTED FROM OUR BID. ANY ADDITIONAL ITEMS WILL BE SUBJECTED TO PRICE VARIATION</p>

    <hr><p></p>
    <p><strong>SCOPE OF WORK</strong></p>
    ${selectedScopes}

    <hr><p></p>

    <p><strong>TERMS AND CONDITIONS</strong></p>
    <ul>
      <li>The proposal is strictly based on items as described in the BOQ and this letter. Items not specifically mentioned in the Bill of Quantity or this letter should not be considered as forming part of this scope of works/quotation.</li>
      <li>Cutting list will be based on the approved shop drawings.</li>
      <li>All access requirements and equipment are to be provided by the main contractor free of charge.</li>
      <li>Electricity, water, storage areas and/or adequate site offices required for the execution of project shall be provided by the main contractor.</li>
      <li>Third Party testing charges for aluminum and cladding works (if applicable) are payable for the main contractor only.</li>
      <li>Main contractor to pay for all inspection charges for aluminum, glass and cladding.</li>
      <li>We have not made any provision for carnage, monorails, cradles and scaffolding. All access requirements and equipment are to be provided by the main contractor free of charge.</li>
    </ul>

    <hr><p></p>

    <p><strong>PROPOSAL BASIS</strong></p>
    <p>THE PROPOSAL WILL BE BASED ON THE FOLLOWING DOCUMENTS</p>
    <ul>
      <li>AS PER ATTACHED BOQ</li>
      <li>AS PER ATTACHED DRAWINGS</li>
    </ul>

    <hr><p></p>

    <p><strong>DURATION</strong></p>
    <p>AS AGREED</p>

    <hr><p></p>

    <p><strong>PAYMENT TERMS</strong></p>
    <p>TO BE DISCUSSED</p>

    <hr><p></p>

    <p><strong>MAINTENANCE AND WARRANTY</strong></p>
    <p>RUA Company Aluminum And Glass L.L.C. O.P.C is pleased to offer a one-year warranty for all aluminum items supplied for this project. This warranty covers any technical faults that may occur and begins on the date of initial hand-over. Please note that damages resulting from mishandling are not covered under this maintenance guarantee. For other items such as glass, aluminum finishing, etc., our standard warranty applies. We are committed to providing top-quality products and stand behind the work that we do. If you have any questions about our warranties, please do not hesitate to ask.</p>
    <p>We are excited to work with you and look forward to a successful partnership. If you have any questions or need any additional clarification, please do not hesitate to reach out to us.</p>
    <p></p><p>Thank you for considering RUA Company Aluminum And Glass L.L.C. O.P.C for your project. We value your business and look forward to the opportunity to serve you.</p>
    <p></p><p>Best regards,<p></p>RUA Company Aluminum And Glass L.L.C. O.P.C</p>
  `
})

// Methods
function selectParty(party) {
  formData.value.selectedParty = party
}

function cancel() {
  resetForm()
  showDialog.value = false
}

function resetForm() {
  formData.value = {
    selectedParty: null,
    date: getServerDate(),
    specifications: {
      aluminum: 'GULF EXTRUSION ATTESTED SYSTEM',
      glass: 'GUARDIAN GLASS DOUBLE TEMPERED GLASS (8mm CLEAR TEMPERED GLASS + 16mm SILICONE AIR SPACER + 8mm REFLECTIVE TEMPERED GLASS)',
      finishes: 'SDF POWDER COATED'
    },
    scopes: {
      doors_windows: true,
      curtain_walls: true,
      skylight: false,
      steel: false,
      fire_rated: false,
      balcony_handrail: false,
      stair_handrail: false,
      pergola: false
    },
    notes: '',
    exclusions: `
      <ul>
        <li>ALUMINUM CLADDING</li>
        <li>DOOR CLOSER</li>
        <li>STEEL & STAINLESS STEEL WORK</li>
        <li>CAT LADDER</li>
        <li>CANOPY</li>
        <li>FIRE RATED CURTAIN WALLS</li>
        <li>DOOR & WINDOWS</li>
        <li>CRANE</li>
        <li>SCAFFOLDING</li>
        <li>CRADLE</li>
        <li>ELECTRICITY</li>
        <li>WATER</li>
        <li>ANY ITEM NOT MENTIONED OR INCLUDED IN THE ATTACHED DOCUMENTS</li>
      </ul>
    `,
    quotation_details: ''
  }
  currentStep.value = 0
}

async function submit() {
  if (!formData.value.selectedParty) return

  emit('submit', {
    project: props.projectDoc.name,
    date: formData.value.date,
    party: formData.value.selectedParty.name,
    doctype: 'RUA Quotation',
    quotation_details: formData.value.quotation_details || generatedContent.value
  })
}
</script>