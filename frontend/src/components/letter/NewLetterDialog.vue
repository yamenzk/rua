<template>
    <Dialog :options="dialogOptions" v-model="showDialog">
        <template #body-content>
            <div class="p-2 relative"> <div v-if="currentStep === 1" class="space-y-6">
                    <h3 class="text-lg font-medium text-center text-gray-800">How would you like to start?</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <button
                            @click="startMethod = 'blank'; currentStep = 2"
                            class="flex flex-col items-center justify-center p-8 border-2 border-gray-300 rounded-xl hover:border-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-150 h-40"
                         >
                            <FeatherIcon name="file-plus" class="w-10 h-10 text-gray-500 mb-3" />
                            <span class="font-semibold text-gray-800">Start Blank</span>
                            <span class="text-sm text-gray-500 mt-1">Create a new Letter or Form.</span>
                        </button>
                        <button
                             @click="startMethod = 'template'; currentStep = 2; loadTemplates()"
                             class="flex flex-col items-center justify-center p-8 border-2 border-gray-300 rounded-xl hover:border-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-150 h-40"
                         >
                            <FeatherIcon name="layout" class="w-10 h-10 text-gray-500 mb-3" />
                            <span class="font-semibold text-gray-800">Use Template</span>
                             <span class="text-sm text-gray-500 mt-1">Start from an existing template.</span>
                        </button>
                    </div>
                </div>

                 <div v-if="currentStep === 2 && startMethod === 'blank'" class="space-y-6">
                     <h3 class="text-lg font-medium text-center text-gray-800">What are you creating?</h3>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                         <button
                             @click="creationType = 'LTR'"
                             :class="[
                                 'flex flex-col items-center justify-center p-8 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-150 h-40',
                                 creationType === 'LTR' ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:border-gray-600 hover:bg-gray-50'
                             ]"
                         >
                             <FeatherIcon name="mail" class="w-10 h-10 text-gray-500 mb-3" />
                             <span class="font-semibold text-gray-800">Letter</span>
                         </button>
                         <button
                             @click="creationType = 'FRM'"
                             :class="[
                                 'flex flex-col items-center justify-center p-8 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-150 h-40',
                                 creationType === 'FRM' ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:border-gray-600 hover:bg-gray-50'
                             ]"
                         >
                             <FeatherIcon name="file-text" class="w-10 h-10 text-gray-500 mb-3" />
                             <span class="font-semibold text-gray-800">Form</span>
                         </button>
                     </div>
                     <div class="flex justify-center pt-4">
                         <Checkbox v-model="isCreatingTemplate" label="Save this as a template" size="sm" />
                     </div>
                 </div>

                 <div v-if="currentStep === 2 && startMethod === 'template'" class="space-y-4">
                     <h3 class="text-lg font-medium text-gray-800 mb-4">Select a Template</h3>
                     <div v-if="templateResource.list.loading" class="flex justify-center py-10">
                         <LoadingIndicator />
                     </div>
                     <div v-else-if="templateResource.error" class="text-center text-red-600 py-10">
                         Failed to load templates. Please try again.
                     </div>
                     <div v-else-if="!templateResource.data?.length" class="text-center text-gray-500 py-10">
                         No templates found. You can create templates by starting blank and checking "Save as template".
                     </div>
                     <div v-else class="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                        <div
                            v-for="template in templateResource.data"
                            :key="template.name"
                            @click="selectTemplate(template)"
                            :class="[
                                'p-4 border rounded-lg cursor-pointer transition-colors duration-150 flex justify-between items-center',
                                selectedTemplate?.name === template.name
                                    ? 'border-gray-900 bg-gray-100 border-2'
                                    : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                            ]"
                        >
                            <div>
                                <div class="font-medium text-gray-800">{{ template.title || template.name }}</div>
                                <div class="text-sm text-gray-500">{{ template.type === 'LTR' ? 'Letter' : 'Form' }} Template</div>
                                <div v-if="template.subject" class="text-xs text-gray-400 mt-1 truncate">Subject: {{ template.subject }}</div>
                            </div>
                             <FeatherIcon v-if="selectedTemplate?.name === template.name" name="check-circle" class="w-5 h-5 text-gray-900" />
                        </div>
                     </div>
                 </div>

                 <div v-if="currentStep === 3 && startMethod === 'template'" class="space-y-4">
                     <h3 class="text-lg font-medium text-gray-800 mb-4">Fill in the Blanks for "{{ selectedTemplate?.system_title || selectedTemplate?.name }}"</h3>
                      <div v-if="!fillableFields.length" class="text-center text-gray-500 py-6">
                         This template has no fillable fields (like __field_name__). Proceeding to create.
                     </div>
                     <div v-else class="space-y-4 max-h-[400px] overflow-y-auto p-2">
                         <FormControl
                             v-for="field in fillableFields"
                             :key="field"
                             :label="formatFieldLabel(field)"
                             :fieldname="field"
                             :fieldtype="getFieldType(field)"
                             v-model="filledValues[field]"
                             required
                         />
                     </div>
                     <!-- <div class="flex justify-center pt-4">
                          <Checkbox v-model="isCreatingTemplate" label="Save this new version as a template" size="sm" />
                      </div> -->
                 </div>

                 <div v-if="isCreating" class="absolute inset-0 bg-white/70 flex flex-col items-center justify-center rounded-lg">
                     <LoadingIndicator />
                     <p class="mt-2 text-gray-600">Creating...</p>
                 </div>
                 <div v-if="creationError" class="mt-4 text-center text-red-600 bg-red-50 p-3 rounded-md">
                     {{ creationError }}
                 </div>

            </div>
        </template>

        <template #actions>
            <div class="flex justify-between w-full">
                <Button
                    variant="subtle"
                    theme="gray"
                    @click="goBack"
                    :disabled="isCreating"
                    v-if="currentStep > 1"
                >
                    Back
                </Button>
                <div v-else></div> <div class="flex gap-3">
                    <Button
                        variant="subtle"
                        theme="gray"
                        @click="cancel"
                        :disabled="isCreating"
                    >
                        Cancel
                    </Button>
                    <Button
                        :variant="'solid'"
                        theme="gray"
                        @click="proceed"
                        :loading="isCreating"
                        :disabled="isProceedDisabled"
                    >
                        {{ proceedButtonText }}
                    </Button>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
    Dialog,
    Button,
    Checkbox,
    FeatherIcon,
    LoadingIndicator,
    FormControl, // Use FormControl for dynamic fields
    TextEditor, // Needed for content field type check potentially
} from 'frappe-ui';
import { templateListResource, letterListResource } from '@/data/letter'; // Import resources
import { getServerDate } from '@/utils/format'; // Assuming utility exists
import { cloneDeep } from 'lodash-es'; // For deep cloning template data


