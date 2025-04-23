<template>
 <Dialog v-model="showDialog" :options="dialogOptions">
    <template #body-content>
      <div class="space-y-6 min-h-[300px]"> <div v-if="currentStage === 1" class="space-y-4">
            <h3 class="text-lg font-medium text-center mb-6">How would you like to start?</h3>
            <div class="grid grid-cols-2 gap-6">
                <div class="border rounded-lg p-6 text-center cursor-pointer hover:shadow-md hover:border-gray-400 transition-all"
                     @click="selectStartMode('blank')">
                     <FeatherIcon name="file-plus" class="w-12 h-12 mx-auto text-gray-500 mb-3"/>
                     <p class="font-semibold">Start Blank</p>
                     <p class="text-sm text-gray-500">Create a new document from scratch.</p>
                </div>
                <div class="border rounded-lg p-6 text-center cursor-pointer hover:shadow-md hover:border-gray-400 transition-all"
                     @click="selectStartMode('template')">
                     <FeatherIcon name="layout" class="w-12 h-12 mx-auto text-gray-500 mb-3"/>
                     <p class="font-semibold">Start From Template</p>
                     <p class="text-sm text-gray-500">Use a pre-defined template.</p>
                </div>
            </div>
        </div>

        <div v-if="currentStage === 2 && startMode === 'blank'" class="space-y-6">
             <h3 class="text-lg font-medium text-center mb-6">What are you creating?</h3>
             <div class="grid grid-cols-2 gap-6">
                 <div class="border rounded-lg p-6 text-center cursor-pointer hover:shadow-md hover:border-gray-400 transition-all"
                      :class="{'border-2 border-gray-900 bg-gray-50': creationConfig.type === 'LTR'}"
                      @click="creationConfig.type = 'LTR'">
                      <FeatherIcon name="mail" class="w-12 h-12 mx-auto text-gray-500 mb-3"/>
                      <p class="font-semibold">Letter</p>
                      <p class="text-sm text-gray-500">General official letters.</p>
                 </div>
                 <div class="border rounded-lg p-6 text-center cursor-pointer hover:shadow-md hover:border-gray-400 transition-all"
                      :class="{'border-2 border-gray-900 bg-gray-50': creationConfig.type === 'FRM'}"
                       @click="creationConfig.type = 'FRM'">
                      <FeatherIcon name="file-text" class="w-12 h-12 mx-auto text-gray-500 mb-3"/>
                      <p class="font-semibold">Form</p>
                      <p class="text-sm text-gray-500">Structured documents like reports.</p>
                 </div>
             </div>
             <div class="flex justify-center pt-4">
                <Checkbox label="Save this as a Template" v-model="creationConfig.is_template" />
             </div>
        </div>

        <div v-if="currentStage === 2 && startMode === 'template'" class="space-y-4">
            <h3 class="text-lg font-medium text-center mb-6">Select a Template</h3>
             <div v-if="templatesLoading" class="text-center text-gray-500 py-4">
                 <LoadingIndicator /> Loading templates...
             </div>
             <div v-else-if="availableTemplates.length === 0" class="text-center text-gray-500 py-4">No templates found.</div>
             <div v-else>
                <FormControl
                    type="autocomplete"
                    label="Choose Template"
                    required
                    placeholder="Search templates..."
                    v-model="creationConfig.selectedTemplateName"
                    :options="templateOptions"
                    :emit-value="true" />
                 <div v-if="selectedTemplateDetails" class="mt-4 p-3 border rounded bg-gray-50 text-xs">
                     <p><strong>Type:</strong> {{ selectedTemplateDetails.type }}</p>
                     <p v-if="selectedTemplateDetails.subject"><strong>Subject:</strong> {{ selectedTemplateDetails.subject }}</p>
                 </div>
             </div>
        </div>

        <FillTemplateDialog
            v-if="currentStage === 3"
            v-model="showFillTemplateDialog"
            :fields="templateBlanks"
            @submit="handleBlanksFilled"
            @cancel="currentStage = 2" 
         />

      </div>
    </template>

    <template #actions>
       <div class="flex justify-between w-full">
            <Button variant="subtle" @click="goBackOrCancel">
                {{ currentStage === 1 ? 'Cancel' : 'Back' }}
            </Button>
            <Button variant="solid" @click="goToNextStage" :disabled="!canProceed || isCreating" :loading="isCreating">
                 {{ nextButtonText }}
            </Button>
       </div>
    </template>
 </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
  Dialog, Button, FormControl, Checkbox, Autocomplete, FeatherIcon,
  LoadingIndicator, createListResource // Import createListResource here
} from 'frappe-ui';
import { letterResource } from '@/data/letter'; // Main resource for *creating*
import { getServerDate } from '@/utils/format';
import FillTemplateDialog from './FillTemplateDialog.vue'; // Assuming this exists

