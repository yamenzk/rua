<template>
  <Dialog v-model="showDialog" :options="dialogOptions">
    <template #body-content>
      <div class="space-y-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-around">
            <div
              v-for="(step, index) in ['Party & Date', 'Specs & Scope', 'Details', 'Terms', 'Review']"
              :key="step"
              class="flex items-center space-x-2 cursor-pointer"
              :class="currentStep === index ? 'text-gray-900' : 'text-gray-500'"
              @click="navigateToStep(index)"
            >
              <span
                class="relative flex h-7 w-7 items-center justify-center rounded-full border-2"
                :class="currentStep === index ? 'text-white bg-gray-900 border-gray-900' : 'border-gray-300 bg-white'"
              >
                {{ index + 1 }}
              </span>
              <span class="font-medium text-sm">{{ step }}</span>
            </div>
          </div>
        </div>

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
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                      />
                       <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center" style="display: none;">
                         <FeatherIcon name="user" class="w-6 h-6 text-gray-400" />
                       </div>
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
              No client parties found for this project.
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

        <div v-if="currentStep === 1" class="space-y-6">
           <div class="space-y-2">
             <label class="block text-sm font-medium text-gray-700">Specifications</label>
             <TextEditor
               editor-class="h-40 overflow-y-auto border rounded-lg p-2 text-sm"
               :content="formData.specifications"
               placeholder="Enter project specifications (Aluminum, Glass, Finishes, etc.)..."
               @change="(val) => formData.specifications = val"
               :fixed-menu="true"
             />
           </div>

           <div class="space-y-4">
              <h3 class="text-sm font-medium text-gray-700">Select Scope Items (Populates Text Below)</h3>
              <div class="grid grid-cols-2 gap-4">
                <div
                  v-for="scope in scopeOptions" :key="scope.id"
                  class="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
                >
                  <Checkbox
                    size="sm"
                    v-model="formData.scopes[scope.id]" :label="scope.label"
                  />
                </div>
              </div>
           </div>

           <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Scope of Work (Generated from selections)</label>
              <TextEditor
                editor-class="h-40 overflow-y-auto border rounded-lg p-2 text-sm"
                :content="formData.scope_of_work"
                placeholder="Scope details will appear here based on selections..."
                @change="(val) => formData.scope_of_work = val"
                :fixed-menu="true"
              />
           </div>
        </div>

        <div v-if="currentStep === 2" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Exclusions</label>
                <TextEditor
                  editor-class="h-40 overflow-y-auto border rounded-lg p-2 text-sm"
                  :content="formData.exclusions"
                  placeholder="List items explicitly not included..."
                  @change="(val) => formData.exclusions = val"
                  :fixed-menu="true"
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Notes</label>
                <TextEditor
                  editor-class="h-40 overflow-y-auto border rounded-lg p-2 text-sm"
                  :content="formData.notes"
                  placeholder="Add any additional notes or clarifications..."
                  @change="(val) => formData.notes = val"
                  :fixed-menu="true"
                />
              </div>
            </div>
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Standard Qualifications</label>
                <TextEditor
                  editor-class="h-40 overflow-y-auto border rounded-lg p-2 text-sm"
                  :content="formData.qualifications"
                  placeholder="Add standard qualifications for the offer..."
                  @change="(val) => formData.qualifications = val"
                  :fixed-menu="true"
                />
              </div>
               <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Proposal Basis</label>
                <TextEditor
                  editor-class="h-40 overflow-y-auto border rounded-lg p-2 text-sm"
                  :content="formData.proposal_basis"
                  placeholder="Specify the documents the proposal is based on..."
                  @change="(val) => formData.proposal_basis = val"
                  :fixed-menu="true"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 3" class="space-y-6">
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div class="space-y-6">
               <div class="space-y-2">
                 <label class="block text-sm font-medium text-gray-700">Terms and Conditions</label>
                 <TextEditor
                   editor-class="h-40 overflow-y-auto border rounded-lg p-2 text-sm"
                   :content="formData.terms_and_conditions"
                   placeholder="Outline the general terms and conditions..."
                   @change="(val) => formData.terms_and_conditions = val"
                    :fixed-menu="true"
                 />
               </div>
               <div class="space-y-2">
                 <label class="block text-sm font-medium text-gray-700">Maintenance and Warranty</label>
                 <TextEditor
                   editor-class="h-40 overflow-y-auto border rounded-lg p-2 text-sm"
                   :content="formData.maintenance_and_warranty"
                   placeholder="Describe the warranty and maintenance offered..."
                   @change="(val) => formData.maintenance_and_warranty = val"
                    :fixed-menu="true"
                 />
               </div>
             </div>
             <div class="space-y-6">
                <div class="space-y-2">
                 <label class="block text-sm font-medium text-gray-700">Duration and Payment Terms</label>
                 <TextEditor
                   editor-class="h-40 overflow-y-auto border rounded-lg p-2 text-sm"
                   :content="formData.duration_and_payment"
                   placeholder="Specify project duration and payment terms..."
                   @change="(val) => formData.duration_and_payment = val"
                    :fixed-menu="true"
                 />
               </div>
               <div></div>
             </div>
           </div>
        </div>


        <div v-if="currentStep === 4" class="space-y-4">
           <h3 class="text-sm font-medium text-gray-700">Review Quotation Content</h3>
           <div
             class="prose prose-sm max-w-none h-[500px] overflow-y-auto border rounded-lg p-4 bg-gray-50"
             v-html="generatedContent"
           ></div>
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
        <div v-else></div>
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
            :disabled="isNextDisabled"
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
import { ref, computed, watch } from 'vue'
import {
  Dialog,
  Button,
  FormControl,
  Checkbox, // Checkbox is needed again
  TextEditor,
  FeatherIcon,
} from 'frappe-ui'
import { getServerDate } from '@/utils/format' // Assuming this utility exists