const props = defineProps({
    modelValue: Boolean, // v-model for dialog visibility
});

const emit = defineEmits(['update:modelValue', 'navigate-to-edit']);

// --- Dialog State ---
const showDialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});
const currentStep = ref(1);
const startMethod = ref(''); // 'blank' or 'template'
const creationType = ref(''); // 'LTR' or 'FRM' (for blank start)
const isCreatingTemplate = ref(false); // Checkbox state

// --- Template State ---
const templateResource = templateListResource;
const selectedTemplate = ref(null);
const fillableFields = ref([]);
const filledValues = ref({});

// --- Creation State ---
const isCreating = ref(false);
const creationError = ref('');

// --- Computed Properties ---
const dialogOptions = computed(() => ({
    title: 'Create New Letter or Form',
    size: 'xl', // Adjust size as needed
    actions: [], // Actions are handled in the template #actions slot
}));

const isProceedDisabled = computed(() => {
    if (isCreating.value) return true;
    if (currentStep.value === 2 && startMethod.value === 'blank') {
        return !creationType.value; // Must select Letter or Form
    }
    if (currentStep.value === 2 && startMethod.value === 'template') {
        return !selectedTemplate.value; // Must select a template
    }
     if (currentStep.value === 3 && startMethod.value === 'template') {
         // Check if all required fillable fields are filled
         return fillableFields.value.some(field => !filledValues.value[field]?.trim());
     }
    return false;
});