const props = defineProps({
    modelValue: Boolean, // v-model for visibility
});

const emit = defineEmits(['update:modelValue', 'navigate-to-detail']);

const showDialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const currentStage = ref(1); // 1: Start Mode, 2: Type/Select Template, 3: Fill Blanks
const startMode = ref(''); // 'blank' or 'template'
const templatesLoading = ref(false);
const availableTemplates = ref([]);
const templateBlanks = ref([]);
const showFillTemplateDialog = ref(false); // To control the sub-dialog visibility *within* stage 3
const filledBlanksData = ref({});
const isCreating = ref(false);

const creationConfig = ref({
    type: 'LTR', // Default if blank
    is_template: false,
    selectedTemplateName: null, // Store the *name* (value) of the selected template
});

// Computed property to get the full details of the selected template
const selectedTemplateDetails = computed(() => {
    // Now correctly looks up using the string name bound by v-model thanks to emit-value
    if (!creationConfig.value.selectedTemplateName) return null;
    return availableTemplates.value.find(t => t.name === creationConfig.value.selectedTemplateName.value);
});

// Options for the Autocomplete component
const templateOptions = computed(() => {
    return availableTemplates.value.map(t => ({
        label: t.title || t.name, // Display title or name
        value: t.name // The actual value to store
    }));
});

// Options for the main Dialog component
const dialogOptions = computed(() => ({
    title: "Create New Letter or Form",
    size: 'lg',
}));

// Determines if the "Next" or "Create" button should be enabled
const canProceed = computed(() => {
    if (currentStage.value === 1) {
        return !!startMode.value; // Must choose Blank or Template
    }
    if (currentStage.value === 2) {
        if (startMode.value === 'blank') {
            return !!creationConfig.value.type; // Must choose LTR or FRM
        } else { // startMode === 'template'
            // Check if a template name (string) has been selected
            return !!creationConfig.value.selectedTemplateName;
        }
    }
    // Stage 3 (Fill Blanks) has its own validation within its dialog
    return false; // Disable main next button during stage 3
});

// Text for the main action button
const nextButtonText = computed(() => {
     if (currentStage.value === 1) return 'Next';
     if (currentStage.value === 2) {
         if (startMode.value === 'blank') return 'Create Document';
         // If template mode, determine button text based on whether blanks need filling
         const template = selectedTemplateDetails.value; // Use computed property here
         if (template) {
             const blanks = parseTemplateForBlanks(template);
             return blanks.length > 0 ? 'Fill Details' : 'Create Document';
         }
         // If template selected but details not yet computed, still show Create
         return 'Create Document';
     }
     // Stage 3 is handled by FillTemplateDialog, this button shouldn't be active
     return 'Create';
});

// --- Methods ---

// Called when user clicks "Start Blank" or "Start From Template"
function selectStartMode(mode) {
    startMode.value = mode;
    // Reset subsequent choices
    creationConfig.value = { type: 'LTR', is_template: false, selectedTemplateName: null };
    availableTemplates.value = [];
    templateBlanks.value = [];
    filledBlanksData.value = {};
    currentStage.value = 2; // Move to stage 2
    if (mode === 'template') {
        fetchTemplates(); // Fetch templates if this mode is selected
    }
}

// Fetches templates marked with is_template=1
async function fetchTemplates() {
    templatesLoading.value = true;
    availableTemplates.value = [];
    try {
        // Create a temporary resource instance for this specific fetch
        const templateFetcher = createListResource({
             doctype: 'RUA Letter',
             // Fetch all fields needed for preview, blank parsing, and copying
             fields: ['name', 'title', 'subject', 'type', 'content', 'content_ar', 'to', 'to_ar', 'author', 'author_ar', 'author_title', 'author_title_ar', 'signee', 'signee_ar', 'signee_title', 'signee_title_ar', 'english', 'arabic', 'two_column'],
             filters: [['is_template', '=', 1]],
             limit: 0, // Fetch all matching templates
             auto: false // We trigger fetch manually
        });

        await templateFetcher.reload(); // Manually trigger the fetch
        availableTemplates.value = templateFetcher.data || []; // Store fetched data

    } catch (error) {
        console.error("Failed to fetch templates:", error);
        alert("Error fetching templates. Please check the console."); // User feedback
    } finally {
        templatesLoading.value = false;
    }
}