// Define component props
const props = defineProps({
  modelValue: Boolean, // Controls dialog visibility (v-model)
  loading: Boolean,    // Loading state for the submit button
  projectDoc: {        // The project document containing party information
    type: Object,
    required: true
  }
})

// Define component emits
const emit = defineEmits(['update:modelValue', 'submit'])

// --- Refs ---

// Dialog visibility computed property for v-model binding
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Current step in the dialog wizard
const currentStep = ref(0)

// Define scope options for checkboxes AND for generating text
const scopeOptions = ref([
  { id: 'doors_windows', label: 'ALUMINUM DOORS & WINDOWS', default: true },
  { id: 'curtain_walls', label: 'CURTAIN WALLS', default: true },
  { id: 'skylight', label: 'ALUMINUM SKYLIGHT', default: false },
  { id: 'steel', label: 'STEEL RELATED WORKS', default: false },
  { id: 'fire_rated', label: 'FIRE RATED WORKS', default: false },
  { id: 'balcony_handrail', label: 'ALUMINUM HANDRAIL (BALCONY)', default: false },
  { id: 'stair_handrail', label: 'ALUMINUM HANDRAIL (STAIR)', default: false },
  { id: 'pergola', label: 'ALUMINUM PERGOLA', default: false }
]);

// Helper function to generate scope text based on selection object
const generateScopeText = (scopesSelection) => {
    const includedItems = scopeOptions.value
        .filter(option => scopesSelection[option.id]) // Check against the passed selection object
        .map(option => `<li>${option.label}</li>`);
    return `<p>Our scope includes the design, supply, fabrication, and installation of the following items:</p><ul>${includedItems.join('') || '<li>To be detailed</li>'}</ul>`;
};

// Helper function to generate initial specifications text
const generateInitialSpecText = () => {
    const specs = {
        Aluminum: 'GULF EXTRUSION ATTESTED SYSTEM',
        Glass: 'GUARDIAN GLASS DOUBLE TEMPERED GLASS (8mm CLEAR TEMPERED + 16mm SILICONE AIR SPACER + 8mm REFLECTIVE TEMPERED)',
        Finishes: 'SDF POWDER COATED (COLOR TBD)'
    };
    return `<ul>${Object.entries(specs).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}</ul>`;
};

// Helper function to generate the initial scopes object for formData
const generateInitialScopesObject = () => {
    const scopes = {};
    scopeOptions.value.forEach(option => {
        scopes[option.id] = option.default;
    });
    return scopes;
};