const proceedButtonText = computed(() => {
    if (currentStep.value === 1) return 'Next';
    if (currentStep.value === 2 && startMethod.value === 'blank') return 'Create & Edit';
    if (currentStep.value === 2 && startMethod.value === 'template') return 'Next';
     if (currentStep.value === 3 && startMethod.value === 'template') return 'Create & Edit';
    return 'Proceed'; // Default
});

// --- Methods ---

function resetDialog() {
    currentStep.value = 1;
    startMethod.value = '';
    creationType.value = '';
    isCreatingTemplate.value = false;
    selectedTemplate.value = null;
    fillableFields.value = [];
    filledValues.value = {};
    isCreating.value = false;
    creationError.value = '';
    // Reset template resource if needed (optional, depends on caching)
    // templateResource.list.reset();
}

function cancel() {
    resetDialog();
    showDialog.value = false;
}

function goBack() {
    if (isCreating.value) return;

    if (currentStep.value === 3 && startMethod.value === 'template') {
        // Going back from fill blanks to template selection
        currentStep.value = 2;
        // Clear fillable fields and values, but keep selected template
        fillableFields.value = [];
        filledValues.value = {};
    } else if (currentStep.value === 2) {
        // Going back from type/template selection to start method
        currentStep.value = 1;
        startMethod.value = ''; // Clear start method
        creationType.value = ''; // Clear creation type
        selectedTemplate.value = null; // Clear template selection
    }
}


async function loadTemplates() {
    // Only reload if data isn't present or wasn't loaded recently
    // This avoids unnecessary reloads if user clicks back and forth
    if (!templateResource.data?.length || templateResource.list.loading) {
        try {
            await templateResource.reload();
        } catch (err) {
            console.error("Error loading templates:", err);
            // Handle error display if needed
            creationError.value = "Failed to load templates. Please try again.";
        }
    }
}

function findFillableFields(template) {
    const fieldsToScan = [
        'title', 'title_ar', 'subject', 'subject_ar', 'to', 'to_ar',
        'content', 'content_ar', 'author', 'author_ar', 'author_title', 'author_title_ar',
        'signee', 'signee_ar', 'signee_title', 'signee_title_ar'
    ];
    const regex = /\{\{([a-zA-Z0-9_]+?)\}\}/g;
    const foundFields = new Set();

    fieldsToScan.forEach(fieldName => {
        const content = template[fieldName];

        if (typeof content === 'string') {
            let match;
            regex.lastIndex = 0; // Reset regex index for global flag
            while ((match = regex.exec(content)) !== null) {
                foundFields.add(match[1]);
            }
        }
    });
    return Array.from(foundFields);
}

function selectTemplate(template) {
    selectedTemplate.value = template;
    fillableFields.value = findFillableFields(template);
    // Initialize filledValues for reactivity
    const initialValues = {};
    fillableFields.value.forEach(field => {
        initialValues[field] = '';
    });
    filledValues.value = initialValues;
}