// Parses template fields for ['field_name'] placeholders
function parseTemplateForBlanks(template) {
    // Fields to scan for placeholders
    const fieldsToScan = ['title', 'title_ar', 'subject', 'subject_ar', 'to', 'to_ar', 'content', 'content_ar'];
    const blanks = new Set(); // Use a Set to avoid duplicate blank names
    const regex = /\[\'(.*?)\'\]/g; // Regex to find ['field_name']

    fieldsToScan.forEach(field => {
        if (template && template[field]) { // Check if template and field exist
            let match;
            regex.lastIndex = 0; // Reset regex index for each field
            while ((match = regex.exec(template[field])) !== null) {
                blanks.add(match[1]); // Add the captured field name
            }
        }
    });
    return Array.from(blanks); // Convert Set to Array
}

// Handles the click on the main action button (Next/Create/Fill Details)
function goToNextStage() {
    if (!canProceed.value || isCreating.value) return; // Prevent action if disabled or already creating

    if (currentStage.value === 2) {
        if (startMode.value === 'blank') {
            // If starting blank, proceed directly to document creation
            createDocument({}); // Pass empty object for blanksData
        } else { // startMode === 'template'
            // Find the selected template object directly using the stored name (string)
            const selectedTemplate = availableTemplates.value.find(
                t => t.name === creationConfig.value.selectedTemplateName.value // This lookup should now work correctly
            );

            // Debugging logs (keep for testing if needed)
            // console.log("Selected Template Name:", creationConfig.value.selectedTemplateName);
            // console.log("Found Template Object:", selectedTemplate);

            if (selectedTemplate) {
                templateBlanks.value = parseTemplateForBlanks(selectedTemplate);
                if (templateBlanks.value.length > 0) {
                    // If blanks exist, move to stage 3 and show the FillTemplateDialog
                    currentStage.value = 3;
                    showFillTemplateDialog.value = true;
                } else {
                    // If no blanks, create document directly using the template data
                    createDocument({}, selectedTemplate); // Pass template object
                }
            } else {
                // This case should ideally not happen if canProceed is true, but handle defensively
                console.error("No template found matching the selected name:", creationConfig.value.selectedTemplateName.value);
                alert("Error: Could not find the selected template details. Please try selecting again.");
            }
        }
    }
    // Note: Navigation from stage 1 to 2 is handled by selectStartMode()
}


// Called when FillTemplateDialog emits 'submit'
function handleBlanksFilled(filledData) {
    filledBlanksData.value = filledData;
    showFillTemplateDialog.value = false; // Hide the sub-dialog
    currentStage.value = 2; // Conceptually move back (for button logic), but immediately create
    // Find the template again to pass to createDocument
    const selectedTemplate = availableTemplates.value.find(t => t.name === creationConfig.value.selectedTemplateName.value);
    if (selectedTemplate) {
        createDocument(filledBlanksData.value, selectedTemplate); // Create with filled data and template
    } else {
         console.error("Template not found after filling blanks. Cannot create document.");
         alert("An error occurred. Could not find the selected template.");
         // Reset state or handle error appropriately
         isCreating.value = false; // Ensure loading state is reset
         currentStage.value = 2; // Go back to template selection
    }
}

// Creates the document via API call
async function createDocument(blanksData, template = null) { // Accept optional template object
    isCreating.value = true;
    let payload = {};

    try {
        if (startMode.value === 'blank') {
            // Prepare payload for a blank document
            payload = {
                doctype: 'RUA Letter',
                type: creationConfig.value.type,
                is_template: creationConfig.value.is_template ? 1 : 0,
                status: creationConfig.value.is_template ? null : 'Draft',
                date: creationConfig.value.is_template ? null : getServerDate(),
                english: 1, arabic: 0, two_column: 0, // Default languages
                title: '', title_ar: '', subject: '', subject_ar: '', to: '', to_ar: '',
                content: '<p></p>', content_ar: '<p></p>',
                author: '', author_ar: '', author_title: '', author_title_ar: '',
                signee: '', signee_ar: '', signee_title: '', signee_title_ar: '',
                specifications: '<p></p>', scope_of_work: '<p></p>', exclusions: '<p></p>', notes: '<p></p>',
                qualifications: '<p></p>', proposal_basis: '<p></p>', terms_and_conditions: '<p></p>',
                duration_and_payment: '<p></p>', maintenance_and_warranty: '<p></p>',
            };
        } else { // startMode === 'template'
            const finalTemplate = template;
            if (!finalTemplate) throw new Error("Selected template data not provided during creation.");

            payload = {
                doctype: 'RUA Letter',
                type: finalTemplate.type,
                is_template: 0,
                status: 'Draft',
                date: getServerDate(),
                ...copyTemplateFields(finalTemplate),
            };

            // *** START REFINED BLANK REPLACEMENT ***
            Object.keys(blanksData).forEach(blankKey => {
                // Escape blankKey for use in RegExp (handles special characters if any)
                const escapedKey = blankKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Regex to find ['blankKey'] globally
                const regex = new RegExp(`\\['${escapedKey}'\\]`, 'g');
                const replacementValue = blanksData[blankKey] || ''; // Use filled value or empty string

                // Iterate through specific fields where replacement is needed
                const fieldsToReplaceIn = [
                    'title', 'title_ar', 'subject', 'subject_ar', 'to', 'to_ar',
                    'content', 'content_ar', // Include TextEditor fields
                    'author', 'author_ar', 'author_title', 'author_title_ar',
                    'signee', 'signee_ar', 'signee_title', 'signee_title_ar',
                    // Add any other text fields from the template that might contain blanks
                    'specifications', 'scope_of_work', 'exclusions', 'notes', 'qualifications',
                    'proposal_basis', 'terms_and_conditions', 'duration_and_payment', 'maintenance_and_warranty'
                ];

                fieldsToReplaceIn.forEach(field => {
                    if (payload[field] && typeof payload[field] === 'string') {
                        payload[field] = payload[field].replace(regex, replacementValue);
                    }
                });
            });
            // *** END REFINED BLANK REPLACEMENT ***
        }

        const newDoc = await letterResource.insert.submit(payload);

        if (newDoc?.name) {
            emit('navigate-to-detail', newDoc.name);
            closeDialog();
        } else {
            throw new Error("Failed to get document name after creation.");
        }

    } catch (error) {
        console.error("Failed to create document:", error);
        alert(`Error creating document: ${error.message || 'Unknown error'}`);
    } finally {
        isCreating.value = false;
    }
}

// Helper function to copy relevant fields from a template object
function copyTemplateFields(template) {
    const fieldsToCopy = [
        'title', 'title_ar', 'subject', 'subject_ar', 'to', 'to_ar',
        'content', 'content_ar', 'author', 'author_ar', 'author_title', 'author_title_ar',
        'signee', 'signee_ar', 'signee_title', 'signee_title_ar',
        'english', 'arabic', 'two_column'
    ];
    const copied = {};
    fieldsToCopy.forEach(field => {
        // Copy field if it exists, otherwise initialize appropriately
        copied[field] = template[field] ?? (['english', 'arabic', 'two_column'].includes(field) ? 0 : '');
    });
    // Ensure language flags are set correctly (default to English if none specified)
    if (copied.english === 0 && copied.arabic === 0) copied.english = 1;
    copied.english = copied.english ? 1 : 0; // Ensure 0 or 1
    copied.arabic = copied.arabic ? 1 : 0;   // Ensure 0 or 1
    // Ensure two_column is only 1 if both languages are enabled
    copied.two_column = (copied.english && copied.arabic && copied.two_column) ? 1 : 0;
    return copied;
}

// Handles Back/Cancel button clicks
function goBackOrCancel() {
    if (currentStage.value === 1) {
        closeDialog(); // Cancel from the first stage
    } else if (currentStage.value === 3) {
         // If cancelling from Fill Blanks sub-dialog, just hide it and go back
         showFillTemplateDialog.value = false;
         currentStage.value = 2;
    }
     else { // currentStage === 2
        // Go back from stage 2 to stage 1
        currentStage.value = 1;
        // Reset choices made in stage 2
        startMode.value = '';
        creationConfig.value = { type: 'LTR', is_template: false, selectedTemplateName: null };
        availableTemplates.value = []; // Clear loaded templates
    }
}

// Resets the dialog state and closes it
function closeDialog() {
    currentStage.value = 1;
    startMode.value = '';
    creationConfig.value = { type: 'LTR', is_template: false, selectedTemplateName: null };
    availableTemplates.value = [];
    templateBlanks.value = [];
    filledBlanksData.value = {};
    showFillTemplateDialog.value = false;
    isCreating.value = false;
    emit('update:modelValue', false); // Close the dialog via v-model
}

// Watcher to reset state if dialog is closed externally (e.g., clicking outside)
watch(() => props.modelValue, (newValue) => {
    if (!newValue) {
       // Could optionally call closeDialog() here, but it might interfere
       // if the dialog is closed *after* successful creation.
       // It's generally safer to reset state *before* closing or *on* opening.
    }
});

</script>

<style scoped>
/* Add subtle animation/transition for stage changes if desired */
</style>