// Reactive form data object
const initialFormData = {
  selectedParty: null,
  date: getServerDate(), // Default to today's date
  specifications: generateInitialSpecText(),
  // Add scopes object for checkbox state
  scopes: generateInitialScopesObject(),
  // scope_of_work is generated from initial scopes state
  scope_of_work: generateScopeText(generateInitialScopesObject()),
  duration_and_payment: `<p><strong>Duration:</strong> TO BE DISCUSSED</p><p><strong>Payment Terms:</strong> AS AGREED</p>`,
  exclusions: `ALUMINUM CLADDING, DOOR CLOSER / FLOOR SPRING, STEEL & STAINLESS STEEL WORKS (unless specified in scope), CAT LADDER, CANOPY (unless specified in scope), FIRE RATED SYSTEMS (unless specified in scope), CIVIL WORKS (including concrete cutting, plastering, painting), ELECTRICAL WORKS (for automated systems), CRANE / SPECIALIZED LIFTING EQUIPMENT, SCAFFOLDING / CRADLE SYSTEMS (to be provided by Main Contractor), SITE ELECTRICITY & WATER (to be provided by Main Contractor), THIRD-PARTY TESTING FEES, AUTHORITY APPROVAL FEES, ANY ITEM NOT EXPLICITLY MENTIONED IN OUR SCOPE OR BOQ`,
  notes: `<p>Please review the specifications and scope carefully. Contact us for any clarifications.</p>`,
  qualifications: `<p>Our offer is based on the items listed in the provided Bill of Quantities (BOQ) and drawings. Prices are based on standard working hours and conditions.</p><ul><li>The quantities mentioned are approximate and subject to re-measurement on site based on approved shop drawings.</li><li>Any items not explicitly mentioned in the BOQ or our scope have been omitted from this quotation.</li><li>Additional items or variations requested will be subject to price adjustments and require a formal variation order.</li><li>This quotation assumes unobstructed access to the work areas.</li></ul>`,
  terms_and_conditions: `<ul><li>This proposal is based strictly on the items described herein and in the referenced BOQ/drawings.</li><li>Cutting lists and material orders will be based on approved shop drawings only.</li><li>Adequate and safe site access, storage areas, electricity, and water shall be provided by the Main Contractor free of charge.</li><li>Any required third-party testing or inspection charges related to aluminum, glass, or associated works are excluded and typically payable by the Main Contractor unless otherwise agreed.</li><li>Specialized access equipment (e.g., cranes, cradles, scaffolding) is excluded and must be provided by the Main Contractor.</li><li>This quotation is valid for 30 days from the date of issue.</li></ul>`,
  proposal_basis: `<ul><li>ATTACHED BILL OF QUANTITIES (BOQ)</li><li>ATTACHED DRAWINGS</li><li>THIS QUOTATION LETTER</li></ul>`,
  maintenance_and_warranty: `<p>Rua Company offers a standard one (1) year warranty on workmanship and supplied aluminum systems, commencing from the date of practical completion and handover. This covers defects arising from faulty materials or installation.</p><ul><li>Damage due to misuse, accidents, lack of routine maintenance, or natural disasters is excluded.</li><li>Warranties for specific components (e.g., glass, hardware, powder coating) are subject to the respective manufacturer's standard warranties, copies of which can be provided upon request.</li></ul><p>We are committed to quality and stand behind our work.</p>`
};

// Use structuredClone for a deep copy to prevent mutation issues when resetting
const formData = ref(JSON.parse(JSON.stringify(initialFormData)));

// --- Computed Properties ---

// Filter parties from projectDoc to only include 'Client' type
const availableParties = computed(() => {
  if (!props.projectDoc?.parties) return []
  try {
    const parties = typeof props.projectDoc.parties === 'string'
      ? JSON.parse(props.projectDoc.parties)
      : props.projectDoc.parties
    if (!Array.isArray(parties)) {
        console.error("Project parties data is not an array:", parties);
        return [];
    }
    return parties.filter(party => party.type && party.type.toLowerCase() === 'client')
  } catch (error) {
      console.error("Error parsing project parties:", error);
      return [];
  }
})

// Dialog options (title, size)
const dialogOptions = computed(() => ({
  title: `New Quotation for Project: ${props.projectDoc?.name || '...'}`,
  size: '4xl'
}))

// Determine if the 'Next' button should be disabled
const isNextDisabled = computed(() => {
    if (currentStep.value === 0 && !formData.value.selectedParty) {
        return true;
    }
    return false;
});


