<template>
  <div class="space-y-8" v-if="projectResource?.doc">

    <div class="px-6 py-4 bg-white border-b flex justify-between items-center">
      <div class="flex items-center space-x-4 flex-wrap gap-y-2">
        <h1 class="text-xl font-semibold text-gray-900 flex-shrink-0">Project Items</h1>

        <Button
          v-if="projectResource.doc?.google_sheet_id && projectResource.doc?.extraction_named_range"
          :variant="'outline'"
          theme="gray"
          size="sm"
          :loading="projectResource?.setLock?.loading"
          @click="handleLockClick"
          :title="isLocked ? 'Unlock items to allow editing via Google Sheet' : 'Lock items from Google Sheet to prepare for Quotation'"
          class="flex-shrink-0"
        >
          <template #default>
            <div class="flex items-center gap-2">
              <FeatherIcon :name="isLocked ? 'lock' : 'unlock'" class="w-4 h-4" />
              <span>{{ isLocked ? 'Locked' : 'Unlocked' }}</span>
            </div>
          </template>
        </Button>

        <span v-else-if="!isInitializing && !isLocked" class="text-sm text-orange-600 flex items-center gap-2 flex-shrink-0" title="Configure in Project settings or wait for automatic setup">
          <FeatherIcon name="alert-triangle" class="w-4 h-4" />
          Sheet configuration pending.
        </span>

        <span v-if="lockStatusMessage" class="text-sm ml-4 transition-opacity duration-300 flex-shrink-0" :class="lockStatusClass">
          {{ lockStatusMessage }}
        </span>
         <span v-else-if="isInitializing" class="text-sm ml-4 text-gray-500 flex items-center gap-1 flex-shrink-0">
           <div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
           Initializing...
         </span>
      </div>

      <div v-if="isLocked && lockedData && !lockedData.error" class="text-sm text-gray-600 text-right flex-shrink-0">
        Locked by {{ lockedData.user === session.user ? 'you' : lockedData.user }}
        on {{ formatDate(lockedData.timestamp) }}<br>
        <span class="text-xs" title="Named Range used for locking">(Source: {{ lockedData.source_named_range }})</span>
      </div>
       <div v-else-if="isLocked && lockedData?.error" class="text-sm text-red-600 text-right flex-shrink-0">
           Error loading lock details.
       </div>
    </div>

    <template v-if="isLocked">
      <div class="p-4 bg-yellow-50" style="margin-top: 0 !important">
          <p class="text-yellow-800 text-sm">
            <template v-if="lockedData && !lockedData.error">
              <span class="font-medium">Items Locked.</span> Quotations will use data captured on {{ formatDate(lockedData?.timestamp) }} from Named Range '{{ lockedData?.source_named_range }}'.
              <span v-if="canUnlock">
                Click <FeatherIcon name="unlock" class="inline w-3 h-3" /> Unlock to enable changes via Google Sheet.
              </span>
              <span v-else>
                Ask '{{ lockedData?.user }}' or an authorized user to unlock if changes are needed.
              </span>
            </template>
            <template v-else>
              <span class="font-medium text-red-700">Error: Could not load locked item details.</span>
            </template>
          </p>
        </div>

      <div class="overflow-x-auto px-6">
          <div class="border rounded-md min-w-[900px] bg-white">
              <div class="flex items-center px-4 py-2 bg-gray-50 border-b sticky top-0 z-10">
                <div class="flex-1 grid grid-cols-11 gap-4">
                  <div v-for="header in tableHeaders"
                      :key="header.key"
                      class="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wider"
                      :class="[ header.align === 'right' ? 'justify-end' : 'justify-start' ]">
                    <FeatherIcon :name="header.icon" class="w-3 h-3 text-gray-500 flex-shrink-0" v-if="header.icon" />
                    <span class="truncate" :title="header.label">{{ header.label }}</span>
                  </div>
                </div>
              </div>
              <div class="divide-y divide-gray-100">
              <template v-if="lockedRows?.length">
                <div v-for="row in lockedRows"
                    :key="row.id"
                    class="hover:bg-gray-50/50 transition-colors duration-150">
                  <div class="flex items-center px-4 py-2">
                    <div class="flex-1 grid grid-cols-11 gap-4 items-center">
                      <div v-for="header in tableHeaders"
                          :key="header.key"
                          :class="[
                            'text-sm break-words',
                            header.align === 'right' ? 'text-right' : 'text-left',
                            header.key === 'Item Name' ? 'text-gray-900 font-medium' : 'text-gray-700',
                          ]">
                        <Tooltip v-if="header.key === 'Description' && row[header.key]" :text="row[header.key]" placement="top" class="w-full">
                            <span class="line-clamp-2 cursor-help">{{ row[header.key] ?? '' }}</span>
                        </Tooltip>
                        <span v-else-if="typeof row[header.key] === 'number'">{{ formatNumber(row[header.key], header.key) }}</span>
                        <span v-else-if="header.key === 'UOM'">{{ row[header.key] ?? '' }}</span>
                        <span v-else>{{ row[header.key] ?? '' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="flex flex-col items-center justify-center py-12 text-center">
                <FeatherIcon name="info" class="w-10 h-10 text-gray-400 mb-3" />
                <p class="text-base font-medium text-gray-700">No Locked Items Found</p>
                <p class="text-sm text-gray-500">The locked data appears empty or could not be loaded correctly.</p>
                 <p v-if="lockedData?.error" class="text-sm text-red-500 mt-1">{{ lockedData.error }}</p>
              </div>
            </div>
          </div>
        </div>
    </template>

    <template v-else>
      <div class="relative w-full h-full" style="height: 95vh; margin-top: 0 !important">

        <div v-if="isInitializing || sheetLoading" class="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center rounded-md border shadow-sm">
            <div class="text-center space-y-2">
              <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              <p class="text-sm text-gray-600">{{ isInitializing ? 'Initializing sheet setup...' : 'Loading Google Sheet...' }}</p>
            </div>
          </div>

        <div v-if="!isInitializing && sheetError" class="absolute inset-0 bg-red-50 z-10 flex flex-col items-center justify-center p-6 rounded-md border border-red-200 text-center shadow-sm">
            <FeatherIcon name="alert-circle" class="w-10 h-10 text-red-500 mb-3 flex-shrink-0" />
            <p class="text-red-700 font-medium">Error Loading Google Sheet</p>
            <p class="text-sm text-red-600 mt-1 max-w-md">{{ sheetError }}</p>
            <p class="text-xs text-gray-500 mt-3">Check Sheet ID, Named Range, Service Account permissions, and network connection. Refreshing might help.</p>
          </div>

        <div v-if="!isInitializing && !sheetLoading && !sheetError && (!projectResource.doc?.google_sheet_id || !projectResource.doc?.extraction_named_range)" class="absolute inset-6 bg-gray-50 z-10 flex flex-col items-center justify-center p-6 rounded-md border text-center shadow-sm">
            <FeatherIcon name="settings" class="w-10 h-10 text-gray-400 mb-3 flex-shrink-0" />
            <p class="text-gray-700 font-medium">Configuration Incomplete</p>
            <p class="text-sm text-gray-600 mt-1 max-w-md">Automatic setup failed or configuration is missing. Please check Project settings for 'Google Sheet ID' and 'Extraction Named Range'.</p>
          </div>

        <iframe
          v-if="!isInitializing && googleSheetUrl && !sheetError && projectResource.doc?.google_sheet_id && projectResource.doc?.extraction_named_range"
          :src="googleSheetUrl"
          ref="googleSheetIframe"
          frameborder="0"
          class="absolute inset-0 w-full h-full bg-white"
          @load="onSheetLoadSuccess"
          @error="onSheetLoadError"
          allowfullscreen
          title="Project Items Google Sheet"
        ></iframe>
      </div>
    </template>

    <Dialog v-model="showLockDialog">
        <template #body-title>
            <h3>{{ isLocked ? 'Confirm Unlock' : 'Confirm Lock' }}</h3>
        </template>
        <template #body-content>
            <p>
                {{ isLocked
                    ? "Unlocking will allow item details to be updated via the Google Sheet again. Are you sure?"
                    : "Locking will capture the current item details from the Google Sheet's named range for use in Quotations. Further changes in the sheet won't reflect until unlocked. Proceed?"
                }}
            </p>
        </template>
        <template #actions>
            <Button
                variant="solid"
                :theme="isLocked ? 'warning' : 'primary'"
                :loading="props.projectResource?.setLock?.loading ?? false"
                @click="handleLockConfirm"
            >
                {{ isLocked ? 'Unlock Items' : 'Lock Items' }}
            </Button>
            <Button
                variant="subtle"
                class="ml-2"
                @click="showLockDialog = false"
                :disabled="props.projectResource?.setLock?.loading ?? false"
            >
                Cancel
            </Button>
        </template>
    </Dialog>

    <Dialog v-model="showUnauthorizedDialog">
         <template #body-title>
             <h3>Unlock Unauthorized</h3>
         </template>
         <template #body-content>
             <p>
                 These items were locked by '{{ lockedData?.user || 'another user' }}'. Only they or an administrator (System Manager) can unlock them.
             </p>
         </template>
         <template #actions>
              <Button
                 variant="subtle"
                 @click="showUnauthorizedDialog = false"
             >
                 Close
             </Button>
         </template>
     </Dialog>

  </div>
  <div v-else-if="projectResource?.loading" class="p-6 text-center text-gray-500">
     <div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-transparent mx-auto mb-2"></div>
     Loading Project Data...
   </div>
   <div v-else-if="projectResource?.error" class="p-6 text-center text-red-500">
     Error loading project data: {{ projectResource.error }}
   </div>
   <div v-else class="p-6 text-center text-gray-500">
     Project data not available.
   </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { session } from '@/data/session'; // Adjust path if necessary
import { Button, Dialog, FeatherIcon, Tooltip } from 'frappe-ui';

// Define Props
const props = defineProps({
  projectResource: { // Expected to be the object from createDocumentResource
    type: Object,
    required: true,
    validator: (value) => value && typeof value === 'object' && typeof value.doc !== 'undefined',
  },
});

// --- Component State ---
const lockStatusMessage = ref('');
const lockStatusClass = ref('');
const showLockDialog = ref(false);
const showUnauthorizedDialog = ref(false);
const googleSheetIframe = ref(null);
const isInitializing = ref(true); // Tracks initial setup/check phase
const setupError = ref(null); // Specific error during ensureSetup call
const iframeLoadError = ref(null); // Specific error for iframe loading

// --- Computed Properties ---

const googleSheetUrl = computed(() => props.projectResource?.getSheetUrl?.data || '');
const sheetLoading = computed(() => isInitializing.value || (props.projectResource?.getSheetUrl?.loading ?? false));
const sheetError = computed(() => setupError.value || props.projectResource?.getSheetUrl?.error || iframeLoadError.value || null);

const isLocked = computed(() => {
  const locked = props.projectResource?.doc?.locked;
  return locked && typeof locked === 'string' && locked.trim() !== '' && locked !== '[]' && locked !== '{}';
});

const lockedData = computed(() => {
    if (!isLocked.value || !props.projectResource?.doc?.locked) return null;
    try {
        return JSON.parse(props.projectResource.doc.locked);
    } catch (e) {
        console.error("Computed: Failed to parse locked data:", e, "Data:", props.projectResource.doc.locked);
        return { error: "Invalid lock data format" };
    }
});

const canUnlock = computed(() => {
    const data = lockedData.value;
    if (!isLocked.value || !data || data.error) return false;
    if (session.user === data.user) return true;
    if (session.roles?.includes('System Manager')) return true;
    return false;
});

const lockedRows = computed(() => {
    const data = lockedData.value;
    if (!isLocked.value || !data || data.error || !Array.isArray(data.data?.rows)) return [];
    return data.data.rows.map((row, index) => ({
        id: `locked-row-${index}-${row['Item Name']?.replace(/\s+/g, '-') || index}`,
        ...row
    }));
});

const tableHeaders = computed(() => [
    { key: 'Item Name', label: 'Item', icon: 'box', align: 'left' },
    { key: 'Description', label: 'Description', align: 'left'},
    { key: 'Qty', label: 'Qty', align: 'right' },
    { key: 'UOM', label: 'UOM', align: 'left' },
    { key: 'Width', label: 'Width', align: 'right' },
    { key: 'Height', label: 'Height', align: 'right' },
    { key: 'Area', label: 'Area', align: 'right' },
    { key: 'Amount', label: 'Amount', align: 'right' },
    { key: 'Total', label: 'Total', align: 'right' },
    { key: 'Vat Amount', label: 'VAT', align: 'right' },
    { key: 'Grand Total', label: 'Grand Total', align: 'right' }
]);

// --- Helper Methods ---

function formatDate(isoTimestamp) {
  if (!isoTimestamp) return 'N/A';
  try {
    return new Date(isoTimestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
  } catch (e) { return isoTimestamp; }
}

function formatNumber(value, key) {
    if (typeof value !== 'number') return value;
    let options = { minimumFractionDigits: 0, maximumFractionDigits: 0 };
    if (['Amount', 'Total', 'Vat Amount', 'Grand Total'].includes(key)) {
        options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    } else if (['Width', 'Height', 'Area'].includes(key)) {
        options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    } else if (key === 'Qty') {
         options = { minimumFractionDigits: 0, maximumFractionDigits: 0 };
    }
    try { return value.toLocaleString(undefined, options); }
    catch (e) { return value; }
}

// --- Core Methods ---

async function fetchSheetUrl() {
    if (!props.projectResource?.getSheetUrl || !props.projectResource?.doc?.google_sheet_id) {
        return;
    }
    iframeLoadError.value = null;
    try {
        await props.projectResource.getSheetUrl.submit();
        if (props.projectResource.getSheetUrl.error) throw props.projectResource.getSheetUrl.error;
        if (!props.projectResource.getSheetUrl.data) throw new Error("Backend returned an empty URL.");
    } catch (error) {
        console.error("Error fetching Google Sheet URL:", error);
    }
}

async function initializeSheetIntegration() {
    if (isLocked.value || !props.projectResource?.ensureSetup || !props.projectResource?.doc?.name) {
        isInitializing.value = false;
        return;
    }
    isInitializing.value = true;
    setupError.value = null;
    iframeLoadError.value = null;
    try {
        await props.projectResource.ensureSetup.submit();
        if (props.projectResource.ensureSetup.error) throw props.projectResource.ensureSetup.error;
        await nextTick(); // Wait for potential auto-reload of doc
        if (props.projectResource.doc.google_sheet_id && props.projectResource.doc.extraction_named_range) {
            await fetchSheetUrl();
        } else {
            throw new Error("Google Sheet configuration is incomplete after setup attempt.");
        }
    } catch (error) {
        console.error("Error during sheet initialization:", error);
        setupError.value = `Failed to initialize Google Sheet: ${error?.message || "Unknown error"}`;
    } finally {
        isInitializing.value = false;
    }
}

function onSheetLoadSuccess() {
    console.log("Google Sheet iframe loaded successfully.");
    iframeLoadError.value = null;
}

function onSheetLoadError(event) {
    console.error("Google Sheet iframe load error:", event);
    if (!sheetError.value) {
       iframeLoadError.value = "Could not load the Google Sheet iframe content. Check network, permissions, or browser console.";
    }
    isInitializing.value = false;
}

function handleLockClick() {
    lockStatusMessage.value = '';
    if (isLocked.value) {
        if (canUnlock.value) { showLockDialog.value = true; }
        else { showUnauthorizedDialog.value = true; }
    } else {
        if (props.projectResource?.doc?.google_sheet_id && props.projectResource?.doc?.extraction_named_range) {
            showLockDialog.value = true;
        } else {
             console.error("Locking failed: Google Sheet ID or Named Range not set.");
        }
    }
}

async function handleLockConfirm() {
    const action = isLocked.value ? 'Unlocking' : 'Locking';
    lockStatusMessage.value = `${action}...`;
    lockStatusClass.value = 'text-blue-600';
    try {
        const result = await props.projectResource.setLock.submit({ lock: !isLocked.value });
        if (props.projectResource.setLock.error) throw props.projectResource.setLock.error;
        // Assuming backend modifies doc, resource watcher handles UI update
        lockStatusMessage.value = result?.message || `${action} successful`;
        lockStatusClass.value = 'text-green-600';
        setTimeout(() => {
            if (lockStatusClass.value === 'text-green-600') lockStatusMessage.value = '';
        }, 5000);
    } catch (error) {
        console.error(`Error during ${action}:`, error);
        lockStatusMessage.value = `Error: ${error?.message || `${action} failed.`}`;
        lockStatusClass.value = 'text-red-600';
    } finally {
        showLockDialog.value = false;
    }
}

// --- Watchers ---

// Watch doc for changes (initial load, reload after mutation)
watch(() => props.projectResource?.doc, (newDoc, oldDoc) => {
    if (!newDoc) {
        isInitializing.value = true;
        setupError.value = null;
        iframeLoadError.value = null;
        return;
    }
    if (newDoc.name && isInitializing.value) {
         if (!isLocked.value) {
             initializeSheetIntegration();
         } else {
             isInitializing.value = false;
         }
    } else if (newDoc.name && !isInitializing.value) {
         // Handle becoming unlocked after initial load
         if (oldDoc?.locked && !newDoc.locked) {
             initializeSheetIntegration();
         }
    }
}, { immediate: true, deep: false });

// Watch resource prop itself for navigation changes
watch(() => props.projectResource, (newResource, oldResource) => {
    if (newResource !== oldResource) {
        lockStatusMessage.value = '';
        setupError.value = null;
        iframeLoadError.value = null;
        showLockDialog.value = false;
        showUnauthorizedDialog.value = false;
        isInitializing.value = true; // Let doc watcher handle init
    }
}, { immediate: false });

// --- Lifecycle Hooks ---
onMounted(() => {
    // Initialization logic driven by immediate doc watcher
});

</script>

<style scoped>
/* Styles remain the same */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
iframe {
    border-color: #e5e7eb; /* border-gray-200 */
}
</style>
