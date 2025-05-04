<template>
  <div class="p-6 space-y-6">
    <div v-if="!props.projectResource.doc && !props.projectResource.list?.loading" class="flex justify-center py-12 text-gray-500">
       <span>No project data loaded.</span>
    </div>
     <div v-else-if="!props.projectResource.doc && props.projectResource.list?.loading" class="flex justify-center py-12">
      <LoadingIndicator />
    </div>

    <template v-else-if="props.projectResource.doc">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Project Branches</h1>
        <Button
          variant="solid"
          theme="gray"
          @click="showNewBranch = true"
          :disabled="creating"
        >
          <template #prefix>
            <FeatherIcon name="plus" class="w-4 h-4" />
          </template>
          New Branch
        </Button>
      </div>

      <div v-if="isLoadingBranches" class="flex justify-center py-16 bg-white rounded-lg shadow-sm">
           <div class="text-center">
              <LoadingIndicator size="lg" />
              <p class="mt-2 text-gray-600">Loading branches...</p>
           </div>
       </div>

      <div v-else-if="!isLoadingBranches && !branches.length" class="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm">
        <div class="text-center max-w-md">
          <div class="bg-gray-100 rounded-full p-6 inline-block mb-6">
            <FeatherIcon name="git-branch" class="w-12 h-12 text-gray-900" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">No Branches Created</h3>
          <p class="text-gray-600 mb-6">
            This project doesn't have any branches yet. Create a new branch to expand your project.
          </p>
          <Button
            variant="solid"
            theme="gray"
            @click="showNewBranch = true"
            :disabled="creating"
          >
            Create First Branch
          </Button>
        </div>
      </div>

      <div v-else class="space-y-6 max-w-4xl mx-auto">
        <div
          v-for="(project, index) in branches"
          :key="project.name"
          class="relative group"
        >
          <div
            v-if="index !== branches.length - 1"
            class="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 group-last:hidden"
          ></div>

          <div
            class="relative flex items-start p-6 bg-white rounded-lg transition-all border-2 border-white duration-300 ease-in-out hover:border-gray-900 cursor-pointer"
            @click="router.push(`/project/${project.name}/overview`)"
          >
            <div
              class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 border border-gray-200"
              :class="{
                'bg-purple-50': project.status === 'Tender',
                'bg-blue-50': project.status === 'Job in Hand',
                'bg-yellow-50': project.status === 'In Progress',
                'bg-green-50': project.status === 'Completed',
                'bg-red-50': project.status === 'Cancelled',
              }"
            >
              <FeatherIcon
                :name="getStatusIcon(project.status)"
                class="w-6 h-6"
                :class="{
                  'text-purple-600': project.status === 'Tender',
                  'text-blue-600': project.status === 'Job in Hand',
                  'text-yellow-600': project.status === 'In Progress',
                  'text-green-600': project.status === 'Completed',
                  'text-red-600': project.status === 'Cancelled',
                }"
              />
            </div>

            <div class="flex-grow">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ project.project_name }}
                </h3>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-purple-50 text-purple-800': project.status === 'Tender',
                    'bg-blue-50 text-blue-800': project.status === 'Job in Hand',
                    'bg-yellow-50 text-yellow-800': project.status === 'In Progress',
                    'bg-green-50 text-green-800': project.status === 'Completed',
                    'bg-red-50 text-red-800': project.status === 'Cancelled',
                  }"
                >
                  {{ project.status }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Progress</span>
                    <span class="font-medium text-gray-900">
                      {{ Math.round(project.completion || 0) }}%
                    </span>
                  </div>
                  <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-300"
                      :class="{
                        'bg-purple-500': project.status === 'Tender',
                        'bg-blue-500': project.status === 'Job in Hand',
                        'bg-yellow-500': project.status === 'In Progress',
                        'bg-green-500': project.status === 'Completed',
                        'bg-red-500': project.status === 'Cancelled',
                      }"
                      :style="{
                        width: `${Math.round(project.completion || 0)}%`,
                      }"
                    ></div>
                  </div>
                </div>

                <div class="flex items-center justify-end">
                  <div class="text-right">
                    <div class="text-sm text-gray-600">Contract Value</div>
                    <div class="font-semibold text-gray-900">
                      {{ formatCurrency(project.contract_value) }}
                    </div>
                  </div>
                </div>
              </div>

              <p class="text-sm text-gray-600 line-clamp-2">
                {{ project.description || 'No description available' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        v-model="showNewBranch"
        :options="{
          title: 'Create New Branch',
          size: 'md',
          actions: [
            {
              label: 'Create Branch',
              variant: 'solid',
              theme: 'gray',
              loading: creating,
              onClick: createBranch,
              // Disable button if fields missing OR if parent doc is missing
              disabled: !newProject.additional_work || !props.projectResource.doc || creating,
            },
          ],
        }"
      >
        <template #body-content>
          <div class="space-y-6">
            <div v-if="props.projectResource.doc" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div class="text-sm text-gray-500">Parent Project</div>
              <div class="font-semibold text-gray-900 mt-1">
                {{ props.projectResource.doc.project_name }}
              </div>
              <div class="text-sm text-gray-600 mt-1">
                {{ props.projectResource.doc.location }}
              </div>
            </div>
             <div v-else class="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
                Error: Parent project data not available. Cannot create branch.
            </div>

            <FormControl
              type="text"
              label="Additional Work Name"
              v-model="newProject.additional_work"
              placeholder="e.g., Handrails for staircase"
              required
            />
          </div>
        </template>
      </Dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
// Adjust imports based on your actual Frappe UI setup
import {
  Button,
  FeatherIcon,
  LoadingIndicator,
  Dialog,
  FormControl,
  createListResource // Import the resource creator
} from 'frappe-ui';
// Keep the original projectResource if it's used for parent data or general inserts
import { projectResource as mainProjectResource } from '@/data/project'; // Renamed to avoid conflict
import { formatCurrency } from '@/utils/format'; // Ensure this utility exists

const props = defineProps({
  // This prop likely holds the *parent* project document resource or its data
  projectResource: {
    type: Object,
    required: true,
  },
  // isCollapsed prop seems unused in the provided template logic, but keep if needed elsewhere
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();
const showNewBranch = ref(false);
const creating = ref(false); // Tracks the creation process state
const newProject = ref({
  additional_work: '',
});

// --- Dedicated Resource for Branches ---
const branchesResource = ref(null); // Holds the createListResource instance

// Watch the parent project's name to initialize or update the branches resource
watch(() => props.projectResource.doc?.name, (newParentName, oldParentName) => {
  // Only proceed if we have a valid parent project name
  if (newParentName) {
    // Create or update the resource if it doesn't exist OR if the parent name has changed
    if (!branchesResource.value || newParentName !== oldParentName) {
      // console.log(`Initializing/Updating branches resource for parent: ${newParentName}`);
      branchesResource.value = createListResource({
        doctype: 'RUA Project',
        fields: ['*'],
        filters: {
          parent1: newParentName, // Filter by the parent project name
          is_child: 1            // Ensure we only get child projects (branches)
        },
        auto: true
      });
    }


  } else {
    branchesResource.value = null;
  }
}, {
  immediate: true 
});

// Computed property gets data directly from the dedicated branches resource
const branches = computed(() => {
  return branchesResource.value?.data || []; // Default to empty array if resource/data is null
});

// Computed property for loading state based on the dedicated resource
const isLoadingBranches = computed(() => {
  // Consider loading if the resource is null (being initialized) or actively loading
  return !branchesResource.value || branchesResource.value.list.loading;
});

// --- Create Branch Function ---
async function createBranch() {
  // Guard clauses for missing input or parent data
  if (!newProject.value.additional_work) {
      console.error("Additional work name is required.");
      // Optionally show a user notification
      return;
  }
   if (!props.projectResource.doc) {
      console.error("Parent project data is not available. Cannot create branch.");
      // Optionally show a user notification
      return;
  }

  creating.value = true; // Set loading state for the button
  try {
    // *** IMPORTANT: Use the correct resource for INSERT operation ***
    // This assumes the `projectResource` passed in props can handle insertions
    // for the 'Project' doctype. If not, adjust accordingly.
    // It might even be `branchesResource.value.insert.submit` if that's how it's set up.
    await mainProjectResource.insert.submit({ // Using the imported mainProjectResource
      // Required fields for a child project
      project_name: `${newProject.value.additional_work}: ${props.projectResource.doc.project_name}`,
      is_child: 1,
      parent1: props.projectResource.doc.name, // Link to the parent project
      status: 'Tender', // Default status for new branches

      // Inherited fields from parent (verify these are correct)
      location: props.projectResource.doc.location || '',
      retention_status: props.projectResource.doc.retention_status,
      retention_percentage: props.projectResource.doc.retention_percentage,
      enable_retention_invoicing: props.projectResource.doc.enable_retention_invoicing,
      coords: props.projectResource.doc.coords,
      parties: props.projectResource.doc.parties, // Be cautious inheriting complex fields like tables (parties)

      // Default description or based on input
      description: `Additional work (${newProject.value.additional_work}) for ${props.projectResource.doc.project_name}`,
    });

    // Reset state and close dialog on success
    showNewBranch.value = false;
    newProject.value = { additional_work: '' };

    // Reload the DEDICATED branches list to show the new entry
    if (branchesResource.value) {
      // console.log("Reloading branches list after creation...");
      await branchesResource.value.reload();
    } else {
      console.warn("Branches resource not available to reload after creation.");
    }

  } catch (error) {
    console.error('Error creating branch:', error);
    // Optionally: Show an error message to the user via a notification system
    // frappe.msgprint({ title: 'Error', indicator: 'red', message: `Could not create branch: ${error.message}` });
  } finally {
    creating.value = false; // Reset button loading state
  }
}

// --- Helper Functions ---
function getStatusIcon(status) {
  const icons = {
    'Tender': 'file-text',
    'Job in Hand': 'briefcase',
    'In Progress': 'clock',
    'Completed': 'check-circle',
    'Cancelled': 'x-circle',
  };
  return icons[status] || 'circle'; // Default icon
}

// Make sure formatCurrency is correctly imported or defined
// Example placeholder if not imported:
// function formatCurrency(value) {
//   if (value == null) return 'N/A';
//   // Replace with your actual currency formatting logic
//   return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
// }

</script>