// Generates the combined HTML content for the review step
const generatedContent = computed(() => {
  if (!formData.value.selectedParty) return '<p class="text-center text-gray-500">Please select a party on the first step.</p>'

  // Construct the final HTML string using the TextEditor content directly
  // Note: Scope text is now directly from formData.scope_of_work which is updated by the watcher
  return `
    <section class="mb-4">
      <p><strong>TO:</strong> ${formData.value.selectedParty.name}</p>
      <p><strong>DATE:</strong> ${formData.value.date}</p>
      <p><strong>SUBJECT:</strong> Quotation for ${props.projectDoc.name}</p>
    </section>

    <section class="mb-4">
      <p>Dear ${formData.value.selectedParty.name},</p>
      <p>Thank you for the opportunity to provide a quotation for the ${props.projectDoc.name} project. Please find our detailed proposal below.</p>
    </section>

    ${formData.value.specifications ? `<hr class="my-3"><section class="mb-4"><h2 class="font-semibold mb-2">1. SPECIFICATIONS</h2>${formData.value.specifications}</section>` : ''}

    ${formData.value.scope_of_work ? `<hr class="my-3"><section class="mb-4"><h2 class="font-semibold mb-2">2. SCOPE OF WORK</h2>${formData.value.scope_of_work}</section>` : ''}

    ${formData.value.exclusions ? `<hr class="my-3"><section class="mb-4"><h2 class="font-semibold mb-2">3. EXCLUSIONS</h2>${formData.value.exclusions}</section>` : ''}

    ${formData.value.notes ? `<hr class="my-3"><section class="mb-4"><h2 class="font-semibold mb-2">4. NOTES</h2>${formData.value.notes}</section>` : ''}

    ${formData.value.qualifications ? `<hr class="my-3"><section class="mb-4"><h2 class="font-semibold mb-2">5. STANDARD QUALIFICATIONS</h2>${formData.value.qualifications}</section>` : ''}

    ${formData.value.proposal_basis ? `<hr class="my-3"><section class="mb-4"><h2 class="font-semibold mb-2">6. PROPOSAL BASIS</h2>${formData.value.proposal_basis}</section>` : ''}

    ${formData.value.terms_and_conditions ? `<hr class="my-3"><section class="mb-4"><h2 class="font-semibold mb-2">7. TERMS AND CONDITIONS</h2>${formData.value.terms_and_conditions}</section>` : ''}

    ${formData.value.duration_and_payment ? `<hr class="my-3"><section class="mb-4"><h2 class="font-semibold mb-2">8. DURATION AND PAYMENT TERMS</h2>${formData.value.duration_and_payment}</section>` : ''}

    ${formData.value.maintenance_and_warranty ? `<hr class="my-3"><section class="mb-4"><h2 class="font-semibold mb-2">9. MAINTENANCE AND WARRANTY</h2>${formData.value.maintenance_and_warranty}</section>` : ''}

    <hr class="my-3">
    <section class="mt-6">
      <p>We trust this proposal meets your requirements. Should you have any questions or require further clarification, please do not hesitate to contact us.</p>
      <p>Thank you for considering Rua Company for your project. We look forward to the possibility of working with you.</p>
      <br>
      <p>Best regards,</p>
      <p><strong>Rua Company</strong></p>
      <p>info@ruacompany.com</p>
    </section>
  `;
})

// --- Methods ---

// Selects a party and updates formData
function selectParty(party) {
  formData.value.selectedParty = party
}

// Closes the dialog and resets the form
function cancel() {
  resetForm()
  showDialog.value = false
}

// Resets the form data to initial state and returns to step 1
function resetForm() {
  // Use structuredClone again for a clean reset
  formData.value = JSON.parse(JSON.stringify(initialFormData));
  currentStep.value = 0
}

// Allows navigation by clicking step indicators (optional)
function navigateToStep(index) {
    // Add validation here if needed, e.g., prevent jumping ahead
    // if (index > currentStep.value && isNextDisabled.value) return;
    currentStep.value = index;
}


// Emits the submit event with the structured form data
async function submit() {
  if (!formData.value.selectedParty) {
      console.error("Cannot submit without selecting a party.");
      currentStep.value = 0;
      return;
  }

  // Prepare the payload - Note: formData.scopes is not submitted, only the resulting text
  const payload = {
    project: props.projectDoc.name,
    date: formData.value.date,
    party: formData.value.selectedParty.name,
    doctype: 'RUA Quotation', // Or your specific Doctype name

    // Text fields
    specifications: formData.value.specifications,
    scopes: formData.value.scope_of_work, // Submit the text version
    duration_and_payment: formData.value.duration_and_payment,
    exclusions: formData.value.exclusions,
    notes: formData.value.notes,
    qualifications: formData.value.qualifications,
    terms_and_conditions: formData.value.terms_and_conditions,
    proposal_basis: formData.value.proposal_basis,
    maintenance_and_warranty: formData.value.maintenance_and_warranty,
  };

  emit('submit', payload);
}

// --- Watchers ---

// Watch the scopes checkbox object and update the scope_of_work text editor
watch(() => formData.value.scopes, (newScopesSelection) => {
    formData.value.scope_of_work = generateScopeText(newScopesSelection);
}, { deep: true }); // Use deep watch for nested object


// Optional: Watch projectDoc changes to reset form
watch(() => props.projectDoc, (newDoc, oldDoc) => {
    if (newDoc?.name !== oldDoc?.name) {
        console.log("Project changed, resetting form.");
        resetForm();
    }
}, { deep: true });

</script>

<style scoped>
/* Add any component-specific styles here */
.prose :where(ul > li)::marker {
   /* color: inherit; */
}
.prose {
    line-height: 1.6;
}
.prose h2 {
    font-size: 1.1em;
    margin-bottom: 0.5em;
    margin-top: 1em;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.25em;
}
.prose ul {
    padding-left: 1.5em;
    margin-top: 0.5em;
}
.prose li {
    margin-bottom: 0.3em;
}
.prose p + p {
    margin-top: 0.5em;
}
</style>
