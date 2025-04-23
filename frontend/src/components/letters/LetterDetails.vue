<template>
  <div v-if="isLoading || !letterResource" class="flex items-center justify-center min-h-[60vh]">
    <LoadingIndicator />
  </div>
  <div v-else-if="letterResource.error && !letterResource.doc" class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <FeatherIcon name="alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p class="text-gray-600">Failed to load document details.</p>
      <Button variant="subtle" @click="goBack" class="mt-4">Go Back</Button>
    </div>
  </div>

  <div v-else-if="letterResource.doc" class="pb-10">
      <div class="sticky top-0 z-10 bg-white border-b">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-4">
          <Button :variant="'solid'" theme="gray" size="sm" icon="arrow-left" @click="goBack"></Button>
          <div class="flex flex-col min-w-0"> <FormControl v-if="isEditing" type="text" v-model="editableLetterData.title" placeholder="Document Title" class="text-xl font-bold !py-0 !px-1 -ml-1"/>
             <h1 v-else class="text-xl font-bold text-gray-900 truncate">
                {{ letterResource.doc.title || letterResource.doc.name }}
                <span class="text-base font-normal text-gray-500">({{ letterResource.doc.type }})</span>
             </h1>
            <p class="text-sm text-gray-600 hidden md:inline truncate"> {{ letterResource.doc.name }} • Created {{ formatDate(letterResource.doc.creation, DATE_FORMATS.RELATIVE) }} by {{ letterResource.doc.owner }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0"> <Badge :variant="'solid'" :theme="getStatusTheme(letterStatus)">
            {{ letterStatus }}
          </Badge>
          <template v-if="isEditing">
              <Button variant="subtle" @click="cancelEdit" size="sm">Cancel</Button>
              <Button variant="solid" theme="green" @click="saveChanges" size="sm" :loading="isSaving">Save Changes</Button>
          </template>
          <Dropdown v-else :options="actionDropdownOptions">
            <Button>
              <template #icon><FeatherIcon name="more-horizontal" class="h-4 w-4" /></template>
            </Button>
          </Dropdown>
        </div>
      </div>
    </div>

    <div v-if="!isEditing">
        <div v-if="letterStatus === 'Cancelled'" class="bg-red-100 px-6 py-4 border-b">
          <div class="flex items-start rounded-lg">
            <div class="flex-shrink-0"><FeatherIcon name="x-circle" class="h-5 w-5 text-red-400" /></div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Cancelled Document</h3>
              <div class="mt-2 text-sm text-red-700">
                This document was cancelled. Reason: {{ letterResource.doc.cancellation_reason || 'Not specified' }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="letterStatus === 'Final' && !letterResource.doc.deliverable" class="bg-yellow-100 px-6 py-4 border-b">
             <div class="flex items-start rounded-lg">
                <div class="flex-shrink-0"><FeatherIcon name="alert-triangle" class="h-5 w-5 text-yellow-500" /></div>
                <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">Deliverable Missing</h3>
                <div class="mt-2 text-sm text-yellow-700">
                    This document is Final, but the signed deliverable has not been uploaded yet.
                </div>
                 <div class="mt-3">
                     <Button size="sm" variant="outline" @click="showDeliverableDialog = true">Upload Deliverable</Button>
                 </div>
                </div>
            </div>
        </div>
    </div>


    <div class="space-y-6 p-6">

         <div class="bg-white rounded-lg border shadow-sm p-6">
             <h2 class="text-lg font-medium text-gray-900 mb-4">Details</h2>
             <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                 <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Date</label>
                    <FormControl v-if="isEditing && letterStatus === 'Draft'" type="date" v-model="editableLetterData.date" size="sm" variant="subtle" class="-ml-2"/>
                    <p v-else class="text-gray-900">{{ formatDate(letterResource.doc.date || letterResource.doc.creation) }}</p>
                 </div>
                 <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Type</label>
                     <FormControl v-if="isEditing" type="select" v-model="editableLetterData.type" size="sm" variant="subtle" :options="[{label:'Letter', value:'LTR'}, {label:'Form', value:'FRM'}]" class="-ml-2"/>
                    <p v-else class="text-gray-900">{{ letterResource.doc.type }}</p>
                 </div>
                 <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    <p class="text-gray-900">{{ letterStatus }}</p>
                 </div>

                 <div class="md:col-span-3">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.subject" size="sm" variant="subtle" placeholder="Enter subject" class="-ml-2"/>
                    <p v-else class="text-gray-900">{{ letterResource.doc.subject || '-' }}</p>
                 </div>
                  <div v-if="isEditing ? editableLetterData.arabic : letterResource.doc.arabic" class="md:col-span-3">
                    <label class="block text-xs font-medium text-gray-500 mb-1" dir="rtl">Subject (Arabic)</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.subject_ar" size="sm" variant="subtle" placeholder="Enter subject (Arabic)" dir="rtl" class="-ml-2"/>
                    <p v-else class="text-gray-900" dir="rtl">{{ letterResource.doc.subject_ar || '-' }}</p>
                 </div>


                 <div class="md:col-span-3">
                    <label class="block text-xs font-medium text-gray-500 mb-1">To</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.to" size="sm" variant="subtle" placeholder="Recipient name/department" class="-ml-2"/>
                    <p v-else class="text-gray-900">{{ letterResource.doc.to || '-' }}</p>
                 </div>
                  <div v-if="isEditing ? editableLetterData.arabic : letterResource.doc.arabic" class="md:col-span-3">
                    <label class="block text-xs font-medium text-gray-500 mb-1" dir="rtl">To (Arabic)</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.to_ar" size="sm" variant="subtle" placeholder="Recipient (Arabic)" dir="rtl" class="-ml-2"/>
                    <p v-else class="text-gray-900" dir="rtl">{{ letterResource.doc.to_ar || '-' }}</p>
                 </div>

                 <div class="md:col-span-1">
                     <label class="block text-xs font-medium text-gray-500 mb-1">Author</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.author" size="sm" variant="subtle" placeholder="Author Name" class="-ml-2"/>
                     <p v-else class="text-gray-900">{{ letterResource.doc.author || '-' }}</p>
                 </div>
                 <div class="md:col-span-2">
                     <label class="block text-xs font-medium text-gray-500 mb-1">Author Title</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.author_title" size="sm" variant="subtle" placeholder="Author Title" class="-ml-2"/>
                     <p v-else class="text-gray-900">{{ letterResource.doc.author_title || '-' }}</p>
                 </div>
                  <div v-if="isEditing ? editableLetterData.arabic : letterResource.doc.arabic" class="md:col-span-1">
                     <label class="block text-xs font-medium text-gray-500 mb-1" dir="rtl">Author (Arabic)</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.author_ar" size="sm" variant="subtle" placeholder="Author (Arabic)" dir="rtl" class="-ml-2"/>
                     <p v-else class="text-gray-900" dir="rtl">{{ letterResource.doc.author_ar || '-' }}</p>
                 </div>
                 <div v-if="isEditing ? editableLetterData.arabic : letterResource.doc.arabic" class="md:col-span-2">
                     <label class="block text-xs font-medium text-gray-500 mb-1" dir="rtl">Author Title (Arabic)</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.author_title_ar" size="sm" variant="subtle" placeholder="Author Title (Arabic)" dir="rtl" class="-ml-2"/>
                     <p v-else class="text-gray-900" dir="rtl">{{ letterResource.doc.author_title_ar || '-' }}</p>
                 </div>


                 <div class="md:col-span-1">
                     <label class="block text-xs font-medium text-gray-500 mb-1">Signee</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.signee" size="sm" variant="subtle" placeholder="Signee Name" class="-ml-2"/>
                     <p v-else class="text-gray-900">{{ letterResource.doc.signee || '-' }}</p>
                 </div>
                 <div class="md:col-span-2">
                     <label class="block text-xs font-medium text-gray-500 mb-1">Signee Title</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.signee_title" size="sm" variant="subtle" placeholder="Signee Title" class="-ml-2"/>
                     <p v-else class="text-gray-900">{{ letterResource.doc.signee_title || '-' }}</p>
                 </div>
                  <div v-if="isEditing ? editableLetterData.arabic : letterResource.doc.arabic" class="md:col-span-1">
                     <label class="block text-xs font-medium text-gray-500 mb-1" dir="rtl">Signee (Arabic)</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.signee_ar" size="sm" variant="subtle" placeholder="Signee (Arabic)" dir="rtl" class="-ml-2"/>
                     <p v-else class="text-gray-900" dir="rtl">{{ letterResource.doc.signee_ar || '-' }}</p>
                 </div>
                 <div v-if="isEditing ? editableLetterData.arabic : letterResource.doc.arabic" class="md:col-span-2">
                     <label class="block text-xs font-medium text-gray-500 mb-1" dir="rtl">Signee Title (Arabic)</label>
                     <FormControl v-if="isEditing" type="text" v-model="editableLetterData.signee_title_ar" size="sm" variant="subtle" placeholder="Signee Title (Arabic)" dir="rtl" class="-ml-2"/>
                     <p v-else class="text-gray-900" dir="rtl">{{ letterResource.doc.signee_title_ar || '-' }}</p>
                 </div>

                 <div v-if="isEditing" class="md:col-span-3 border-t pt-4 mt-2 flex items-center gap-6">
                      <Checkbox label="English" v-model="editableLetterData.english" />
                      <Checkbox label="Arabic" v-model="editableLetterData.arabic" />
                      <Checkbox v-if="editableLetterData.english && editableLetterData.arabic" label="Two Columns" v-model="editableLetterData.two_column" />
                 </div>


             </div>
              <div v-if="!isEditing" class="mt-4 pt-4 border-t text-xs text-gray-500">
                Last modified: {{ formatDate(letterResource.doc.modified, DATE_FORMATS.FULL_DATE_TIME) }} by {{ letterResource.doc.modified_by }}
            </div>
        </div>

        <div class="bg-white rounded-lg border shadow-sm">
            <div class="px-6 py-4 border-b">
                <h2 class="text-lg font-medium text-gray-900">Content</h2>
            </div>
            <div class="p-6">
                 <div :class="{'grid grid-cols-2 gap-6': shouldShowTwoColumns }">
                    <div v-if="(isEditing ? editableLetterData.english : letterResource.doc.english)">
                         <h3 v-if="shouldShowTwoColumns && !isEditing" class="font-semibold mb-2 border-b pb-1 text-sm text-gray-600">English</h3>
                         <TextEditor v-if="isEditing" editor-class="min-h-[300px]" :content="editableLetterData.content" @change="val => editableLetterData.content = val" :fixed-menu="true"/>
                         <div v-else class="prose prose-sm max-w-none" v-html="letterResource.doc.content || '<p class=\'text-gray-400\'>No English content.</p>'"></div>
                    </div>
                     <div v-if="(isEditing ? editableLetterData.arabic : letterResource.doc.arabic)" :dir="shouldShowTwoColumns ? 'rtl' : 'ltr'">
                         <h3 v-if="shouldShowTwoColumns && !isEditing" class="font-semibold mb-2 border-b pb-1 text-sm text-gray-600">Arabic</h3>
                         <TextEditor v-if="isEditing" editor-class="min-h-[300px]" :content="editableLetterData.content_ar" @change="val => editableLetterData.content_ar = val" :fixed-menu="true" dir="rtl"/>
                         <div v-else class="prose prose-sm max-w-none" dir="rtl" v-html="letterResource.doc.content_ar || '<p class=\'text-gray-400\'>No Arabic content.</p>'"></div>
                    </div>
                </div>
                 <div v-if="isEditing && !editableLetterData.english && !editableLetterData.arabic" class="text-gray-500 text-center py-4">
                    Please select at least one language (English or Arabic) in the details section to edit content.
                 </div>
                  <div v-if="!isEditing && !letterResource.doc.english && !letterResource.doc.arabic" class="text-gray-500 text-center py-4">
                    No content available. Please edit the document to select a language and add content.
                 </div>
            </div>
        </div>

        <div v-if="!isEditing && letterResource.doc.signature" class="bg-white rounded-lg border shadow-sm">
             <div class="px-6 py-4 border-b"><h2 class="text-lg font-medium text-gray-900">Signature</h2></div>
             <div class="p-6 flex justify-center">
                 <img :src="letterResource.doc.signature" alt="Signature" class="max-w-xs border rounded"/>
             </div>
         </div>

         <div v-if="!isEditing" class="bg-white rounded-lg border shadow-sm">
             <div class="flex items-center justify-between px-6 py-4 border-b">
                 <h2 class="text-lg font-medium text-gray-900">Deliverable</h2>
                 <Button
                    v-if="letterStatus === 'Draft' || letterStatus === 'Final'"
                    variant="subtle"
                    size="sm"
                    @click="showDeliverableDialog = true">
                    {{ letterResource.doc.deliverable ? 'Replace' : 'Upload' }} Deliverable
                 </Button>
             </div>
              <div class="p-6">
                  <div v-if="letterResource.doc.deliverable" class="text-center">
                       <a :href="letterResource.doc.deliverable" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline inline-flex items-center gap-2">
                            <FeatherIcon :name="getFileIcon(letterResource.doc.deliverable)" class="w-5 h-5" />
                            View/Download Deliverable
                       </a>
                  </div>
                   <div v-else class="text-center text-gray-500 py-4">
                       No deliverable uploaded.
                   </div>
              </div>
         </div>
     </div>

      <Dialog v-model="showCancelDialog" :options="cancelDialogOptions">
          <template #body-content>
              <div class="space-y-4">
                  <Textarea v-model="cancellationReason" label="Reason for Cancellation" required placeholder="Enter reason..." />
                  <p v-if="cancelError" class="text-sm text-red-500">{{ cancelError }}</p>
              </div>
          </template>
      </Dialog>

      <Dialog v-model="showFinalizeDialog" :options="finalizeDialogOptions">
           <template #body-content><p>Are you sure you want to finalize this document? It cannot be edited further.</p></template>
      </Dialog>

      <Dialog v-model="showDeliverableDialog" :options="deliverableDialogOptions">
            <template #body-content>
                <FileUploader
                    v-model="newDeliverableFile"
                    :upload-args="deliverableUploadArgs"
                    @success="handleDeliverableUploadSuccess"
                    v-slot="{ openFileSelector, file, uploading, progress, error }"
                    :accept="['application/pdf', 'image/*']"
                    :max-size="10000000" >
                    <div class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-gray-900" @click="openFileSelector">
                        <template v-if="!file">
                            <FeatherIcon name="upload-cloud" class="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p>Click or drag file to upload (PDF, Image up to 10MB)</p>
                        </template>
                        <template v-else>
                            <p class="font-medium truncate">{{ file.name }}</p>
                            <div v-if="uploading" class="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div class="bg-gray-900 h-2 rounded-full" :style="{ width: progress + '%' }"></div>
                            </div>
                            <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
                            <Button v-if="!uploading" size="sm" variant="link" theme="red" @click.stop="newDeliverableFile = null" class="mt-2">Remove</Button>
                        </template>
                    </div>
                </FileUploader>
                <p v-if="deliverableError" class="text-sm text-red-500 mt-2">{{ deliverableError }}</p>
            </template>
            <template #actions>
                <Button variant="subtle" @click="cancelDeliverableUpload">Cancel</Button>
                <Button variant="solid" :loading="deliverableLoading" :disabled="!newDeliverableFile || !uploadedDeliverableResult" @click="saveDeliverable">
                    Save Deliverable
                </Button>
            </template>
      </Dialog>

       <SignDocument
            v-if="letterResource?.doc"
            v-model="showSignDialog"
            doctype="RUA Letter"
            :docname="letterResource.doc.name"
            field_name="signature"
            @signature-complete="handleSignatureComplete"
        />

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLetterResource } from '@/data/letter' // Adjust path
import SignDocument from '@/components/common/SignDocument.vue'
import {
  Button, Badge, FeatherIcon, Dropdown, Dialog, Textarea,
  LoadingIndicator, FileUploader, FormControl, Checkbox, TextEditor // Added FormControl, Checkbox, TextEditor
} from 'frappe-ui'
import { formatDate, getStatusTheme, DATE_FORMATS, getFileIcon } from '@/utils/format'

const props = defineProps({
  id: { type: String, required: true }
})

const router = useRouter()
const route = useRoute()

const letterResource = ref(null)
const isEditing = ref(false)
const editableLetterData = ref({}) // Holds a copy for editing
const isSaving = ref(false)
const isLoading = ref(true) // Combined loading state

const showCancelDialog = ref(false)
const showFinalizeDialog = ref(false)
const showDeliverableDialog = ref(false)
const showSignDialog = ref(false)

const cancellationReason = ref('')
const cancelError = ref('')
const statusUpdateLoading = ref(false)

const newDeliverableFile = ref(null)
const uploadedDeliverableResult = ref(null)
const deliverableLoading = ref(false)
const deliverableError = ref('')

// Computed property for status, handles potential null doc
const letterStatus = computed(() => letterResource.value?.doc?.status || 'Draft')

// Determine if edit mode should be active initially based on query param
// This watcher is now primarily for initial load check
watch(() => route.query, (newQuery) => {
    // Check is done within loadData after data is available
}, { immediate: true });


const shouldShowTwoColumns = computed(() => {
    // Use editable data if editing, otherwise use resource data
    const data = isEditing.value ? editableLetterData.value : letterResource.value?.doc;
    // Ensure data and properties exist before checking
    return !!(data?.english && data?.arabic && data?.two_column);
})

const deliverableUploadArgs = computed(() => ({
  doctype: 'RUA Letter',
  docname: props.id,
  fieldname: 'deliverable',
  // is_private: 1 // Make private if needed
}))


const actionDropdownOptions = computed(() => {
  if (!letterResource.value?.doc) return [];

  const manageItems = [
    {
      label: 'Download PDF',
      icon: () => h(FeatherIcon, { name: 'download' }),
      onClick: () => triggerRcPdfDownload(),
    },
    {
      label: 'Print',
      icon: () => h(FeatherIcon, { name: 'printer' }),
      onClick: () => triggerRcPdfDownload(true),
    },
  ];

  if (letterStatus.value === 'Draft') {
    manageItems.push(
      {
        label: 'Edit',
        icon: () => h(FeatherIcon, { name: 'edit-2' }),
        onClick: startEditing,
      },
      {
        label: 'Finalize',
        icon: () => h(FeatherIcon, { name: 'check-circle' }),
        onClick: () => (showFinalizeDialog.value = true),
      },
      {
        label: 'Sign Document',
        icon: () => h(FeatherIcon, { name: 'pen-tool' }),
        onClick: () => (showSignDialog.value = true),
      }
    );
  }

  const dangerItems = [];

  if (letterStatus.value === 'Draft') {
    dangerItems.push(
      {
        label: 'Cancel Document',
        icon: () => h(FeatherIcon, { name: 'x-circle' }),
        theme: 'danger',
        onClick: () => (showCancelDialog.value = true),
      },
      {
        label: 'Duplicate & Cancel',
        icon: () => h(FeatherIcon, { name: 'copy' }),
        theme: 'warning',
        onClick: duplicateAndCancel,
      }
    );
  }

  if (letterStatus.value === 'Final') {
    if (!letterResource.value.doc.signature) {
      manageItems.push({
        label: 'Sign Document',
        icon: () => h(FeatherIcon, { name: 'pen-tool' }),
        onClick: () => (showSignDialog.value = true),
      });
    }

    if (!letterResource.value.doc.deliverable) {
      manageItems.push({
        label: 'Upload Deliverable',
        icon: () => h(FeatherIcon, { name: 'upload-cloud' }),
        onClick: () => (showDeliverableDialog.value = true),
      });
    }
  }

  const options = [];

  if (manageItems.length) {
    options.push({ group: 'Manage', items: manageItems });
  }

  if (dangerItems.length) {
    options.push({ group: 'Danger Zone', items: dangerItems });
  }

  return options;
});


// --- Dialog Options ---
const cancelDialogOptions = computed(() => ({
  title: 'Cancel Document', size: 'sm',
  actions: [{
    label: 'Confirm Cancellation', variant: 'solid', theme: 'red',
    loading: statusUpdateLoading.value,
    disabled: !cancellationReason.value,
    onClick: cancelDocument
  }]
}));

const finalizeDialogOptions = computed(() => ({
    title: 'Finalize Document', size: 'sm',
    actions: [{
        label: 'Confirm Finalize', variant: 'solid',
        loading: statusUpdateLoading.value,
        onClick: finalizeDocument
    }]
}));

const deliverableDialogOptions = computed(() => ({
    title: letterResource.value?.doc?.deliverable ? 'Replace Deliverable' : 'Upload Deliverable',
    size: 'md',
    // Actions defined in template slot
}))

// --- Methods ---

function startEditing() {
    if (letterStatus.value !== 'Draft' || !letterResource.value?.doc) return;
    // Deep clone
    editableLetterData.value = JSON.parse(JSON.stringify(letterResource.value.doc));
    // Ensure boolean fields are boolean for checkboxes
    editableLetterData.value.english = !!editableLetterData.value.english;
    editableLetterData.value.arabic = !!editableLetterData.value.arabic;
    editableLetterData.value.two_column = !!editableLetterData.value.two_column;
    isEditing.value = true;
}

function cancelEdit() {
    isEditing.value = false;
    editableLetterData.value = {}; // Clear the copy
}

async function saveChanges() {
    if (!letterResource.value?.doc) return; // Guard against saving without data
    isSaving.value = true;
    try {
        const payload = { ...editableLetterData.value };
        // Convert boolean flags back to 0/1
        payload.english = payload.english ? 1 : 0;
        payload.arabic = payload.arabic ? 1 : 0;
        payload.two_column = payload.two_column ? 1 : 0;

        // Prepare payload for setValue - only include changed fields potentially
        // Or send all editable fields, let backend handle it.
        // Remove system fields that shouldn't be sent
        const systemFields = ['name', 'doctype', 'owner', 'creation', 'modified', 'modified_by', 'idx', 'docstatus', 'status', 'signature', 'deliverable', 'cancellation_reason'];
        systemFields.forEach(f => delete payload[f]);

        await letterResource.value.setValue.submit(payload);
        await letterResource.value.reload();
        isEditing.value = false;
    } catch (error) {
        console.error("Failed to save changes:", error);
        alert("Error saving changes. Please check console."); // Basic user feedback
    } finally {
        isSaving.value = false;
    }
}


function goBack() {
  if (isEditing.value) {
      if(confirm("You have unsaved changes. Are you sure you want to leave?")) {
           isEditing.value = false;
           router.push({ name: 'LettersForms' });
      }
  } else {
       router.push({ name: 'LettersForms' });
  }
}

async function updateStatus(status, reason = null) {
    if (!letterResource.value?.doc) return false; // Guard
    statusUpdateLoading.value = true;
    cancelError.value = '';
    try {
        const payload = { name: props.id, status: status };
        if (status === 'Cancelled' && reason) {
            payload.cancellation_reason = reason;
        }
        await letterResource.value.setValue.submit(payload);
        await letterResource.value.reload();
        return true;
    } catch (error) {
        console.error(`Failed to set status to ${status}:`, error);
        cancelError.value = `Failed to ${status.toLowerCase()} document.`;
        return false;
    } finally {
        statusUpdateLoading.value = false;
    }
}

async function cancelDocument() {
    if (!cancellationReason.value) {
        cancelError.value = "Reason is required.";
        return;
    }
    const success = await updateStatus('Cancelled', cancellationReason.value);
    if (success) {
        showCancelDialog.value = false;
        cancellationReason.value = '';
    }
}

async function finalizeDocument() {
     const success = await updateStatus('Final');
     if (success) {
        showFinalizeDialog.value = false;
     }
}

async function duplicateAndCancel() {
    if (isEditing.value) {
        alert("Please save or cancel your current edits before duplicating.");
        return;
    }
    if (!confirm('Are you sure you want to cancel this document and create a duplicate draft? This cannot be undone.')) return;
    if (!letterResource.value?.doc) return; // Guard

    statusUpdateLoading.value = true;
    try {
        const currentDoc = letterResource.value.doc;
        const newDocData = { ...currentDoc };
        // Prepare data for new draft
        const fieldsToDelete = ['name', 'creation', 'modified', 'modified_by', 'owner', 'idx', 'docstatus', 'status', 'cancellation_reason', 'deliverable', 'signature'];
        fieldsToDelete.forEach(f => delete newDocData[f]);
        newDocData.doctype = 'RUA Letter'; // Ensure doctype

        // Create new draft
        const newDoc = await letterResource.value.insert.submit(newDocData);
        if (!newDoc?.name) throw new Error("Failed to create duplicate.");

        // Cancel current document
        const reason = prompt("Enter reason for cancelling the original document:", "Duplicated");
        if (reason === null) {
            // Consider deleting the duplicate if user cancels the reason prompt
            // Requires API call: await frappe.db.delete_doc('RUA Letter', newDoc.name);
            throw new Error("Cancellation aborted by user.");
        }
        const cancelSuccess = await updateStatus('Cancelled', reason);
        if (!cancelSuccess) {
             // Handle cancellation failure (maybe alert user?)
             throw new Error("Failed to cancel the original document after duplication.");
        }

        // Navigate to the new draft in edit mode
        router.push({ name: 'LetterDetails', params: { id: newDoc.name }, query: { edit: 'true' } });

    } catch(error) {
         console.error("Failed to duplicate and cancel:", error);
         alert(`Error: ${error.message || 'Failed to duplicate and cancel.'}`);
    } finally {
         statusUpdateLoading.value = false;
    }
}


function handleDeliverableUploadSuccess(result) {
    uploadedDeliverableResult.value = result;
    deliverableError.value = '';
}

function cancelDeliverableUpload() {
    showDeliverableDialog.value = false;
    newDeliverableFile.value = null;
    uploadedDeliverableResult.value = null;
    deliverableError.value = '';
}

async function saveDeliverable() {
    if (!uploadedDeliverableResult.value?.file_url) {
        deliverableError.value = "Please upload a file first.";
        return;
    }
    if (!letterResource.value?.doc) return; // Guard
    deliverableLoading.value = true;
    deliverableError.value = '';
    try {
         await letterResource.value.setValue.submit({
             name: props.id,
             deliverable: uploadedDeliverableResult.value.file_url
         });
         await letterResource.value.reload();
         cancelDeliverableUpload(); // Close and reset dialog
    } catch (error) {
         console.error("Failed to save deliverable:", error);
         deliverableError.value = "Failed to save deliverable.";
    } finally {
        deliverableLoading.value = false;
    }
}

async function handleSignatureComplete(signatureUrl) {
    if (!signatureUrl || !letterResource.value?.doc) return;
    try {
        await letterResource.value.setValue.submit({
            name: props.id,
            signature: signatureUrl
        });
        await letterResource.value.reload();
        showSignDialog.value = false;
    } catch (error) {
        console.error('Failed to update signature:', error);
        alert('Failed to save signature.');
    }
}

function triggerRcPdfDownload(print = false) {
    let baseUrl = window.location.origin;
    if (window.location.hostname === 'localhost' && window.location.port === '8080') {
        baseUrl = `http://${window.location.hostname}:8000`;
    }
    const docName = props.id;
    if (!docName) return;
    const docType = 'RUA Letter';
    const printFormat = 'RUA-LETTER'; // ENSURE THIS IS CORRECT

    const apiUrl = print
        ? `${baseUrl}/api/method/frappe.utils.print_format.show_pdf`
        : `${baseUrl}/api/method/frappe.utils.print_format.download_pdf`;

    const queryParams = new URLSearchParams({
        doctype: docType, name: docName, format: printFormat,
        no_letterhead: 1, _lang: 'en'
    });
    const finalUrl = `${apiUrl}?${queryParams.toString()}`;
    window.open(finalUrl, '_blank');
}

// --- Lifecycle and Watchers ---
async function loadData() {
    isLoading.value = true;
    isEditing.value = false; // Reset edit mode on load
    editableLetterData.value = {}; // Clear edit data
    try {
        // Ensure resource is created or re-created for the current ID
        letterResource.value = createLetterResource(props.id);
        // Wait for the data promise to resolve
        await letterResource.value.promise;

        // Check if the loaded document exists
        if (!letterResource.value.doc) {
             // Handle case where document doesn't exist (e.g., show error, redirect)
             console.error(`Document with ID ${props.id} not found.`);
             // Optionally set an error state or redirect
             // letterResource.value.error = true; // Simulate an error state if needed
             isLoading.value = false;
             return; // Stop further processing
        }

        // Now that data is loaded, check if we should enter edit mode
         await nextTick(); // Ensure reactivity updates before checking route query
         
         if (route.query.edit === 'true' && letterStatus.value === 'Draft') {
            startEditing();
            // Clean the URL query parameter
            router.replace({ query: { ...route.query, edit: undefined } });
        }

    } catch (error) {
        console.error("Error loading letter details:", error);
        if (!letterResource.value) {
             letterResource.value = { error: true }; // Set error state if resource creation failed
        } else {
            letterResource.value.error = true; // Set error state on existing resource
        }
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
  loadData();
  console.log(letterResource.doc)
});

// Reload data if the ID prop changes
watch(() => props.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
     loadData(); // Reload data for the new ID
  }
});

</script>

<style scoped>
.prose { max-width: none; }
.prose[dir="rtl"] { text-align: right; }
/* Style inputs in edit mode to look integrated */
[data-fieldname] .frappe-control .form-control {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
}
h1 > .frappe-control .form-control {
    font-size: 1.25rem !important; /* Match h1 size */
    font-weight: 700 !important;
    line-height: 1.75rem !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}
</style>