function formatFieldLabel(field) {
    // Simple conversion: replace underscores with spaces and capitalize
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getFieldType(field) {
    // Basic heuristic: if 'content' is in the name, assume TextEditor, else Data
    // You might need more sophisticated logic based on field names
    return field.toLowerCase().includes('content') ? 'Text Editor' : 'Data';
}

function proceed() {
    if (isProceedDisabled.value) return;
    creationError.value = ''; // Clear previous errors

    if (currentStep.value === 1) {
        // Move from Start Method to Type/Template selection
        currentStep.value = 2;
        if (startMethod.value === 'template') {
            loadTemplates(); // Start loading templates
        }
    } else if (currentStep.value === 2 && startMethod.value === 'blank') {
        // Create blank document directly
        createBlankDocument();
    } else if (currentStep.value === 2 && startMethod.value === 'template') {
        // Move from Template Selection to Fill Blanks (if needed) or Create
        if (fillableFields.value.length > 0) {
            currentStep.value = 3; // Go to fill blanks step
        } else {
            createDocumentFromTemplate(); // No blanks to fill, create directly
        }
    } else if (currentStep.value === 3 && startMethod.value === 'template') {
        // Create document after filling blanks
        createDocumentFromTemplate();
    }
}


async function createBlankDocument() {
    isCreating.value = true;
    creationError.value = '';
    try {
        const payload = {
            doctype: 'RUA Letter',
            type: creationType.value,
            is_template: isCreatingTemplate.value ? 1 : 0,
            status: 'Draft', // Always start as Draft
            date: getServerDate(),
            // Set default language based on your preference, e.g., English
            english: 1,
            arabic: 0,
            two_column: 0, // Default two_column
            // Add any other minimal required fields or defaults
            title: `New ${creationType.value === 'LTR' ? 'Letter' : 'Form'}`, // Example default title
        };

        const response = await letterListResource.insert.submit(payload);
        const newDocName = response?.name; // Adjust based on actual API response structure

        if (!newDocName) {
            throw new Error("Failed to get name of the created document.");
        }

        resetDialog();
        emit('navigate-to-edit', newDocName); // Navigate to the new doc's edit page

    } catch (err) {
        console.error("Error creating blank document:", err);
        creationError.value = err.message || "Failed to create document. Please check console.";
    } finally {
        isCreating.value = false;
    }
}

async function createDocumentFromTemplate() {
    if (!selectedTemplate.value) return;

    isCreating.value = true;
    creationError.value = '';

    try {
        // Start with a deep copy of the template data
        const payload = cloneDeep(selectedTemplate.value);

        // --- Fields to EXCLUDE/RESET ---
        const fieldsToReset = [
            'name', 'creation', 'modified', 'modified_by', 'owner',
            'status', 'date', 'is_template', // These will be set explicitly
            'deliverable', 'signature', 'cancellation_reason',
            // Add Frappe internal fields if necessary
            'idx', '_user_tags', '_comments', '_assign', '_liked_by',
            'docstatus'
        ];
        fieldsToReset.forEach(field => delete payload[field]);

        // --- Set New Document Values ---
        payload.doctype = 'RUA Letter'; // Ensure doctype is correct
        payload.status = 'Draft';       // New doc starts as Draft
        payload.date = getServerDate(); // Set current date
        payload.is_template = isCreatingTemplate.value ? 1 : 0; // Set based on checkbox


        // --- Replace Placeholders ---
        if (fillableFields.value.length > 0) {
            fillableFields.value.forEach(fieldKey => {
                const replacementValue = filledValues.value[fieldKey] || ''; // Use filled value or empty string
                const fieldRegex = new RegExp(`\\{\\{${fieldKey}\\}\\}`, 'g');

                // Iterate through all fields of the payload and replace
                for (const payloadKey in payload) {
                    // Check if the field exists and is a string before replacing
                    if (Object.hasOwnProperty.call(payload, payloadKey) && typeof payload[payloadKey] === 'string') {
                         payload[payloadKey] = payload[payloadKey].replace(fieldRegex, replacementValue);
                    }
                }
            });
        }


        // --- Submit ---
        const response = await letterListResource.insert.submit(payload);
        const newDocName = response?.name; // Adjust based on actual API response structure

        if (!newDocName) {
            throw new Error("Failed to get name of the created document from template.");
        }

        resetDialog();
        emit('navigate-to-edit', newDocName); // Navigate

    } catch (err) {
        console.error("Error creating document from template:", err);
        creationError.value = err.message || "Failed to create document from template. Please check console.";
    } finally {
        isCreating.value = false;
    }
}


// --- Watchers ---
watch(showDialog, (newValue) => {
    if (!newValue) {
        resetDialog(); // Reset when dialog is closed
    } else {
        // Reset just in case before opening
        resetDialog();
    }
});

</script>

<style scoped>
/* Add specific styles for the dialog if needed */
/* Styling for scrollbar in template list */
.max-h-\[400px\]::-webkit-scrollbar {
  width: 6px;
}
.max-h-\[400px\]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
.max-h-\[400px\]::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}
.max-h-\[400px\]::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
